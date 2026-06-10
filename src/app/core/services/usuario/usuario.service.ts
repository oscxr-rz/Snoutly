import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);

  private get idUsuario(): number | null {
    const usuario = localStorage.getItem('id_usuario');
    if (!usuario) return null;
    return Number(usuario) ?? null;
  }

  private get apiUrl(): string {
    return `${environment.API_URL}/usuario/${this.idUsuario}`;
  }

  obtenerPerfil(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  actualizarImagenPerfil(data: File | FormData): Observable<any> {
    const formData = data instanceof FormData ? data : new FormData();
    if (!(data instanceof FormData)) {
      formData.append('imagen', data);
    }
    return this.http.post<any>(`${this.apiUrl}/imagen`, formData);
  }

}
