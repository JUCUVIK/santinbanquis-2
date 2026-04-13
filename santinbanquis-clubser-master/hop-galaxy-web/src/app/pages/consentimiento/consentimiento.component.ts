import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import SignaturePad from 'signature_pad';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-consentimiento',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './consentimiento.component.html',
  styles: ``
})
export class ConsentimientoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('signatureCanvas', { static: false }) signatureCanvas!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;

  nombreFirmante: string = '';
  nombresParticipantes: string = '';
  aceptado: boolean = false;

  constructor(private toastService: ToastService, private router: Router) {}

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.signatureCanvas && this.signatureCanvas.nativeElement) {
        this.resizeCanvas();
        this.signaturePad = new SignaturePad(this.signatureCanvas.nativeElement, {
          backgroundColor: 'rgb(255, 255, 255)',
          penColor: 'rgb(0, 0, 0)'
        });
        window.addEventListener('resize', this.onResize);
      }
    }, 200);
  }

  onResize = () => {
    this.resizeCanvas();
  };

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
  }

  resizeCanvas() {
    if (!this.signatureCanvas || !this.signatureCanvas.nativeElement) return;
    const canvas = this.signatureCanvas.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    // Ensure we have layout dimensions
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : canvas.offsetWidth;
    const height = canvas.parentElement ? canvas.parentElement.clientHeight : canvas.offsetHeight;

    if (width === 0 || height === 0) return;

    const newWidth = width * ratio;
    const newHeight = height * ratio;

    // Only resize and clear if dimensions actually changed
    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      canvas.getContext('2d')?.scale(ratio, ratio);

      if (this.signaturePad) {
        this.signaturePad.clear();
      }
    }
  }

  clearSignature() {
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

  onSubmit() {
    if (!this.nombreFirmante || !this.nombresParticipantes) {
      this.toastService.show('Por favor, rellene todos los campos.', 'error');
      return;
    }
    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      this.toastService.show('Por favor, firme el documento.', 'error');
      return;
    }
    if (!this.aceptado) {
      this.toastService.show('Debe aceptar las condiciones.', 'error');
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Consentimiento Informado', 20, 20);
      doc.setFontSize(12);
      doc.text('Firmante: ' + this.nombreFirmante, 20, 30);
      doc.text('Participantes: ' + this.nombresParticipantes, 20, 40);
      doc.text('Fecha: ' + new Date().toLocaleDateString(), 20, 50);
      doc.text('Acepta asuncion de riesgos y normativas de la instalacion.', 20, 60);

      const sigData = this.signaturePad.toDataURL();
      doc.text('Firma:', 20, 75);
      doc.addImage(sigData, 'PNG', 20, 80, 80, 40);

      const pdfBase64 = doc.output('datauristring');
      localStorage.setItem('consentimiento_temporal', pdfBase64);
    } catch (err) {
      console.error('Error generando PDF', err);
    }

    this.toastService.show('Consentimiento guardado. Redirigiendo al pago...');
    setTimeout(() => {
        this.router.navigate(['/compra']);
    }, 1500);
  }
}
