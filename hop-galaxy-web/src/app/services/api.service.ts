import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, BehaviorSubject, map } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:5085/api';
  private userSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const user = localStorage.getItem('currentUser');
    if (user) { this.userSubject.next(JSON.parse(user)); }
  }

  getCurrentUserEmail() {
    const user = this.userSubject.value;
    return user ? user.email : null;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
  }

  getUserProfile(email: string) {
    return of(this.userSubject.value || { email, nombre: 'Invitado', telefono: '' });
  }

  updateUserProfile(userData: any) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.userSubject.next(userData);
    return of(true);
  }

  getUserBookings(email: string) {
    return this.http.get<any[]>('http://localhost:5085/api/reservas/'+encodeURIComponent(email)).pipe(
      map(reservas => reservas.map(r => {
        let parsedItems: any[] = [];
        try {
           parsedItems = JSON.parse(r.entradas);
        } catch(e) {
           parsedItems = [{ 
               fecha: r.fecha.split(' ')[0], 
               hora: (r.fecha.split(' ')[2] || '17:00'), 
               centro: r.centro, 
               description: r.entradas 
           }];
        }
        
        let isoDate = new Date().toISOString();
        if (r.fecha) {
           const parts = r.fecha.split(' - ');
           const d = parts[0];
           const h = parts.length > 1 ? parts[1].substring(0,5) : '00:00';
           isoDate = d + 'T' + h + ':00';
        }
        
        return {
          id: r.id,
          numeroReserva: r.numeroReserva,
          createdAt: isoDate,
          status: r.estado === 'Próxima' ? 'confirmed' : 'completed',
          details: {
             description: r.entradas.startsWith('[') ? parsedItems.map((i:any)=>i.description).join(' / ') : r.entradas,
             centro: r.centro,
             items: parsedItems,
             fecha: r.fecha.split(' ')[0],
             hora: r.fecha.split(' ')[2] || '17:00',
             total: r.total
          },
          pdfBase64: r.consentimientoPdfBase64
        };
      }))
    );
  }

  archiveBooking(id: string) { return of(true); }
  deleteBooking(id: string) { return of(true); }

  getUserConsents(email: string) { return of([]); }

  getCenters() {
    return this.http.get<any[]>('http://localhost:5085/api/centros').pipe(
        map(centros => centros.map(c => ({
            id: c.id || c._id, 
            slug: c.nombre, 
            name: c.nombre, 
            isComingSoon: false
        })))
    );
  }
  
  getCenterBySlug(slug: string) {
    return this.http.get<any[]>('http://localhost:5085/api/centros').pipe(
        map(centros => {
          const c = centros.find(x => x.nombre === slug);
          if(!c) return null;
          return { id: c.id || c._id, slug: c.nombre, name: c.nombre };
        })
    );
  }

  getTarifas() {
    return this.http.get<any[]>('http://localhost:5085/api/tarifas').pipe(
        map(tarifas => tarifas.map(t => ({
            id: t.id || t._id,
            category: t.categoria,
            name: t.nombre,
            subtitle: t.subtitulo,
            price: t.precio,
            priceSuffix: t.sufijoPrecio,
            isHighlighted: t.destacado
        })))
    );
  }

  setPendingBooking(booking: any) {
    localStorage.setItem('reserva_en_curso', JSON.stringify({
        centroId: booking.items[0]?.centro || 'demo',
        centro: booking.items[0]?.centro || 'Saltimbanquis',
        fecha: booking.items[0]?.fecha || '2026-01-01',
        hora: booking.items[0]?.hora || '18:00',
        entradas: booking.items.map((i: any) => ({ tipo: i.description, precio: i.priceDetails, cantidad: 1 })),
        total: booking.total,
        rawItems: booking.items
    }));
  }

  getPendingBooking() {
    return of(JSON.parse(localStorage.getItem('reserva_en_curso') || '{}'));
  }
  
  getCentersAvailability() {
     return this.http.get<any[]>('http://localhost:5085/api/centros').pipe(
        map(centros => {
           let r: any = {};
           centros.forEach((c: any) => r[c.nombre] = 'available');
           return r;
        })
     );
  }
  
  getAvailableSlots(centroSlug: string, fecha: string) {
     return of({
       slots: [
         { time: '17:00', occupied: 0 },
         { time: '18:00', occupied: 0 },
         { time: '19:00', occupied: 0 },
         { time: '20:00', occupied: 0 }
       ],
       defaultCapacity: 50
     });
  }
}
