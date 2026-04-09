import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
@Injectable({ providedIn: 'root' })
export class ContentService {
  constructor(private api: ApiService) {}
  getCenters() { return this.api.getCenters(); }
  getTarifas() { return this.api.getTarifas(); }
  getAvailability(centerSlug: string, date: string) {
    return this.api.getAvailableSlots(centerSlug, date);
  }
}

