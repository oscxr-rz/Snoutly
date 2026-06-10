import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonBackButton, IonButton, IonIcon, IonSpinner,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline, calendarOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner
  ]
})
export class RegisterPage {
  nombre = signal('');
  correo = signal('');
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  loading = signal(false);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ eyeOffOutline, eyeOutline, calendarOutline });
  }

  get passwordType() { return this.showPassword() ? 'text' : 'password'; }
  get confirmPasswordType() { return this.showConfirmPassword() ? 'text' : 'password'; }

  private get formValido(): boolean {
    return !!(
      this.nombre().trim() &&
      this.correo().trim() &&
      this.password().length >= 6 &&
      this.password() === this.confirmPassword()
    );
  }

  async onSubmit(): Promise<void> {
    if (!this.formValido) return;
    this.loading.set(true);

    this.authService.register({
      nombre_completo: this.nombre(),
      correo_electronico: this.correo(),
      password: this.password(),
    }).subscribe({
      next: () => this.router.navigate(['/mascota/agregar']),
      error: async (err) => {
        this.loading.set(false);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err?.error?.message ?? 'Error al registrar el usuario',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  iniciarSesion() {
    this.router.navigate(['auth/login']);
  }
}
