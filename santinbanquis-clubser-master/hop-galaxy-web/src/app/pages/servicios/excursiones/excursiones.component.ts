import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-excursiones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './excursiones.component.html',
  styleUrl: './excursiones.component.css'
})
export class ExcursionesComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
