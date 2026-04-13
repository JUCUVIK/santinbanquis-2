       import { Injectable, signal } from '@angular/core';

export interface BookingState {
  tipo: 'juego' | 'cumple' | 'excursion' | '';
  pack: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingStateService {
  private initialState: BookingState = {
    tipo: '',
    pack: ''
  };

  state = signal<BookingState>(this.initialState);

  setPreselection(tipo: 'juego' | 'cumple' | 'excursion', pack: string) {
    this.state.set({ tipo, pack });
  }

  clear() {
    this.state.set(this.initialState);
  }
}
