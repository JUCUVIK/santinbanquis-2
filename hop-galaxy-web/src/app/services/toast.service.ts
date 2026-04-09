import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  message = signal<string>('');
  visible = signal<boolean>(false);
  type = signal<'success' | 'error' | 'info'>('info');

  show(msg: string, type: 'success' | 'error' | 'info' = 'info') {
    this.message.set(msg);
    this.type.set(type);
    this.visible.set(true);
    setTimeout(() => {
      this.visible.set(false);
    }, 4000);
  }
}
