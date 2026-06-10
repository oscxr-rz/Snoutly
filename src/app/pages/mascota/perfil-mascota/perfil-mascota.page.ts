import {
  Component, inject, signal, computed,
  OnInit, ViewChild, ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonToolbar, IonButtons,
  IonButton, IonIcon, IonActionSheet,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, ellipsisHorizontal,
  chevronBackOutline, chevronForwardOutline,
  cameraOutline, pawOutline,
  calendarOutline, medkitOutline,
  checkmarkCircle
} from 'ionicons/icons';
import { TitleCasePipe } from '@angular/common';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { MascotaService } from 'src/app/core/services/mascota/mascota.service';

@Component({
  selector: 'app-perfil-mascota',
  templateUrl: './perfil-mascota.page.html',
  styleUrls: ['./perfil-mascota.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonActionSheet,
    NavbarComponent, TitleCasePipe
  ]
})
export class PerfilMascotaPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  ids = signal<number[]>([]);
  indice = signal(0);
  mascota = signal<any>(null);
  actionSheetOpen = signal(false);
  subiendoImagen = signal(false);
  uploadSuccess = signal(false);
  imgLoaded = signal(false);   // imagen del hero ya renderizó
  heroKey = signal(0);       // cambia para forzar re-render del img

  hayAnterior = computed(() => this.ids().length > 1);
  haySiguiente = computed(() => this.ids().length > 1);

  private readonly mascotaService = inject(MascotaService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  constructor() {
    addIcons({
      addOutline, ellipsisHorizontal,
      chevronBackOutline, chevronForwardOutline,
      cameraOutline, pawOutline,
      calendarOutline, medkitOutline,
      checkmarkCircle
    });
  }

  ngOnInit(): void {
    this.mascotaService.obtenerMascotas().subscribe({
      next: (res) => {
        const ids = (res.data as any[]).map((m: any) => m.id_mascota);
        this.ids.set(ids);
        if (ids.length) this.cargarMascota(ids[0]);
      }
    });
  }

  private cargarMascota(id: number): void {
    this.imgLoaded.set(false);
    this.mascota.set(null);
    this.mascotaService.verMascota(id).subscribe({
      next: (res) => {
        this.mascota.set(res.data);
        this.heroKey.update(k => k + 1);
      }
    });
  }

  onHeroImgLoad(): void {
    // pequeño delay para que la transición blur→nitido se aprecie
    setTimeout(() => this.imgLoaded.set(true), 60);
  }

  private navegar(delta: 1 | -1): void {
    const len = this.ids().length;
    if (len <= 1) return;
    const nuevoIndice = (this.indice() + delta + len) % len;
    this.indice.set(nuevoIndice);
    this.cargarMascota(this.ids()[nuevoIndice]);
  }

  anterior(): void { this.navegar(-1); }
  siguiente(): void { this.navegar(1); }

  agregarMascota(): void { this.router.navigate(['mascota/agregar']); }

  abrirSelectorImagen(): void { this.fileInput.nativeElement.click(); }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    const idMascota = this.ids()[this.indice()];
    this.subiendoImagen.set(true);
    this.uploadSuccess.set(false);

    this.mascotaService.actualizarImagenMascota(idMascota, archivo).subscribe({
      next: () => {
        this.subiendoImagen.set(false);
        this.uploadSuccess.set(true);
        setTimeout(() => this.uploadSuccess.set(false), 2000);
        this.imgLoaded.set(false);
        this.cargarMascota(idMascota);
        input.value = '';
      },
      error: () => {
        this.subiendoImagen.set(false);
        this.mostrarToast('No se pudo actualizar la foto', true);
        input.value = '';
      }
    });
  }

  private async mostrarToast(mensaje: string, esError = false): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      position: 'top',
      color: esError ? 'danger' : 'dark',
      cssClass: 'pm-toast'
    });
    await toast.present();
  }

  readonly actionButtons = [
    {
      text: 'Editar perfil',
      handler: () => this.router.navigate(['/editar-mascota'])
    },
    {
      text: 'Eliminar mascota',
      role: 'destructive',
      handler: () => this.confirmarEliminar()
    },
    { text: 'Cancelar', role: 'cancel' }
  ];

  private async confirmarEliminar(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar mascota',
      message: 'Esta acción es permanente y no se puede deshacer.',
      cssClass: 'pm-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const id = this.ids()[this.indice()];
            this.mascotaService.aliminarMascota(id).subscribe({
              next: () => {
                const nuevosIds = this.ids().filter(i => i !== id);
                this.ids.set(nuevosIds);
                if (!nuevosIds.length) { this.router.navigate(['/']); return; }
                const nuevoIndice = this.indice() % nuevosIds.length;
                this.indice.set(nuevoIndice);
                this.cargarMascota(nuevosIds[nuevoIndice]);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
