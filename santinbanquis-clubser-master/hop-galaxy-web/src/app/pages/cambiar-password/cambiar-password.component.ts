import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './cambiar-password.component.html',
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
export class CambiarPasswordComponent {

  constructor(private toastService: ToastService, private router: Router) {}

  onChangePassword() {
    this.toastService.show('Contraseña actualizada correctamente.');
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}
