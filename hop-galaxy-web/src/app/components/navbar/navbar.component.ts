import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styles: ``
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isLoggedIn = false;
  centros: any[] = [];

  constructor(private toastService: ToastService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:5085/api/centros').subscribe({
      next: (data) => this.centros = data || [],
      error: (err) => console.error('Error cargando centros', err)
    });

    // Check if user is logged in
    this.checkLoginStatus();

    // Listen for storage changes in case login happens in another tab or we want a simple update mechanism
    window.addEventListener('storage', () => {
      this.checkLoginStatus();
    });

    // Alternatively, you can use a more robust state management or service to track login status
    // For simplicity, checking localStorage on init and route changes is often sufficient for basic apps.
    this.router.events.subscribe(() => {
        this.checkLoginStatus();
    });
  }

  checkLoginStatus() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.isLoggedIn = !!localStorage.getItem('currentUser');
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onReservaClick() {
    this.closeMenu();
    this.toastService.show('¡Redirigiendo al sistema de reservas!');
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    this.isLoggedIn = false;
    this.toastService.show('Sesión cerrada correctamente.');
    this.router.navigate(['/']);
    this.closeMenu();
  }
}


