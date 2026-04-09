import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styles: ``
})
export class ContactoComponent implements OnInit {
  centros: any[] = [];
  selectedCentro: string = '';
  nombre: string = '';
  email: string = '';
  mensaje: string = '';

  constructor(
    private toastService: ToastService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:5085/api/centros').subscribe(data => {
      this.centros = data || [];
      if (this.centros.length > 0) {
        this.selectedCentro = this.centros[0]._id || this.centros[0].id;
      }
    });

    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.nombre = user.nombre || user.email || '';
        this.email = user.email || '';
      } catch (e) {}
    }
  }

  onSubmit() {
    if (!this.nombre || !this.email || !this.mensaje) {
      this.toastService.show('Por favor, completa todos los campos.');
      return;
    }

    const payload = {
      Nombre: this.nombre,
      Email: this.email,
      CentroId: this.selectedCentro,
      Mensaje: this.mensaje
    };

    this.http.post('http://localhost:5085/api/contacto', payload).subscribe({
      next: () => {
        this.toastService.show('¡Mensaje enviado a ' + this.getCentroName(this.selectedCentro) + ' pronto te responderemos! 🚀');
        this.mensaje = ''; // limpiamos el mensaje
      },
      error: () => this.toastService.show('Error al enviar el mensaje, inténtalo más tarde.')
    });
  }

  getCentroName(id: string): string {
    const c = this.centros.find(x => (x._id || x.id) === id);
    return c ? c.nombre : '';
  }
}
