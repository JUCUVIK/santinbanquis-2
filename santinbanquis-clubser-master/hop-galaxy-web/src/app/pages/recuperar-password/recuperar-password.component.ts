import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './recuperar-password.component.html',
  styles: `
    :host {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6rem 2rem 3rem;
    }
  `
})
export class RecuperarPasswordComponent {

  constructor(private toastService: ToastService, private router: Router) {}

  onRecover() {
    this.toastService.show('Instrucciones enviadas a tu correo electrónico.');
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}
