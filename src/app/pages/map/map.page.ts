import {
  Component, AfterViewInit, OnDestroy,
  inject, signal, NgZone
} from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chevronUpOutline, chevronDownOutline,
  searchOutline, closeCircleOutline, locateOutline,
  medkitOutline, pawOutline, walkOutline, timeOutline,
  arrowForwardOutline, starOutline, callOutline,
  mailOutline, logoFacebook, closeOutline
} from 'ionicons/icons';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import * as L from 'leaflet';

export interface Veterinaria {
  id: number;
  nombre: string;
  direccion: string;
  horario: string;
  telefono: string;
  email: string;
  facebook: string;
  lat: number;
  lng: number;
  distancia: string;
  abierto: boolean;
  color: string;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, NavbarComponent]
})
export class MapPage implements AfterViewInit, OnDestroy {

  // ── Signals ──────────────────────────────────────────────
  query         = signal('');
  filtroActivo  = signal('cercanas');
  resultados    = signal<Veterinaria[]>([]);
  seleccionada  = signal<Veterinaria | null>(null);
  sheetExpanded = signal(false);
  searchFocused = signal(false);

  readonly chips = [
    { key: 'cercanas', label: 'Más cercanas', icon: 'walk-outline'  },
    { key: 'abiertas', label: 'Abiertas',     icon: 'time-outline'  },
    { key: 'mejor',    label: 'Mejor rating', icon: 'star-outline'  },
  ];

  // ── Datos mock — reemplaza con tu servicio ────────────────
  private readonly ALL: Veterinaria[] = [
    { id:1, nombre:'Clínica Patitas Sanas', direccion:'Av. Juárez 104, Centro',      horario:'8:00 AM – 9:00 PM',  telefono:'9511234567', email:'patitas@gmail.com',    facebook:'Patitas Sanas Oax',    lat:17.0699, lng:-96.7233, distancia:'320 m',  abierto:true,  color:'#7096D1' },
    { id:2, nombre:'VetCare Oaxaca',        direccion:'Calle Porfirio Díaz 52',      horario:'9:00 AM – 8:00 PM',  telefono:'9512345678', email:'vetcare@gmail.com',     facebook:'VetCare Oaxaca',       lat:17.0675, lng:-96.7188, distancia:'680 m',  abierto:true,  color:'#F9B74E' },
    { id:3, nombre:'Animal HealthCare',     direccion:'Blvd. San Felipe 210',        horario:'10:00 AM – 7:00 PM', telefono:'9513456789', email:'animal@gmail.com',      facebook:'Animal HealthCare Oax',lat:17.0720, lng:-96.7250, distancia:'1.1 km', abierto:false, color:'#F8C4C4' },
    { id:4, nombre:'Vet. Los Valles',       direccion:'Calz. Madero 88, Jalatlaco',  horario:'8:00 AM – 6:00 PM',  telefono:'9514567890', email:'losvalles@gmail.com',   facebook:'Vet Los Valles',       lat:17.0648, lng:-96.7160, distancia:'1.4 km', abierto:true,  color:'#E4F2A4' },
    { id:5, nombre:'Hospital Mascotas',     direccion:'Periférico Norte 340',        horario:'24 horas',           telefono:'9515678901', email:'hospital@gmail.com',    facebook:'Hospital Mascotas Oax',lat:17.0730, lng:-96.7200, distancia:'1.8 km', abierto:false, color:'#C0DCFB' },
  ];

  private map!: L.Map;
  private markers: { marker: L.Marker; vet: Veterinaria }[] = [];
  private userMarker?: L.Marker;
  private userLat = 17.0669;
  private userLng = -96.7203;

  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  constructor() {
    addIcons({
      chevronBackOutline, chevronUpOutline, chevronDownOutline,
      searchOutline, closeCircleOutline, locateOutline,
      medkitOutline, pawOutline, walkOutline, timeOutline,
      arrowForwardOutline, starOutline, callOutline,
      mailOutline, logoFacebook, closeOutline
    });
  }

  ngAfterViewInit(): void {
    // requestAnimationFrame es más rápido que setTimeout — el mapa aparece
    // en el primer frame pintado en lugar de esperar 200 ms arbitrarios
    requestAnimationFrame(() => this.initMapa());
  }

  ngOnDestroy(): void { this.map?.remove(); }

  // ── Mapa ──────────────────────────────────────────────────
  private initMapa(): void {
    this.map = L.map('vt-map', { zoomControl: false, attributionControl: false })
      .setView([this.userLat, this.userLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 })
      .addTo(this.map);

    this.userMarker = L.marker([this.userLat, this.userLng], { icon: this.iconUsuario() })
      .addTo(this.map);

    this.pintarVets(this.ALL);

    // Geolocalización — actualiza posición y re-ordena por distancia real
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => this.ngZone.run(() => {
        this.userLat = coords.latitude;
        this.userLng = coords.longitude;
        this.userMarker?.setLatLng([this.userLat, this.userLng]);
        this.map.setView([this.userLat, this.userLng], 15);
        // Recalcular distancias y re-pintar
        this.pintarVets(this.calcularDistancias(this.ALL));
      }),
      () => {}
    );
  }

  // Calcula distancia real en línea recta y actualiza el campo distancia
  private calcularDistancias(vets: Veterinaria[]): Veterinaria[] {
    return vets
      .map(v => {
        const d = this.haversine(this.userLat, this.userLng, v.lat, v.lng);
        const distancia = d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`;
        return { ...v, distancia };
      })
      .sort((a, b) => this.haversine(this.userLat, this.userLng, a.lat, a.lng)
                    - this.haversine(this.userLat, this.userLng, b.lat, b.lng));
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  private iconUsuario(): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `<div class="vt-dot"><div class="vt-pulse"></div></div>`,
      iconSize: [22, 22], iconAnchor: [11, 11]
    });
  }

  private iconVet(v: Veterinaria, sel = false): L.DivIcon {
    const s = sel ? 46 : 38;
    const ico = Math.round(s * 0.45);
    return L.divIcon({
      className: '',
      html: `<div class="vt-pin${sel ? ' sel' : ''}" style="width:${s}px;height:${s}px;background:${v.color}">
        <svg viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" stroke-width="2.2"
             stroke-linecap="round" stroke-linejoin="round" width="${ico}" height="${ico}">
          <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
          <path d="M8 7V5a4 4 0 0 1 8 0v2"/>
          <line x1="12" y1="12" x2="12" y2="16"/>
          <line x1="10" y1="14" x2="14" y2="14"/>
        </svg>
      </div>`,
      iconSize: [s, s], iconAnchor: [s/2, s/2]
    });
  }

  private pintarVets(vets: Veterinaria[]): void {
    this.markers.forEach(({ marker }) => marker.remove());
    this.markers = vets.map(v => {
      const marker = L.marker([v.lat, v.lng], { icon: this.iconVet(v) })
        .addTo(this.map)
        .on('click', () => this.ngZone.run(() => this.seleccionar(v)));
      return { marker, vet: v };
    });
    this.resultados.set(vets);
  }

  // ── Acciones ──────────────────────────────────────────────
  onSearchInput(ev: Event): void {
    const q = (ev.target as HTMLInputElement).value;
    this.query.set(q);
    this.aplicarFiltros(q, this.filtroActivo());
  }

  limpiarBusqueda(): void {
    this.query.set('');
    this.aplicarFiltros('', this.filtroActivo());
  }

  setFiltro(key: string): void {
    this.filtroActivo.set(key);
    this.aplicarFiltros(this.query(), key);
  }

  private aplicarFiltros(q: string, filtro: string): void {
    let list = this.calcularDistancias(this.ALL);
    if (q) {
      const ql = q.toLowerCase();
      list = list.filter(v =>
        v.nombre.toLowerCase().includes(ql) ||
        v.direccion.toLowerCase().includes(ql)
      );
    }
    if (filtro === 'abiertas') list = list.filter(v => v.abierto);
    // 'mejor' — aquí podrías ordenar por rating cuando tengas el campo
    this.pintarVets(list);
  }

  seleccionar(v: Veterinaria): void {
    this.seleccionada.set(v);
    this.sheetExpanded.set(false);
    this.map.setView([v.lat, v.lng], 16);
    this.markers.forEach(({ marker, vet }) =>
      marker.setIcon(this.iconVet(vet, vet.id === v.id))
    );
  }

  cerrarDetalle(): void {
    this.seleccionada.set(null);
    this.markers.forEach(({ marker, vet }) => marker.setIcon(this.iconVet(vet, false)));
  }

  toggleSheet(): void { this.sheetExpanded.update(s => !s); }
  centrarMapa(): void { this.map?.setView([this.userLat, this.userLng], 15); }
  goBack(): void      { this.router.navigate(['/']); }
  llamar(tel: string): void      { window.open(`tel:${tel}`); }
  enviarEmail(e: string): void   { window.open(`mailto:${e}`); }
}
