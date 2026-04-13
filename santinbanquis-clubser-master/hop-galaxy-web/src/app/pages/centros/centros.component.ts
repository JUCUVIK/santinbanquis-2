import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-centros',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="contact-wrap">
      <div class="section-tag">Nuestros Centros</div>
      <h2>Saltimbanquis club</h2>
      <p style="color:var(--text-muted); margin-bottom:2rem;">Encuentra el centro más cercano y descubre todas las actividades que ofrecemos.</p>
      
      <div class="centros-grid" style="margin-top:0; grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr));">
        <div class="service-card" *ngFor="let c of centros" [routerLink]="['/centro', c._id || c.id]" style="cursor: pointer;">
          <div class="service-img" style="padding:0; overflow:hidden;">
            <img [src]="(c.ofertas && c.ofertas.length > 0 && c.ofertas[0].imagenUrl) ? c.ofertas[0].imagenUrl : 'assets/instalaciones.png'" [alt]="c.nombre" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div class="service-body">
            <h3 style="color: var(--primary);">{{ c.nombre.replace('Saltimbanquis club ', '') }}</h3>
            <p>{{ c.ubicacion }}</p>
            <a class="service-link">Ver centro →</a>
          </div>
        </div>
      </div>
      
      <div *ngIf="centros.length === 0" style="padding: 2rem; text-align: center; color: var(--text-muted);">
        Cargando centros...
      </div>
    </div>
  `,
  styles: [`
    .contact-wrap { padding: 4rem 5%; max-width: 1200px; margin: 0 auto; }
    .section-tag { color: var(--primary); font-size: 0.9rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 1rem; }
    h2 { font-size: 2.5rem; color: var(--text-dark); margin-bottom: 0.5rem; }
    .centros-grid { display: grid; gap: 2rem; }
    .service-card { background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.3s; display: flex; flex-direction: column; }
    .service-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
    .service-img { height: 200px; background: #f3f4f6; }
    .service-body { padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column; }
    .service-body h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .service-body p { color: var(--text-muted); margin-bottom: 1.5rem; flex-grow: 1; font-size: 0.95rem; }
    .service-link { color: var(--primary); text-decoration: none; font-weight: 600; }
  `]
})
export class CentrosComponent implements OnInit {
  centros: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:5085/api/centros').subscribe({
      next: (data) => this.centros = data || [],
      error: (err) => console.error('Error cargando centros', err)
    });
  }
}
