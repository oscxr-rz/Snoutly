import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonBackButton, IonButton, IonIcon, IonSpinner,
  IonDatetime, IonDatetimeButton, IonModal,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
import { MascotaService } from 'src/app/core/services/mascota/mascota.service';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-agregar-mascota',
  templateUrl: './agregar-mascota.page.html',
  styleUrls: ['./agregar-mascota.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
    IonDatetime, IonDatetimeButton, IonModal, SlicePipe
  ]
})
export class AgregarMascotaPage {
  nombre = signal('');
  raza = signal('');
  peso = signal<number>(0);
  altura = signal<number>(0);
  sexo = signal<'macho' | 'hembra'>('macho');
  fechaNacimiento = signal<string | null>(null);
  loading = signal(false);
  readonly today = new Date().toISOString();

  private readonly mascotaService = inject(MascotaService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ calendarOutline });
  }

  onFechaChange(event: any): void {
    this.fechaNacimiento.set(event.detail.value ?? null);
  }

  private get formValido(): boolean {
    return !!(this.nombre().trim() && this.raza().trim() && this.peso() > 0 && this.altura() > 0);
  }

  async onGuardar(): Promise<void> {
    if (!this.formValido) return;
    this.loading.set(true);

    this.mascotaService.agregarMascota({
      nombre: this.nombre(),
      raza: this.raza(),
      peso: this.peso(),
      altura: this.altura(),
      sexo: this.sexo(),
      fecha_nacimiento: this.fechaNacimiento()
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: async (err) => {
        this.loading.set(false);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err?.error?.message ?? 'Error al registrar la mascota',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}
