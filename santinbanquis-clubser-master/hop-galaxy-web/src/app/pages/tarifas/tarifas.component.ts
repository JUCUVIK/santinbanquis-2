import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tarifas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarifas.component.html',
  styles: ``
})
export class TarifasComponent implements OnInit {
  activeTab: 'juego' | 'cumple' | 'excursion' = 'juego';
  tarifas: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:5085/api/tarifas').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.tarifas = data;
        }
      },
      error: (err) => {
        console.error('Error cargando tarifas desde API', err);
      }
    });
  }

  get tarifasFiltradas() {
    return this.tarifas.filter(t => t.categoria === this.activeTab);
  }

  setTab(tab: 'juego' | 'cumple' | 'excursion') {
    this.activeTab = tab;
  }

  reservar(tarifa: any) {
    this.router.navigate(['/reserva'], { queryParams: { tarifaId: tarifa._id || tarifa.id } });
  }
}
