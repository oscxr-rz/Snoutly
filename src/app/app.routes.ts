import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./pages/auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },
  {
    path: 'mascota',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/mascota/mascota.routes').then((r) => r.MASCOTA_ROUTES),
  },
  {
    path: '',
    redirectTo: 'mascota',
    pathMatch: 'full',
  },
];
