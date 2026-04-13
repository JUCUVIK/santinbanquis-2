import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [],
  templateUrl: './promociones.component.html',
  styles: ``
})
export class PromocionesComponent {

  constructor(private toastService: ToastService) {}

  onBuyPromo() {
    this.toastService.show('Redirigiendo a la pasarela de pago de la promoción...');
  }
}
