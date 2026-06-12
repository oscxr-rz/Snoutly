import {
  Component, inject, signal,
  OnInit, ViewChild, ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, IonActionSheet,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, pencilOutline,
  personOutline, syncOutline
} from 'ionicons/icons';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UsuarioService } from 'src/app/core/services/usuario/usuario.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonActionSheet, NavbarComponent]
})
export class PerfilPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  usuario = signal<any>(null);
  imgLoaded = signal(false);
  subiendoImagen = signal(false);
  actionSheetOpen = signal(false);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ arrowBackOutline, pencilOutline, personOutline, syncOutline });
  }

  ngOnInit(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (res) => this.usuario.set(res.data)
    });
  }

  onImgLoad(): void {
    setTimeout(() => this.imgLoaded.set(true), 60);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  abrirSelectorImagen(): void {
    this.fileInput.nativeElement.click();
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.subiendoImagen.set(true);

    this.usuarioService.actualizarImagenPerfil(archivo).subscribe({
      next: () => {
        this.subiendoImagen.set(false);
        this.imgLoaded.set(false);
        this.usuarioService.obtenerPerfil().subscribe({
          next: (res) => this.usuario.set(res.data)
        });
        input.value = '';
      },
      error: () => {
        this.subiendoImagen.set(false);
        this.mostrarToast('No se pudo actualizar la foto', true);
        input.value = '';
      }
    });
  }

  cambiarContrasena(): void {
    this.router.navigate(['/cambiar-contrasena']);
  }

  confirmarCerrarSesion(): void {
    this.actionSheetOpen.set(true);
  }

  readonly actionButtons = [
    {
      text: 'Cerrar sesión',
      role: 'destructive',
      handler: () => this.cerrarSesion()
    },
    { text: 'Cancelar', role: 'cancel' }
  ];

  private cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login'], { replaceUrl: true }),
      error: () => this.router.navigate(['/auth/login'], { replaceUrl: true })
    });
  }

  private async mostrarToast(mensaje: string, esError = false): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      position: 'top',
      color: esError ? 'danger' : 'dark'
    });
    await toast.present();
  }
}
