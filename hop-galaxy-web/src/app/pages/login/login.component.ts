import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
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

    .error-alert {
        background-color: #fee2e2;
        color: #b91c1c;
        border: 1px solid #f87171;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
        font-size: 0.95rem;
        font-weight: bold;
        text-align: center;
    }
  `
})
export class LoginComponent implements OnInit {

  loginData = {
    email: '',
    password: ''
  };

  errorMessage: string | null = null;
  private apiUrl = 'http://localhost:5085/api/login';
  private googleInitialized = false;

  constructor(
    private toastService: ToastService, 
    private router: Router,
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    try {
      if (typeof google !== 'undefined') {
        if (!this.googleInitialized) {
          google.accounts.id.initialize({
            client_id: "776559406339-bnesh1bb3b0rbm1rlvpvmikf90mbvete.apps.googleusercontent.com", 
            callback: this.handleGoogleResponse.bind(this)
          });
          this.googleInitialized = true;
        }
        google.accounts.id.renderButton(
          document.getElementById("google-btn"),
          { theme: "outline", size: "large", width: 250, text: "continue_with" }
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
        
        // Enviar a la API Minimal para verificar e iniciar sesión (o registrar)
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
                 this.toastService.show('¡Login exitoso con Google! 🚀');
                 this.router.navigate(['/area-cliente']);
             },
             error: (err) => {
                 console.error('Error con Google login:', err);
                 this.errorMessage = "Error al iniciar sesión con Google o la cuenta está bloqueada.";
             }
        });
    }
  }

  onLogin() {
    this.errorMessage = null; // Limpiar errores previos

    // Crear una copia de los datos mandando 'contrasena' por si la API .NET lo requiere así
    const payload = {
      ...this.loginData,
      contrasena: this.loginData.password
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: (response: any) => {
        // Validamos si la API devolvió una respuesta con flags de errores (incluso en HTTP 200)
        // O si devuelve un mensaje típico de error/incorrecto
        const isErrorFlag = response && (response.error === true || response.success === false || response.isSuccess === false);
        const isErrorMessage = response && response.message && (
          response.message.toLowerCase().includes('incorrect') || 
          response.message.toLowerCase().includes('inválid') ||
          response.message.toLowerCase().includes('fail') ||
          response.message.toLowerCase().includes('error')
        );

        if (isErrorFlag || isErrorMessage) {
          this.errorMessage = response.message || 'Credenciales inválidas.';
        } else {
          // Guardar sesión del usuario
          const userObj = response.user ? response.user : { ...response, email: response.email || this.loginData.email };
          this.apiService.updateUserProfile(userObj).subscribe();

          this.toastService.show('¡Login exitoso! Bienvenido de nuevo 🚀');
          // Podrías guardar la sesión del usuario aquí (localStorage)
          setTimeout(() => {
            this.router.navigate(['/area-cliente']);
          }, 1000);
        }
      },
      error: (err) => {
        console.error('Error al iniciar sesión', err);
        this.errorMessage = err.error?.message || err.error?.title || err.message || 'Credenciales inválidas o no se pudo conectar al servidor.';
      }
    });
  }
}
