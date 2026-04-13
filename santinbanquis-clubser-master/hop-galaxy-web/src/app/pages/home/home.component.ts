import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements AfterViewInit, OnInit {
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  centros: any[] = [];

  constructor(private toastService: ToastService, private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:5085/api/centros').subscribe(data => {
      this.centros = data || [];
    });
  }

  ngAfterViewInit() {
    if (this.heroVideo) {
      const video = this.heroVideo.nativeElement;
      
      // Forzar el estado silenciado por código para cumplir políticas de autoplay
      video.muted = true;
      video.defaultMuted = true;
      
      // Intentar reproducir después de asegurar que está cargado
      video.load();
      
      // Usar un pequeño timeout para dar tiempo al navegador a procesar el estado muted
      setTimeout(() => {
        video.play().catch(error => {
          console.warn("Autoplay was prevented on first try, retrying...", error);
          // Reintento manual por si el navegador tardó en procesar el muting
          video.play().catch(e => console.error("Final autoplay error:", e));
        });
      }, 50);
    }
  }

  onReservaClick() {
    this.toastService.show('Redirigiendo al sistema de reservas...');
  }
}
