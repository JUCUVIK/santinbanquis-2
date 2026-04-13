import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-boadilla',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './boadilla.component.html',
  styles: ``
})
export class BoadillaComponent {
  constructor(private toastService: ToastService) {}

  onConsult(msg: string) {
    this.toastService.show(msg);
  }
}
