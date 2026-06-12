import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner,
  IonDatetime, IonDatetimeButton, IonModal,
  AlertController, NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  pawOutline,
  calendarOutline
} from 'ionicons/icons';
import { MascotaService } from 'src/app/core/services/mascota/mascota.service';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

@Component({
  selector: 'app-agregar-mascota',
  templateUrl: './agregar-mascota.page.html',
  styleUrls: ['./agregar-mascota.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonIcon, IonSpinner,
    IonDatetime, IonDatetimeButton, IonModal,
    NavbarComponent
  ]
})
export class AgregarMascotaPage {

  // ── Signals de formulario ────────────────────
  nombre          = signal('');
  raza            = signal('');
  peso            = signal<number>(0);
  altura          = signal<number>(0);
  sexo            = signal<'macho' | 'hembra'>('macho');
  fechaNacimiento = signal<string | null>(null);
  loading         = signal(false);

  readonly today = new Date().toISOString();

  // ── Partes formateadas de la fecha ───────────
  readonly fechaPartes = computed(() => {
    const iso = this.fechaNacimiento();
    if (!iso) return { dia: '', mes: '', anio: '' };
    const d = new Date(iso);
    return {
      dia : String(d.getUTCDate()).padStart(2, '0'),
      mes : MESES[d.getUTCMonth()],
      anio: String(d.getUTCFullYear())
    };
  });

  // ── Dependencias ─────────────────────────────
  private readonly mascotaService = inject(MascotaService);
  private readonly navCtrl        = inject(NavController);
  private readonly alertCtrl      = inject(AlertController);

  constructor() {
    addIcons({ chevronBackOutline, pawOutline, calendarOutline });
  }

  // ── Navegación ───────────────────────────────
  goBack(): void {
    this.navCtrl.back();
  }

  // ── Fecha ────────────────────────────────────
  onFechaChange(event: CustomEvent): void {
    this.fechaNacimiento.set(event.detail.value ?? null);
  }

  // ── Validación ───────────────────────────────
  private get formValido(): boolean {
    return !!(
      this.nombre().trim() &&
      this.raza().trim()   &&
      this.peso()   > 0    &&
      this.altura() > 0
    );
  }

  // ── Guardar ──────────────────────────────────
  async onGuardar(): Promise<void> {
    if (!this.formValido) {
      await this.mostrarAlertaValidacion();
      return;
    }

    this.loading.set(true);

    this.mascotaService.agregarMascota({
      nombre          : this.nombre(),
      raza            : this.raza(),
      peso            : this.peso(),
      altura          : this.altura(),
      sexo            : this.sexo(),
      fecha_nacimiento: this.fechaNacimiento()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.navCtrl.back();
      },
      error: async (err) => {
        this.loading.set(false);
        const alert = await this.alertCtrl.create({
          header : 'Error al guardar',
          message: err?.error?.message ?? 'No se pudo registrar la mascota. Intenta de nuevo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  // ── Alerta campos incompletos ────────────────
  private async mostrarAlertaValidacion(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header : 'Campos incompletos',
      message: 'Por favor completa el nombre, raza, peso y altura.',
      buttons: ['Entendido']
    });
    await alert.present();
  }
}
