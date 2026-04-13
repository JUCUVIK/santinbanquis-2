import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

declare var google: any;

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styles: `
    :host {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6rem 2rem 3rem;
    }

    .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
  `
})
export class RegistroComponent implements OnInit {

  registroData = {
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    password: '',
    centroFavorito: ''
  };

  centros: any[] = [];

  private apiUrl = 'http://localhost:5085/api/register';

  constructor(
    private toastService: ToastService, 
    private router: Router,
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:5085/api/centros').subscribe(data => {
      this.centros = data || [];
      if (this.centros.length > 0) {
        this.registroData.centroFavorito = this.centros[0]._id || this.centros[0].id;
      }
    });

    try {
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: "776559406339-bnesh1bb3b0rbm1rlvpvmikf90mbvete.apps.googleusercontent.com",
          callback: this.handleGoogleResponse.bind(this)
        });
        google.accounts.id.renderButton(
          document.getElementById("google-btn-register"),
          { theme: "outline", size: "large", width: "100%", text: "continue_with" }
        );
      }
    } catch (e) {
      console.warn("Google Accounts SDK no cargado.");
    }
  }

  handleGoogleResponse(response: any) {
    const token = response.credential;
    if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        
        const payload = JSON.parse(jsonPayload);
        
        // El endpoint /api/login/google también registra si no existe
        this.http.post('http://localhost:5085/api/login/google', {
            email: payload.email,
            nombre: payload.given_name,
            apellidos: payload.family_name || payload.name,
            googleId: payload.sub
        }).subscribe({
             next: (res: any) => {
                 const userObj = res.user || { 
                   email: payload.email, 
                   nombre: payload.given_name,
                   id: res.id,
                   apellidos: payload.family_name
                 };
                 this.apiService.updateUserProfile(userObj).subscribe();
                 this.toastService.show('¡Cuenta creada y validada con Google! 🚀');
                 this.router.navigate(['/area-cliente']);
             },
             error: (err) => {
                 console.error('Error con Google login:', err);
                 this.toastService.show("Error al registrar con Google.");
             }
        });
    }
  }

  onRegister() {
    // Aquí hacemos la llamada post a la API Minimal (PHP o .NET)
    const payload = {
      ...this.registroData,
      contrasena: this.registroData.password
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: (response: any) => {
        if (response && response.error === false) {
          this.toastService.show('¡Cuenta creada con éxito! Bienvenido 🚀');
          
          // Guardar sesión para no pedir login inmediato
          const userObj = {
            email: this.registroData.email,
            nombre: this.registroData.nombre,
            apellidos: this.registroData.apellidos,
            telefono: this.registroData.telefono,
            centroFavorito: this.registroData.centroFavorito
          };
          this.apiService.updateUserProfile(userObj).subscribe();

          setTimeout(() => {
            this.router.navigate(['/area-cliente']);
          }, 1500);
        } else {
          this.toastService.show('Error: ' + response.message);
        }
      },
      error: (err) => {
        console.error('Error al registrar usuario', err);
        const errMsg = err.error?.message || err.error?.title || err.message || 'Inténtalo de nuevo.';
        this.toastService.show('Hubo un error al crear la cuenta: ' + errMsg);
      }
    });
  }
}


