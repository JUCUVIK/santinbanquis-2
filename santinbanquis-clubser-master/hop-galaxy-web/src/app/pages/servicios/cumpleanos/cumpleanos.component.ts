import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cumpleanos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cumpleanos.component.html',
  styleUrl: './cumpleanos.component.css'
})
export class CumpleanosComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
