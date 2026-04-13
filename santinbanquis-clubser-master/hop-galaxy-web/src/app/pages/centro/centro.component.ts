import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-centro',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tarifas-wrap" *ngIf="centro">
      <div class="tarifas-header" style="margin-bottom: 2rem;">
        <div class="section-tag" style="color: var(--primary); font-size: 0.9rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">{{ centro.nombre }}</div>
        <h2 style="font-size: 2.5rem; color: var(--text-dark); margin-bottom: 0.5rem;">Servicios Disponibles</h2>
        <p style="color:var(--text-muted);">{{ centro.ubicacion }}</p>
      </div>

      <div class="tarifa-tabs">
        <button class="ttab" [class.active]="activeTab === 'juego'" (click)="setTab('juego')">Juego libre</button>
        <button class="ttab" [class.active]="activeTab === 'cumple'" (click)="setTab('cumple')">Cumpleaños</button>
        <button class="ttab" [class.active]="activeTab === 'excursion'" (click)="setTab('excursion')">Excursiones</button>
      </div>

      <div class="tarifa-grid">
        @for (tarifa of tarifasFiltradas; track tarifa.id) {
        <div class="tarifa-card" [class.featured]="tarifa.destacado">
          @if (tarifa.destacado) {
          <div class="featured-tag">{{ tarifa.etiquetaDestacado }}</div>
          }
          <div class="tarifa-icon">
            <img [src]="tarifa.imagenUrl" [alt]="tarifa.nombre"
                 style="width: 160px; height: 160px; object-fit: cover; border-radius: 50%; margin: 0 auto; display: block;">
          </div>
          <div class="tarifa-name">{{ tarifa.nombre }}</div>
          <div class="tarifa-who">{{ tarifa.subtitulo }}</div>
          <div class="tarifa-price" *ngIf="tarifa.precio === 0">Gratis<span></span></div>
          <div class="tarifa-price" *ngIf="tarifa.precio > 0">{{ tarifa.precio }}<span>{{ tarifa.sufijoPrecio }}</span></div>
          <div class="tarifa-note" style="margin-bottom: 1rem;">{{ tarifa.nota }}</div>
          <button class="btn-submit" style="margin-top: auto; padding: 0.8rem; font-size: 0.9rem;" (click)="reservar(tarifa)">RESERVAR</button>
        </div>
        }
      </div>
    </div>
    <div *ngIf="!centro" style="padding: 5rem; text-align: center;">
      <p>Cargando centro...</p>
    </div>
  `,
  styles: [`
    .tarifas-wrap { padding: 4rem 5%; max-width: 1200px; margin: 0 auto; }
    .tarifa-grid { display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); }
    .tarifa-card { background: white; padding: 2.5rem 2rem; border-radius: 1.5rem; text-align: center; border: 1px solid rgba(0,0,0,0.05); transition: transform 0.3s, box-shadow 0.3s; position: relative; overflow: hidden; display: flex; flex-direction: column; }
    .tarifa-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); border-color: rgba(255, 114, 94, 0.2); }
    .tarifa-card.featured { border-color: var(--primary); box-shadow: 0 10px 30px rgba(255, 114, 94, 0.15); }
    .featured-tag { position: absolute; top: 1.5rem; right: -2rem; background: var(--primary); color: white; padding: 0.4rem 3rem; font-size: 0.8rem; font-weight: 700; transform: rotate(45deg); letter-spacing: 1px; }
    .tarifa-icon { width: 160px; height: 160px; margin: 0 auto 1.5rem; background: #fff5f4; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .tarifa-name { font-size: 1.5rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.5rem; }
    .tarifa-who { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; }
    .tarifa-price { font-size: 3rem; font-weight: 800; color: var(--primary); font-family: 'Outfit', sans-serif; display: flex; align-items: baseline; justify-content: center; gap: 0.2rem; }
    .tarifa-price span { font-size: 1rem; color: var(--text-muted); font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .tarifa-note { font-size: 0.9rem; color: var(--text-muted); margin-top: 1rem; }
  `]
})
export class CentroComponent implements OnInit {
  centro: any;
  tarifas: any[] = [];
  tarifasCentro: any[] = [];
  activeTab: 'juego' | 'cumple' | 'excursion' = 'juego';

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  get tarifasFiltradas() {
    return this.tarifasCentro.filter(t => t.categoria === this.activeTab);
  }

  setTab(tab: 'juego' | 'cumple' | 'excursion') {
    this.activeTab = tab;
  }

  ngOnInit() {
    this.http.get<any[]>('http://localhost:5085/api/tarifas').subscribe(tarifas => {
      this.tarifas = tarifas;

      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.http.get<any[]>('http://localhost:5085/api/centros').subscribe(centros => {
            this.centro = centros.find(c => (c._id || c.id) === id);
            if (this.centro && this.centro.tarifasIds) {
              this.tarifasCentro = this.tarifas.filter(t => this.centro.tarifasIds.includes(t._id || t.id));
            } else {
              this.tarifasCentro = [];
            }
          });
        }
      });
    });
  }

  reservar(tarifa: any) {
    if(this.centro) {
      this.router.navigate(['/reserva'], { queryParams: { centroId: this.centro._id || this.centro.id, tarifaId: tarifa._id || tarifa.id } });
    }
  }
}
