import { Routes } from '@angular/router';
import { RegisterPage } from './register/register.page';
import { LoginPage } from './login/login.page';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
];
