import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MascotaService {
  private http = inject(HttpClient);

  private get idUsuario(): number | null {
    const usuario = localStorage.getItem('id_usuario');
    if (!usuario) return null;
    return Number(usuario) ?? null;
  }

  private get apiUrl(): string {
    return `${environment.API_URL}/usuario/${this.idUsuario}/mascota`;
  }

  obtenerMascotas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  verMascota(idMascota: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${idMascota}`);
  }

  agregarMascota(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, data);
  }

  actualizarImagenMascota(idMascota: number, data: File | FormData): Observable<any> {
    const formData = data instanceof FormData ? data : new FormData();
    if (!(data instanceof FormData)) {
      formData.append('imagen', data);
    }
    return this.http.post<any>(`${this.apiUrl}/${idMascota}/imagen`, formData);
  }

  actualizarMascota(idMascota: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${idMascota}`, data);
  }

  aliminarMascota(idMascota: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${idMascota}`, {});
  }

}
