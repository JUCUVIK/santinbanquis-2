import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <header>
        <h1>Panel de Administración Global</h1>
        <p>Gestiona entradas, tarifas y clientes de forma independiente.</p>
      </header>

      <div class="nav-tabs">
        <button [class.active]="activeTab === 'tarifas'" (click)="setTab('tarifas')">Tarifas</button>
        <button [class.active]="activeTab === 'reservas'" (click)="setTab('reservas')">Reservas</button>
        <button [class.active]="activeTab === 'clientes'" (click)="setTab('clientes')">Clientes</button>
        <button [class.active]="activeTab === 'centros'" (click)="setTab('centros')">Centros</button>
      </div>

      <div class="content">
        <!-- TARIFAS -->
        <div *ngIf="activeTab === 'tarifas'">
          <div class="flex-header">
            <h2>Gestión de Tarifas</h2>
            <button class="btn-add" (click)="addTarifa()">+ Nueva Tarifa</button>
          </div>
          <div style="overflow-x: auto;">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Categoría</th>
                  <th>Nombre</th>
                  <th>Subtítulo</th>
                  <th>Precio (€)</th>
                  <th>Sufijo</th>
                  <th>Nota</th>
                  <th>Imagen (URL)</th>
                  <th>Destacado</th>
                  <th>Etiqueta Dest.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of tarifas">
                  <td>{{ t.id || t._id }}</td>
                  <td>
                    <select [(ngModel)]="t.categoria">
                      <option value="juego">Juego libre</option>
                      <option value="cumple">Cumpleaños</option>
                      <option value="excursion">Excursiones</option>
                    </select>
                  </td>
                  <td><input type="text" [(ngModel)]="t.nombre" /></td>
                  <td><input type="text" [(ngModel)]="t.subtitulo" /></td>
                  <td><input type="number" [(ngModel)]="t.precio" style="width: 70px" /></td>
                  <td><input type="text" [(ngModel)]="t.sufijoPrecio" /></td>
                  <td><input type="text" [(ngModel)]="t.nota" /></td>
                  <td><input type="text" [(ngModel)]="t.imagenUrl" /></td>
                  <td style="text-align: center;"><input type="checkbox" [(ngModel)]="t.destacado" /></td>
                  <td><input type="text" [(ngModel)]="t.etiquetaDestacado" [disabled]="!t.destacado" placeholder="Ej: ⭐ Más popular" /></td>
                  <td><button class="btn-delete" (click)="deleteTarifa(t._id || t.id)">Eliminar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- CLIENTES -->
        <div *ngIf="activeTab === 'clientes'">
          <div class="flex-header">
            <h2>Gestión de Clientes</h2>
          </div>
          <table>
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of clientes">
                <td>{{ c._id || c.id }}</td>
                <td>{{ c.nombre }}</td>
                <td>{{ c.email }}</td>
                <td>{{ c.telefono }}</td>
                <td><button class="btn-delete" (click)="deleteCliente(c._id || c.id)">Dar de Baja</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- RESERVAS -->
        <div *ngIf="activeTab === 'reservas'">
          <div class="flex-header">
            <h2>Gestión de Reservas</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nº Reserva</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Centro</th>
                <th>Fecha/Hora</th>
                <th>Entradas (Detalle)</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of reservas">
                <td>{{ r.numeroReserva }}</td>
                <td>{{ r.usuarioId }}</td>
                <td><span style="background:var(--primary);color:#fff;padding:4px 8px;border-radius:4px;font-size:0.8rem;">{{ r.estado }}</span></td>
                <td>{{ r.centro }}</td>
                <td>{{ r.fecha }}</td>
                <td>{{ r.entradas }}</td>
                <td>
                  <button class="btn-delete" (click)="deleteReserva(r.id || r._id)">Cancelar</button>
                </td>
              </tr>
              <tr *ngIf="reservas.length === 0">
                <td colspan="7" style="text-align: center;">No hay reservas registradas</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- CENTROS -->
        <div *ngIf="activeTab === 'centros'">
          <div class="flex-header">
            <h2>Gestión de Centros</h2>
            <button class="btn-add" (click)="addCentro()">+ Nuevo Centro</button>
          </div>

          <div *ngFor="let c of centros" class="centro-card" style="background:#f9fafb; padding:1.5rem; margin-bottom:1.5rem; border-radius:8px; border:1px solid #e5e7eb;">
            <div class="flex-header" style="margin-bottom: 1rem;">
              <h3 style="margin:0; display:flex; align-items:center;">
                Centro: <input type="text" [(ngModel)]="c.nombre" style="font-size:1.1rem; margin-left:10px; width:300px;" />
              </h3>
              <button class="btn-delete" (click)="deleteCentro(c._id || c.id)">Eliminar Centro</button>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label style="font-weight:600; font-size:0.9rem;">Ubicación:</label>
              <input type="text" [(ngModel)]="c.ubicacion" style="width: 100%; margin-top: 0.3rem;" />
            </div>

            <div style="margin-bottom: 1.5rem; display: flex; gap: 1rem;">
              <div style="flex: 1;">
                <label style="font-weight:600; font-size:0.9rem;">Teléfono:</label>
                <input type="text" [(ngModel)]="c.telefono" style="width: 100%; margin-top: 0.3rem;" />
              </div>
              <div style="flex: 1;">
                <label style="font-weight:600; font-size:0.9rem;">Email:</label>
                <input type="email" [(ngModel)]="c.email" style="width: 100%; margin-top: 0.3rem;" />
              </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label style="font-weight:600; font-size:0.9rem;">Descripción (Anotación):</label>
              <input type="text" [(ngModel)]="c.descripcion" style="width: 100%; margin-top: 0.3rem;" placeholder="Ej: El último pase finaliza 15 minutos antes del cierre" />
            </div>

            <div class="ofertas-container" style="background:#ffffff; padding:1rem; border-radius:6px; border:1px solid #e5e7eb;">
              <div class="flex-header" style="margin-bottom:1rem;">
                <h4 style="margin:0;">Tarifas / Servicios Asociados</h4>
              </div>

              <div style="display:flex; flex-wrap:wrap; gap:1rem;">
                <div *ngFor="let t of tarifas" style="display:flex; align-items:center; gap: 0.5rem; background:#f3f4f6; padding:0.5rem 1rem; border-radius:5px; border:1px solid #d1d5db;">
                  <input type="checkbox" [checked]="hasTarifa(c, t._id || t.id)" (change)="toggleTarifa(c, t._id || t.id)" />
                  <span>{{ t.nombre }} ({{ t.categoria }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-actions" *ngIf="activeTab === 'tarifas' || activeTab === 'centros'">
          <button class="btn-save" (click)="saveChanges()">Guardar Cambios</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: block; background: #f3f4f6; min-height: 100vh; padding: 2rem; }
    .admin-container { max-w-width: 1000px; margin: 0 auto; background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    header { margin-bottom: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; }
    header h1 { margin: 0; color: #111827; }
    header p { color: #6b7280; font-size: 0.95rem; }
    .nav-tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e5e7eb; }
    .nav-tabs button { padding: 0.75rem 1.5rem; background: none; border: none; font-size: 1rem; font-weight: 600; cursor: pointer; color: #6b7280; border-bottom: 2px solid transparent; margin-bottom: -2px; }
    .nav-tabs button.active { color: #4f46e5; border-bottom-color: #4f46e5; }
    .flex-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .btn-add { background: #10b981; color: white; padding: 0.5rem 1rem; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; }
    input { padding: 0.4rem; border: 1px solid #d1d5db; border-radius: 4px; width: 100%; box-sizing: border-box; }
    .btn-delete { background: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; }
    .footer-actions { margin-top: 2rem; border-top: 1px solid #e5e7eb; padding-top: 1rem; text-align: right; }
    .btn-save { background: #4f46e5; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1rem; }
  `]
})
export class AppComponent implements OnInit {
  activeTab: 'tarifas' | 'reservas' | 'clientes' | 'centros' = 'tarifas';

  tarifas: any[] = [];
  clientes: any[] = [];
  centros: any[] = [];
  reservas: any[] = [];

  private apiUrl = 'http://localhost:5085/api'; // Conectado a .NET Minimal API

  constructor(private http: HttpClient) {}

  setTab(tab: 'tarifas' | 'reservas' | 'clientes' | 'centros') { this.activeTab = tab; }

  loadData() {
    this.http.get<any[]>(`${this.apiUrl}/tarifas`).subscribe({
      next: (data) => this.tarifas = data || [],
      error: (err) => console.error('Error cargando tarifas', err)
    });
    this.http.get<any[]>(`${this.apiUrl}/users`).subscribe({
      next: (data) => this.clientes = data || [],
      error: (err) => console.error('Error cargando clientes', err)
    });
    this.http.get<any[]>(`${this.apiUrl}/reservas`).subscribe({
      next: (data) => this.reservas = data || [],
      error: (err) => console.error('Error cargando reservas', err)
    });
    this.http.get<any[]>(`${this.apiUrl}/centros`).subscribe({
      next: (data) => {
        this.centros = data || [];
        this.centros.forEach(c => {
          if (!c.tarifasIds) c.tarifasIds = [];
        });
      },
      error: (err) => console.error('Error cargando centros', err)
    });
  }

  addTarifa() { 
    const nueva = { 
      categoria: 'juego', 
      nombre: 'Nueva Tarifa', 
      subtitulo: '',
      precio: 0.0,
      sufijoPrecio: ' €/hora',
      nota: '',
      imagenUrl: 'assets/tarifa_bebe.png',
      destacado: false,
      etiquetaDestacado: ''
    };
    this.http.post<any>(`${this.apiUrl}/tarifas`, nueva).subscribe({
      next: (res) => this.tarifas.push(res),
      error: (err) => console.error('Error creando tarifa', err)
    });
  }

  deleteTarifa(id: string) { 
    this.http.delete(`${this.apiUrl}/tarifas/${id}`).subscribe({
      next: () => this.tarifas = this.tarifas.filter(t => (t._id || t.id) !== id),
      error: (err) => console.error('Error eliminando tarifa', err)
    });
  }

  deleteCliente(id: string) {
    if(confirm('¿Seguro que deseas eliminar este cliente del sistema?')) {
      this.http.delete(`${this.apiUrl}/users/${id}`).subscribe({
        next: () => this.clientes = this.clientes.filter(c => (c._id || c.id) !== id),
        error: (err) => console.error('Error eliminando cliente', err)
      });
    }
  }

  deleteReserva(id: string) {
    if(confirm('¿Seguro que deseas cancelar esta reserva permanentemente?')) {
      this.http.delete(`${this.apiUrl}/reservas/${id}`).subscribe({
        next: () => this.reservas = this.reservas.filter(r => (r._id || r.id) !== id),
        error: (err) => console.error('Error cancelando reserva', err)
      });
    }
  }

  addCentro() { 
    const nuevo = { 
      nombre: 'Nuevo Centro', 
      ubicacion: 'Ubicación', 
      telefono: '', 
      email: '', 
      descripcion: '', 
      tarifasIds: [] 
    };
    this.http.post<any>(`${this.apiUrl}/centros`, nuevo).subscribe({
      next: (res) => {
        if (!res.tarifasIds) res.tarifasIds = [];
        this.centros.push(res);
      },
      error: (err) => console.error('Error creando centro', err)
    });
  }

  hasTarifa(centro: any, tarifaId: string): boolean {
    return centro.tarifasIds && centro.tarifasIds.includes(tarifaId);
  }

  toggleTarifa(centro: any, tarifaId: string) {
    if (!centro.tarifasIds) centro.tarifasIds = [];
    if (this.hasTarifa(centro, tarifaId)) {
      centro.tarifasIds = centro.tarifasIds.filter((id: string) => id !== tarifaId);
    } else {
      centro.tarifasIds.push(tarifaId);
    }
  }

  deleteCentro(id: string) { 
    this.http.delete(`${this.apiUrl}/centros/${id}`).subscribe({
      next: () => this.centros = this.centros.filter(c => (c._id || c.id) !== id),
      error: (err) => console.error('Error eliminando centro', err)
    });
  }

  ngOnInit() {
    this.loadData();
  }

  saveChanges() {
    if (this.activeTab === 'tarifas') {
      this.tarifas.forEach(t => {
        const id = t._id || t.id;
        if (id) {
          this.http.put(`${this.apiUrl}/tarifas/${id}`, t).subscribe();
        }
      });
      alert('Tarifas actualizadas en la API.');
    } else if (this.activeTab === 'centros') {
      this.centros.forEach(c => {
        const id = c._id || c.id;
        if (id) {
          this.http.put(`${this.apiUrl}/centros/${id}`, c).subscribe();
        }
      });
      alert('Centros actualizados en la API.');
    } else {
      alert('Los clientes se gestionan directamente a través de las acciones en su respectiva fila.');
    }
  }
}
