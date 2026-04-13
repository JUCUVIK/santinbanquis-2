import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './compra.component.html',
  styles: ``
})
export class CompraComponent implements OnInit {
  reserva: any;

  constructor(
    private toastService: ToastService, 
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const saved = localStorage.getItem('reserva_en_curso');
    if (saved) {
      this.reserva = JSON.parse(saved);
    } else {
      // Fallback a reserva de prueba si se entra directamente
      this.reserva = {
        centroId: 'demo',
        centro: 'Saltimbanquis club Prueba',
        fecha: '2026-11-15',
        hora: '18:00',
        entradas: [
          { tipo: 'Junior/Adulto (1h)', precio: 10, cantidad: 2 }
        ],
        total: 20
      };
    }
  }

  get centroNombre() {
    return this.reserva?.centro || 'Centro no especificado';
  }

  onPay() {
    this.toastService.show('Procesando pago y confirmando reserva...');

    setTimeout(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const rawItems = this.reserva.rawItems || [];
          const listadoEntradas = rawItems.length > 0 
            ? JSON.stringify(rawItems)
            : this.reserva.entradas.map((e: any) => `${e.cantidad}x ${e.tipo}`).join(', ');
            
          const pdfBase64 = localStorage.getItem('consentimiento_temporal') || '';

          const nuevaReserva = {
             usuarioId: user.email,
             numeroReserva: Math.floor(10000 + Math.random() * 90000).toString(),
             centro: this.centroNombre,
             fecha: `${this.reserva.fecha} - ${this.reserva.hora} (Aprox)`,
             entradas: listadoEntradas,
             estado: 'Próxima',
             total: this.reserva.total,
             consentimientoPdfBase64: pdfBase64
          };

          this.http.post('http://localhost:5085/api/reservas', nuevaReserva).subscribe({
            next: () => {
              localStorage.removeItem('reserva_en_curso');
              localStorage.removeItem('consentimiento_temporal');
              this.toastService.show('¡Pago completado! Reserva finalizada con éxito.', 'success');
              this.router.navigate(['/area-cliente']);
            },
            error: (err) => {
              console.error('Error guardando reserva en API', err);
              this.toastService.show('Pago realizado pero error al guardar. Verifica luego.', 'error');
              this.router.navigate(['/area-cliente']);
            }
          });
        } else {
             // Fallback local
             this.toastService.show('¡Pago completado! (Modo invitado)', 'success');
             localStorage.removeItem('reserva_en_curso');
             this.router.navigate(['/tarifas']);
        }
    }, 2000);
  }
}
