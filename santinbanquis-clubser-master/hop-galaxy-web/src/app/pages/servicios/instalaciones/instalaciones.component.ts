import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-instalaciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './instalaciones.component.html',
  styleUrl: './instalaciones.component.css'
})
export class InstalacionesComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
