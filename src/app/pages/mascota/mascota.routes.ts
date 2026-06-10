import { Routes } from '@angular/router';
import { AgregarMascotaPage } from './agregar-mascota/agregar-mascota.page';
import { PerfilMascotaPage } from './perfil-mascota/perfil-mascota.page';

export const MASCOTA_ROUTES: Routes = [
  { path: '', component: PerfilMascotaPage },
  { path: 'agregar', component: AgregarMascotaPage },
];
