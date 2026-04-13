import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-fiesta-privada',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fiesta-privada.component.html',
  styleUrl: './fiesta-privada.component.css'
})
export class FiestaPrivadaComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
