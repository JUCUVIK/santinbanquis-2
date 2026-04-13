import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styles: ``
})
export class ToastComponent {
  toastService = inject(ToastService);
  message = this.toastService.message;
  visible = this.toastService.visible;
}
