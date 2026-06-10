import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth/auth-guard';
import { MapPage } from './pages/map/map.page';

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
    path: 'usuario',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/usuario/usuario.routes').then((r) => r.USUARIO_ROUTES),
  },
  {
    path: 'mapa',
    canActivate: [authGuard],
    component: MapPage,
  },
  {
    path: '',
    redirectTo: 'mascota',
    pathMatch: 'full',
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map/map.page').then( m => m.MapPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/usuario/perfil/perfil.page').then( m => m.PerfilPage)
  },
];
