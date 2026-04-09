import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
// Dynamic imports used in downloadPDF

@Component({
  selector: 'app-area-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './area-cliente.component.html',
  styles: ``
})
export class AreaClienteComponent implements OnInit {
  activeTab: 'reservas' | 'consentimientos' | 'perfil' | 'historial' = 'reservas';
  userProfile: any = null;
  userBookings: any[] = [];
  userConsents: any[] = [];
  centers: any[] = [];
  loading = true;
  selectedConsent: any = null; // Para el modal
  isGeneratingPDF = false;
  today = new Date();
  lastTotal = 0;
  ticketItems: any[] = [];

  constructor(
    private toastService: ToastService, 
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    const email = this.apiService.getCurrentUserEmail();
    if (!email) {
      this.toastService.show('Debes iniciar sesión para acceder a esta área.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    this.loadData(email);
  }

  loadData(email: string) {
    this.loading = true;
    
    this.apiService.getCenters().subscribe({
      next: (data) => this.centers = data,
      error: (err) => console.error('Error loading centers', err)
    });
    
    // Cargar perfil
    this.apiService.getUserProfile(email).subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastService.show('Error al cargar el perfil.', 'error');
      }
    });

    // Cargar reservas
    this.apiService.getUserBookings(email).subscribe({
      next: (bookings) => {
        console.log('Bookings loaded:', bookings);
        this.userBookings = bookings;
      },
      error: (err) => {
        console.error('Error loading bookings', err);
      }
    });

    // Cargar consentimientos
    this.apiService.getUserConsents(email).subscribe({
      next: (consents) => {
        this.userConsents = consents;
      },
      error: (err) => {
        console.error('Error loading consents', err);
      }
    });
  }



  saveProfile() {
    if (!this.userProfile) return;

    this.toastService.show('Guardando cambios...', 'info');
    this.apiService.updateUserProfile(this.userProfile).subscribe({
      next: () => {
        this.toastService.show('Datos actualizados correctamente.', 'success');
      },
      error: (err) => {
        this.toastService.show('Error al actualizar el perfil.', 'error');
      }
    });
  }

  showConsent(consent: any) {
    this.selectedConsent = consent;
  }

  viewConsentOfBooking(booking: any) {
    // Buscamos un consentimiento que coincida en fecha (mismo día)
    // o simplemente el más reciente si no hay coincidencia exacta.
    const bookingDate = new Date(booking.createdAt).toDateString();
    const match = this.userConsents.find(c => new Date(c.signedAt).toDateString() === bookingDate);
    
    if (match) {
      this.selectedConsent = match;
    } else if (this.userConsents.length > 0) {
      // Si no hay el mismo día, mostramos el último firmado
      this.selectedConsent = this.userConsents[0];
    } else {
      this.toastService.show('No se encontró un consentimiento firmado para esta reserva.', 'info');
    }
  }

  closeConsent() {
    this.selectedConsent = null;
  }

  async downloadPDF(booking: any) {
    this.isGeneratingPDF = true;
    this.lastTotal = booking.details?.total || booking.details?.priceDetails || 0;
    this.ticketItems = booking.details?.items || (booking.details?.description ? [booking.details] : []);
    this.toastService.show('Generando PDF...', 'info');

    // Esperamos un momento para que el DOM se actualice con los nuevos items
    setTimeout(async () => {
      const element = document.getElementById('ticket-print-template');
      if (!element) {
        this.toastService.show('Error: No se pudo encontrar la plantilla del ticket.', 'error');
        this.isGeneratingPDF = false;
        return;
      }

      try {
        // Dynamic imports for performance optimization
        const [jsPDF, html2canvas]: [any, any] = await Promise.all([
          import('jspdf').then(m => m.default),
          import('html2canvas').then(m => m.default)
        ]);

        const canvas = await html2canvas(element, {
          scale: 2, // Mejor calidad
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Ticket_HoppyGalaxy_${booking.createdAt}.pdf`);
        
        this.toastService.show('¡PDF descargado con éxito!', 'success');
      } catch (err) {
        console.error('Error record to PDF', err);
        this.toastService.show('Error al generar el PDF.', 'error');
      } finally {
        this.isGeneratingPDF = false;
      }
    }, 100);
  }

  isPast(booking: any): boolean {
    const items = booking.details?.items || (booking.details?.description ? [booking.details] : []);
    if (items.length === 0) return false;
    const now = new Date();
    now.setHours(0,0,0,0);
    const firstItem = items[0];
    if (!firstItem.fecha) return false;
    try {
      const normalizedDate = firstItem.fecha.replace(/-/g, '/');
      let itemDate: Date;
      const parts = normalizedDate.split('/');
      
      if (parts.length === 3) {
        if (parts[0].length === 4) { // YYYY/MM/DD
           itemDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        } else { // DD/MM/YYYY
           itemDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        }
      } else {
        itemDate = new Date(normalizedDate);
      }
      
      itemDate.setHours(0,0,0,0);
      return itemDate < now;
    } catch (e) {
      return false;
    }
  }

  onArchive(id: string) {
    if (confirm('¿Seguro que quieres archivar esta reserva? Se moverá a tu historial.')) {
      this.apiService.archiveBooking(id).subscribe({
        next: () => {
          this.toastService.show('Reserva archivada.', 'success');
          const email = this.apiService.getCurrentUserEmail();
          if (email) this.loadData(email);
        },
        error: () => this.toastService.show('Error al archivar.', 'error')
      });
    }
  }

  onDelete(id: string) {
    if (confirm('¿Seguro que quieres eliminar permanentemente esta reserva?')) {
      this.apiService.deleteBooking(id).subscribe({
        next: () => {
          this.toastService.show('Reserva eliminada.', 'success');
          const email = this.apiService.getCurrentUserEmail();
          if (email) this.loadData(email);
        },
        error: () => this.toastService.show('Error al eliminar.', 'error')
      });
    }
  }

  setTab(tab: 'reservas' | 'consentimientos' | 'perfil' | 'historial') {
    this.activeTab = tab;
  }

  logout() {
    this.apiService.logout();
    this.toastService.show('Sesión cerrada.', 'info');
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1000);
  }
}
