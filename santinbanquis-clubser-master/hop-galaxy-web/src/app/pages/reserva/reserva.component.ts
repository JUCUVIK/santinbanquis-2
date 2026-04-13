import { Component, OnInit, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { BookingStateService } from '../../services/booking-state.service';
import { CartService } from '../../services/cart.service';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reserva.component.html',
  styles: ``
})
export class ReservaComponent implements OnInit {
  
  bookingData: any = {
    tipo: 'juego',
    centro: '',
    fecha: '',
    hora: '',
    entradas: {} as { [tarifaId: string]: number }, // Juego libre
    selectedPackId: '', // Para cumpleaños/excursiones (auto-calc)
    numNinos: 10,
    numPersonas: 20
  };
  
  minDate: string = '';
  availableSlots: any[] = [];
  centersAvailability: { [centerSlug: string]: 'loading' | 'available' | 'full' } = {};
  defaultHours = ['17:00', '18:00', '19:00', '20:00'];
  isLoadingAvailability = false;

  tarifasJuego: any[] = [];
  packsCumple: any[] = [];
  packsExcursion: any[] = [];
  centers: any[] = [];

  constructor(
    private router: Router, 
    private apiService: ApiService,
    private toastService: ToastService,
    private bookingStateService: BookingStateService,
    private contentService: ContentService,
    public cartService: CartService,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit() {
    this.title.setTitle('Reserva tu vuelo | Saltimbanquis club');
    this.meta.updateTag({ name: 'description', content: 'Reserva tu entrada para juego libre, cumpleaños o excursiones en Saltimbanquis club.' });
    
    this.loadTarifas();
    this.apiService.getCenters().subscribe({
      next: (data) => this.centers = data,
      error: (err) => console.error('Error loading centers', err)
    });

    const now = new Date();
    this.minDate = now.toISOString().split('T')[0];

    const preselection = this.bookingStateService.state();
    if (preselection.tipo) {
      this.bookingData.tipo = preselection.tipo as any;
      if (preselection.pack) {
        this.bookingData.selectedPackId = preselection.pack;
      }
      if (preselection.tipo === 'cumple') {
        this.bookingData.numNinos = 10;
      } else if (preselection.tipo === 'excursion') {
        this.bookingData.numPersonas = 20;
      }
      this.bookingStateService.clear();
    }
  }

  onSelectionChange() {
    // When only date is selected, query ALL centers to show availability
    if (this.bookingData.fecha) {
      this.checkAllCentersAvailability();
    }
    // If both center and date, also query specific slots
    if (this.bookingData.centro && this.bookingData.fecha) {
      this.checkAvailability();
    }
  }

  checkAllCentersAvailability() {
    this.centersAvailability = {};
    for (const center of this.centers) {
      const slug = center.slug;
      if (!slug) continue;
      this.centersAvailability[slug] = 'loading';
      this.contentService.getAvailability(slug, this.bookingData.fecha).subscribe({
        next: (data) => {
          const slots = data.slots || [];
          const capacity = data.defaultCapacity || 50;
          // A center is 'full' only if ALL default hours are full
          const anyAvailable = this.defaultHours.some(h => {
            const booked = slots.find((s: any) => s.time === h);
            const occupied = booked ? booked.occupied : 0;
            return occupied < capacity;
          });
          this.centersAvailability[slug] = anyAvailable ? 'available' : 'full';
        },
        error: () => { this.centersAvailability[slug] = 'available'; }
      });
    }
  }

  getCenterStatus(center: any): string {
    const status = this.centersAvailability[center.slug];
    if (!this.bookingData.fecha) return '';
    if (status === 'loading') return '⏳';
    if (status === 'full') return '🔴 AGOTADO';
    if (status === 'available') return '🟢 Disponible';
    return '';
  }

  isCenterFull(center: any): boolean {
    return this.centersAvailability[center.slug] === 'full';
  }

  checkAvailability() {
    this.isLoadingAvailability = true;
    const centerSlug = this.bookingData.centro;
    const center = this.centers.find(c => c.slug === centerSlug);
    if (!centerSlug) return;

    this.contentService.getAvailability(centerSlug, this.bookingData.fecha).subscribe({
      next: (data) => {
        const slots = data.slots || [];
        const capacity = data.defaultCapacity || 50;
        
        this.availableSlots = this.defaultHours.map(h => {
          const booked = slots.find((s: any) => s.time === h);
          const occupied = booked ? booked.occupied : 0;
          return { time: h, occupied, capacity, isFull: occupied >= capacity };
        });
        this.isLoadingAvailability = false;
        
        if (this.bookingData.hora) {
          const selectedSlot = this.availableSlots.find(s => s.time === this.bookingData.hora);
          if (selectedSlot?.isFull) {
            this.bookingData.hora = '';
            this.toastService.show('La hora seleccionada ya no está disponible', 'info');
          }
        }
      },
      error: (err) => {
        console.error('Error loading availability', err);
        this.isLoadingAvailability = false;
      }
    });
  }

  loadTarifas() {
    this.apiService.getTarifas().subscribe({
      next: (data) => {
        this.tarifasJuego = data.filter((t: any) => t.category === 'juego').map((t: any) => ({
          id: t.id || t.name.toLowerCase().replace(/\s+/g, '_'),
          name: t.name,
          price: t.price,
          unit: t.unit || '€',
          note: t.note || t.who || ''
        }));
        
        this.tarifasJuego.forEach((t: any) => {
          if (!this.bookingData.entradas[t.id]) {
            this.bookingData.entradas[t.id] = 0;
          }
        });

        this.packsCumple = data.filter((t: any) => t.category === 'cumple').map((t: any) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          note: t.note,
          minQuantity: t.minQuantity || 1,
          basePeopleCount: t.basePeopleCount || 0,
          extraPrice: t.extraPrice || 0
        }));

        this.packsExcursion = data.filter((t: any) => t.category === 'excursion').map((t: any) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          note: t.note,
          minQuantity: t.minQuantity || 20
        }));
      },
      error: (err) => console.error('Error loading tarifas for booking', err)
    });
  }

  // ─── Cálculo de precio de cumpleaños ─────────────────────────────────────
  // Regla de negocio: se compran los packs completos necesarios y los niños
  // restantes pagan suplemento. Nunca se "optimiza" comprando menos packs.
  // Ej: 11 niños, base=10 → 1 pack + 1 extra. NO: 1 pack + 11 extras.
  getBestBirthdayPrice(numNinos: number, pack: any): { qty: number; extras: number; total: number } {
    if (!pack || numNinos <= 0) return { qty: 0, extras: 0, total: 0 };

    const base = pack.basePeopleCount > 0 ? pack.basePeopleCount : (pack.minQuantity || 1);

    // Packs completos necesarios (mínimo 1)
    const qty = Math.max(1, Math.floor(numNinos / base));
    // Niños que no caben en ningún pack completo → pagan suplemento
    const extras = Math.max(0, numNinos - qty * base);
    const total = qty * pack.price + extras * (pack.extraPrice || 0);

    return { qty, extras, total };
  }

  // ─── Total dinámico ───────────────────────────────────────────────────────
  get total(): number {
    let sum = 0;
    
    if (this.bookingData.tipo === 'juego') {
      for (const t of this.tarifasJuego) {
        sum += (this.bookingData.entradas[t.id] || 0) * t.price;
      }
    }
    
    if (this.bookingData.tipo === 'cumple') {
      const pack = this.packsCumple.find(p => p.id === this.bookingData.selectedPackId);
      if (pack) {
        sum = this.getBestBirthdayPrice(this.bookingData.numNinos, pack).total;
      }
    }

    if (this.bookingData.tipo === 'excursion') {
      const pack = this.packsExcursion.find(p => p.id === this.bookingData.selectedPackId);
      if (pack) {
        sum = pack.price * this.bookingData.numPersonas;
      }
    }

    return sum;
  }

  // ─── Juego Libre: controles manuales ─────────────────────────────────────
  incrementTicket(id: string) {
    if (!this.bookingData.entradas[id]) this.bookingData.entradas[id] = 0;
    this.bookingData.entradas[id]++;
  }

  decrementTicket(id: string) {
    if (this.bookingData.entradas[id] > 0) {
      this.bookingData.entradas[id]--;
    }
  }

  // ─── Cumpleaños/Excursión: selección de pack ──────────────────────────────
  selectPack(id: string) {
    this.bookingData.selectedPackId = id;
  }

  // ─── Añadir al carrito ────────────────────────────────────────────────────
  addToCart() {
    if (!this.bookingData.centro || !this.bookingData.fecha || !this.bookingData.hora) {
      this.toastService.show('Por favor, completa Centro, Fecha y Hora', 'error');
      return;
    }

    if (this.total === 0) {
      this.toastService.show('No has seleccionado ninguna entrada o pack', 'error');
      return;
    }

    let added = false;
    const centerObj = this.centers.find(c => c.slug === this.bookingData.centro);
    const centerName = centerObj?.name || this.bookingData.centro;

    // 1. Juego Libre (manual)
    if (this.bookingData.tipo === 'juego') {
      for (const item of this.tarifasJuego) {
        const qty = this.bookingData.entradas[item.id] || 0;
        if (qty > 0) {
          this.cartService.add({
            tipo: 'juego',
            pack: item.id,
            centro: this.bookingData.centro,
            fecha: this.bookingData.fecha,
            hora: this.bookingData.hora,
            participants: qty,
            priceDetails: qty * item.price,
            description: `${qty > 1 ? qty + 'x ' : ''}${item.name} (${centerName} - ${this.bookingData.fecha} ${this.bookingData.hora})`
          });
          added = true;
        }
      }
    }

    // 2. Cumpleaños (best-price automático)
    if (this.bookingData.tipo === 'cumple') {
      const pack = this.packsCumple.find(p => p.id === this.bookingData.selectedPackId);
      if (pack) {
        const best = this.getBestBirthdayPrice(this.bookingData.numNinos, pack);
        const extrasStr = best.extras > 0 ? ` +${best.extras} niños extra` : '';
        const qtyStr = best.qty > 1 ? `${best.qty}x ` : '';
        
        this.cartService.add({
          tipo: 'cumple',
          pack: pack.id,
          centro: this.bookingData.centro,
          fecha: this.bookingData.fecha,
          hora: this.bookingData.hora,
          numNinos: this.bookingData.numNinos,
          participants: this.bookingData.numNinos,
          priceDetails: best.total,
          description: `Cumpleaños: ${qtyStr}${pack.name}${extrasStr} (${centerName} - ${this.bookingData.fecha} ${this.bookingData.hora})`
        });
        added = true;
      }
    }

    // 3. Excursión
    if (this.bookingData.tipo === 'excursion') {
      const pack = this.packsExcursion.find(p => p.id === this.bookingData.selectedPackId);
      if (pack) {
        this.cartService.add({
          tipo: 'excursion',
          pack: pack.id,
          centro: this.bookingData.centro,
          fecha: this.bookingData.fecha,
          hora: this.bookingData.hora,
          numPersonas: this.bookingData.numPersonas,
          participants: this.bookingData.numPersonas,
          priceDetails: pack.price * this.bookingData.numPersonas,
          description: `Excursión: ${pack.name} (${this.bookingData.numPersonas} pers.) (${centerName} - ${this.bookingData.fecha} ${this.bookingData.hora})`
        });
        added = true;
      }
    }

    if (added) {
      this.resetForm();
      this.toastService.show('Añadido al carrito con éxito', 'success');
    }
  }

  resetForm() {
    this.bookingData.entradas = {};
    this.tarifasJuego.forEach((t: any) => {
      this.bookingData.entradas[t.id] = 0;
    });
    this.bookingData.numNinos = 10;
    this.bookingData.numPersonas = 20;
    this.bookingData.selectedPackId = '';
  }

  proceedToCheckout() {
    if (this.cartService.itemCount() === 0) {
      this.toastService.show('El carrito está vacío', 'error');
      return;
    }
    this.apiService.setPendingBooking({
      items: this.cartService.items(),
      total: this.cartService.total()
    });
    this.router.navigate(['/consentimiento']);
  }
}
