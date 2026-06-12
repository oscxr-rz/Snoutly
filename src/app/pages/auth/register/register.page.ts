import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, pawOutline, chevronBackOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonIcon, IonSpinner
  ]
})
export class RegisterPage {

  // ── Signals de formulario ────────────────────
  nombre              = signal('');
  correo              = signal('');
  password            = signal('');
  confirmPassword     = signal('');
  showPassword        = signal(false);
  showConfirmPassword = signal(false);
  loading             = signal(false);

  // Muestra error de contraseña solo si el usuario ya escribió algo en el 2do campo
  readonly passwordMismatch = computed(() =>
    this.confirmPassword().length > 0 &&
    this.password() !== this.confirmPassword()
  );

  // ── Dependencias ─────────────────────────────
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly alertCtrl   = inject(AlertController);

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, pawOutline, chevronBackOutline });
  }

  get passwordType()        { return this.showPassword()        ? 'text' : 'password'; }
  get confirmPasswordType() { return this.showConfirmPassword() ? 'text' : 'password'; }

  // ── Validación ───────────────────────────────
  private get formValido(): boolean {
    return !!(
      this.nombre().trim()       &&
      this.correo().trim()       &&
      this.password().length >= 6 &&
      this.password() === this.confirmPassword()
    );
  }

  // ── Submit ───────────────────────────────────
  async onSubmit(): Promise<void> {
    if (!this.formValido) {
      const msg = this.passwordMismatch()
        ? 'Las contraseñas no coinciden.'
        : 'Por favor completa todos los campos. La contraseña debe tener al menos 6 caracteres.';

      const alert = await this.alertCtrl.create({
        header : 'Campos incompletos',
        message: msg,
        buttons: ['Entendido']
      });
      await alert.present();
      return;
    }

    this.loading.set(true);

    this.authService.register({
      nombre_completo   : this.nombre(),
      correo_electronico: this.correo(),
      password          : this.password()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/mascota/agregar']);
      },
      error: async (err) => {
        this.loading.set(false);
        const alert = await this.alertCtrl.create({
          header : 'Error al registrarse',
          message: err?.error?.message ?? 'No se pudo crear la cuenta. Intenta de nuevo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  // ── Navegación ───────────────────────────────
  iniciarSesion(): void {
    this.router.navigate(['auth/login']);
  }
}
