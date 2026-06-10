import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonSpinner, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonSpinner
  ]
})
export class LoginPage {
  correo = signal('');
  password = signal('');
  showPassword = signal(false);
  loading = signal(false);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  get passwordType() { return this.showPassword() ? 'text' : 'password'; }

  private get formValido(): boolean {
    return !!(this.correo().trim() && this.password().length >= 6);
  }

  async onSubmit(): Promise<void> {
    if (!this.formValido) return;
    this.loading.set(true);

    this.authService.login({
      correo_electronico: this.correo(),
      password: this.password()
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: async (err) => {
        this.loading.set(false);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err?.error?.message ?? 'Credenciales inválidas',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  crearCuenta() {
    this.router.navigate(['auth/register']);
  }
}
