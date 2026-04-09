import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: string; // Unique ID for the cart item (e.g. timestamp)
  tipo: 'juego' | 'cumple' | 'excursion';
  pack: string;
  centro: string;
  fecha: string;
  hora: string;
  entradas?: { [tarifaId: string]: number }; // For juego libre
  numNinos?: number;
  numPersonas?: number;
  participants: number; // For capacity tracking
  priceDetails: number; // Subtotal for this specific item
  description: string; // Human readable summary of the item
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'hop_galaxy_cart';
  
  // Initialize from sessionStorage or empty array
  private initialCart: CartItem[] = [];
  
  constructor() {
    const saved = sessionStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.initialCart = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cart from session storage', e);
      }
    }
  }

  // Reactive state
  items = signal<CartItem[]>(this.initialCart);
  
  // Computed totals
  total = computed(() => this.items().reduce((sum, item) => sum + item.priceDetails, 0));
  itemCount = computed(() => this.items().length);

  // Methods
  add(item: Omit<CartItem, 'id'>) {
    const newItem: CartItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9)
    };
    
    this.items.update(current => {
      const updated = [...current, newItem];
      this.saveToStorage(updated);
      return updated;
    });
  }

  remove(itemId: string) {
    this.items.update(current => {
      const updated = current.filter(i => i.id !== itemId);
      this.saveToStorage(updated);
      return updated;
    });
  }

  clear() {
    this.items.set([]);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  private saveToStorage(cart: CartItem[]) {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
  }
}
