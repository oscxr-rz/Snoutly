import {
  Component, OnInit, AfterViewInit, OnDestroy,
  inject, signal, NgZone
} from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chevronUpOutline, chevronDownOutline,
  searchOutline, closeCircleOutline, locateOutline,
  medkitOutline, pawOutline, walkOutline,
  arrowForwardOutline, starOutline, timeOutline
} from 'ionicons/icons';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import * as L from 'leaflet';

export interface Veterinaria {
  id: number;
  nombre: string;
  direccion: string;
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
export class MapPage implements OnInit, AfterViewInit, OnDestroy {

  // ── Signals ──────────────────────────────────────────────
  query = signal('');
  filtroActivo = signal<string>('cercanas');
  resultados = signal<Veterinaria[]>([]);
  seleccionada = signal<Veterinaria | null>(null);
  cargando = signal(false);
  sheetExpanded = signal(false);
  searchFocused = signal(false);

  readonly chips = [
    { key: 'cercanas', label: 'Más cercanas', icon: 'walk-outline' },
    { key: 'abiertas', label: 'Abiertas', icon: 'time-outline' },
    { key: 'mejor', label: 'Mejor rating', icon: 'star-outline' },
  ];

  // ── Mock data — reemplaza con tu servicio real ────────────
  private readonly mockVets: Veterinaria[] = [
    { id: 1, nombre: 'Clínica Patitas Sanas', direccion: 'Av. Juárez 104, Centro', lat: 17.0699, lng: -96.7233, distancia: '320 m', abierto: true, color: '#7096D1' },
    { id: 2, nombre: 'VetCare Oaxaca', direccion: 'Calle Porfirio Díaz 52', lat: 17.0675, lng: -96.7188, distancia: '680 m', abierto: true, color: '#F9B74E' },
    { id: 3, nombre: 'Animal HealthCare', direccion: 'Blvd. San Felipe 210', lat: 17.0720, lng: -96.7250, distancia: '1.1 km', abierto: false, color: '#F8C4C4' },
    { id: 4, nombre: 'Vet. Los Valles', direccion: 'Calz. Madero 88, Jalatlaco', lat: 17.0648, lng: -96.7160, distancia: '1.4 km', abierto: true, color: '#E4F2A4' },
    { id: 5, nombre: 'Hospital Mascotas', direccion: 'Periférico Norte 340', lat: 17.0730, lng: -96.7200, distancia: '1.8 km', abierto: false, color: '#C0DCFB' },
  ];

  // ── Leaflet state ─────────────────────────────────────────
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
      medkitOutline, pawOutline, walkOutline,
      arrowForwardOutline, starOutline, timeOutline
    });
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    // Delay para que Ionic termine de renderizar el DOM
    setTimeout(() => this.initMapa(), 200);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  // ── Mapa ──────────────────────────────────────────────────
  private initMapa(): void {
    this.map = L.map('vt-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([this.userLat, this.userLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // Marcador de usuario (punto azul pulsante)
    this.userMarker = L.marker([this.userLat, this.userLng], {
      icon: this.crearIconoUsuario()
    }).addTo(this.map);

    // Cargar veterinarias mock
    this.pintarVeterinarias(this.mockVets);

    // Intentar geolocalización real
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => this.ngZone.run(() => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;
          this.userMarker?.setLatLng([this.userLat, this.userLng]);
          this.map.setView([this.userLat, this.userLng], 15);
        }),
        () => { } // silencia error si el usuario deniega
      );
    }
  }

  private crearIconoUsuario(): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `<div class="vt-marker-user"><div class="vt-marker-pulse"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  private crearIconoVet(color: string, selected = false): L.DivIcon {
    const size = selected ? 44 : 36;
    return L.divIcon({
      className: '',
      html: `
        <div class="vt-marker-vet${selected ? ' is-selected' : ''}"
             style="width:${size}px;height:${size}px;background:${color};">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1A1A2E"
               stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
               width="${Math.round(size * 0.48)}" height="${Math.round(size * 0.48)}">
            <path d="M10 2a2 2 0 0 0-2 2v1H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2h-4z"/>
            <line x1="12" y1="10" x2="12" y2="15"/>
            <line x1="9.5" y1="12.5" x2="14.5" y2="12.5"/>
          </svg>
        </div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  private pintarVeterinarias(vets: Veterinaria[]): void {
    this.markers.forEach(({ marker }) => marker.remove());
    this.markers = [];

    vets.forEach(v => {
      const marker = L.marker([v.lat, v.lng], {
        icon: this.crearIconoVet(v.color)
      })
        .addTo(this.map)
        .on('click', () => this.ngZone.run(() => this.seleccionar(v)));

      this.markers.push({ marker, vet: v });
    });

    this.resultados.set(vets);
  }

  // ── Acciones ──────────────────────────────────────────────
  onSearchInput(ev: Event): void {
    const val = (ev.target as HTMLInputElement).value;
    this.query.set(val);
    if (!val) { this.pintarVeterinarias(this.mockVets); return; }
    const filtrados = this.mockVets.filter(v =>
      v.nombre.toLowerCase().includes(val.toLowerCase()) ||
      v.direccion.toLowerCase().includes(val.toLowerCase())
    );
    this.pintarVeterinarias(filtrados);
  }

  limpiarBusqueda(): void {
    this.query.set('');
    this.pintarVeterinarias(this.mockVets);
  }

  setFiltro(key: string): void {
    this.filtroActivo.set(key);
    let sorted = [...this.mockVets];
    if (key === 'abiertas') sorted = sorted.filter(v => v.abierto);
    this.pintarVeterinarias(sorted);
  }

  seleccionar(v: Veterinaria): void {
    this.seleccionada.set(v);
    this.map.setView([v.lat, v.lng], 16);

    // Actualizar iconos — resaltar el seleccionado
    this.markers.forEach(({ marker, vet }) => {
      marker.setIcon(this.crearIconoVet(vet.color, vet.id === v.id));
    });

    this.sheetExpanded.set(false);
  }

  toggleSheet(): void {
    this.sheetExpanded.update(s => !s);
  }

  centrarMapa(): void {
    this.map?.setView([this.userLat, this.userLng], 15);
  }

  verDetalle(v: Veterinaria): void {
    // this.router.navigate(['/veterinaria', v.id]);
    console.log('Ver detalle:', v);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
