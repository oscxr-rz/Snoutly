import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private get apiUrl(): string {
    return `${environment.API_URL}/auth`;
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      tap((res) => { if (res.success) this.guardarDatos(res); })
    );
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => { if (res.success) this.guardarDatos(res); })
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      tap((res) => { if (res.success) this.borrarSesion(); })
    );
  }

  borrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('id_usuario');
    localStorage.removeItem('nombre');
    localStorage.removeItem('email');
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token') && !!localStorage.getItem('id_usuario');
  }

  private guardarDatos(res: any): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('id_usuario', res.data.id_usuario.toString());
    localStorage.setItem('nombre', res.data.nombre_completo);
    localStorage.setItem('email', res.data.correo_electronico);
  }
}
