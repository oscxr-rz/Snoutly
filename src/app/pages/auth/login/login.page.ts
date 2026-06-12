import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, pawOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonIcon, IonSpinner
  ]
})
export class LoginPage {

  // ── Signals de formulario ────────────────────
  correo       = signal('');
  password     = signal('');
  showPassword = signal(false);
  loading      = signal(false);

  // ── Dependencias ─────────────────────────────
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly alertCtrl   = inject(AlertController);

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, pawOutline });
  }

  get passwordType() {
    return this.showPassword() ? 'text' : 'password';
  }

  // ── Validación ───────────────────────────────
  private get formValido(): boolean {
    return !!(this.correo().trim() && this.password().length >= 6);
  }

  // ── Submit ───────────────────────────────────
  async onSubmit(): Promise<void> {
    if (!this.formValido) {
      const alert = await this.alertCtrl.create({
        header : 'Campos incompletos',
        message: 'Ingresa un correo válido y una contraseña de al menos 6 caracteres.',
        buttons: ['Entendido']
      });
      await alert.present();
      return;
    }

    this.loading.set(true);

    this.authService.login({
      correo_electronico: this.correo(),
      password          : this.password()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: async (err) => {
        this.loading.set(false);
        const alert = await this.alertCtrl.create({
          header : 'Error al iniciar sesión',
          message: err?.error?.message ?? 'Credenciales inválidas. Intenta de nuevo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  // ── Registro ─────────────────────────────────
  crearCuenta(): void {
    this.router.navigate(['auth/register']);
  }
}
