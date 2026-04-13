import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-barajas',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './barajas.component.html',
  styles: ``
})
export class BarajasComponent {
  constructor(private toastService: ToastService) {}

  onConsult(msg: string = 'Contáctanos para preparar tu reserva') {
    this.toastService.show(msg);
  }
}
