import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonIcon, IonSpinner,
  IonDatetime, IonDatetimeButton, IonModal,
  NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, calendarOutline,
  medkitOutline, pawOutline, timeOutline,
  checkmarkCircleOutline, checkmarkCircle, closeCircle
} from 'ionicons/icons';
import { MascotaService } from 'src/app/core/services/mascota/mascota.service';
import { CitaService } from 'src/app/core/services/cita/cita.service';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Component({
  selector: 'app-agregar-cita',
  templateUrl: './agregar-cita.page.html',
  styleUrls: ['./agregar-cita.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonSpinner,
    IonDatetime, IonDatetimeButton, IonModal,
    NavbarComponent
  ]
})
export class AgregarCitaPage implements OnInit {

  // ── Signals formulario ───────────────────────
  motivo = signal('');
  tipoCita = signal('');
  nombreClinica = signal('');
  nombreVeterinario = signal('');
  fechaHoraCita = signal<string | null>(null);
  estadoCita = signal<'confirmada' | 'completada' | 'cancelada'>('confirmada');
  recordatorioActivo = signal(false);
  minutosAntesRecordatorio = signal(30);
  loading = signal(false);

  // ── Touched (validación en tiempo real) ──────
  touchedMotivo = signal(false);
  touchedTipo = signal(false);
  touchedClinica = signal(false);
  touchedMascota = signal(false);
  touchedFecha = signal(false);

  // ── Errores computados ───────────────────────
  readonly errorMotivo = computed(() => this.touchedMotivo() && !this.motivo().trim() ? 'El motivo es requerido.' : null);
  readonly errorTipo = computed(() => this.touchedTipo() && !this.tipoCita() ? 'Selecciona un tipo de cita.' : null);
  readonly errorClinica = computed(() => this.touchedClinica() && !this.nombreClinica().trim() ? 'El nombre de la clínica es requerido.' : null);
  readonly errorMascota = computed(() => this.touchedMascota() && !this.idMascotaSeleccionada() ? 'Selecciona una mascota.' : null);
  readonly errorFecha = computed(() => this.touchedFecha() && !this.fechaHoraCita() ? 'Elige fecha y hora.' : null);

  // ── Toast ────────────────────────────────────
  toastVisible = signal(false);
  toastType = signal<'success' | 'error'>('success');
  toastMsg = signal('');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Mascota ──────────────────────────────────
  idMascotaSeleccionada = signal<number | null>(null);
  mascotas = signal<any[]>([]);
  cargandoMascotas = signal(false);

  readonly today = new Date().toISOString();

  // ── Partes de fecha ──────────────────────────
  readonly fechaPartes = computed(() => {
    const iso = this.fechaHoraCita();
    if (!iso) return { dia: '', mes: '', anio: '', hora: '' };
    const d = new Date(iso);
    return {
      dia: String(d.getUTCDate()).padStart(2, '0'),
      mes: MESES[d.getUTCMonth()],
      anio: String(d.getUTCFullYear()),
      hora: d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  });

  readonly tiposCita = [
    { value: 'veterinario', label: 'Veterinario', emoji: '🩺' },
    { value: 'vacuna', label: 'Vacuna', emoji: '💉' },
    { value: 'grooming', label: 'Grooming', emoji: '✂️' },
    { value: 'control', label: 'Control', emoji: '📋' },
    { value: 'emergencia', label: 'Emergencia', emoji: '🚨' },
    { value: 'otro', label: 'Otro', emoji: '•' },
  ];

  readonly opcionesRecordatorio = [15, 30, 60, 120, 1440];

  // ── Dependencias ─────────────────────────────
  private readonly mascotaService = inject(MascotaService);
  private readonly citaService = inject(CitaService);
  private readonly navCtrl = inject(NavController);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    addIcons({
      chevronBackOutline, calendarOutline, medkitOutline,
      pawOutline, timeOutline, checkmarkCircleOutline,
      checkmarkCircle, closeCircle
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('idMascota')
      ?? this.route.snapshot.queryParamMap.get('idMascota');

    if (idParam) {
      this.idMascotaSeleccionada.set(Number(idParam));
      this.cargarMascotas(Number(idParam));
    } else {
      this.cargarMascotas();
    }
  }

  private cargarMascotas(preseleccionarId?: number): void {
    this.cargandoMascotas.set(true);
    this.mascotaService.obtenerMascotas().subscribe({
      next: (res) => {
        this.mascotas.set(res.data ?? []);
        if (preseleccionarId) this.idMascotaSeleccionada.set(preseleccionarId);
        this.cargandoMascotas.set(false);
      },
      error: () => this.cargandoMascotas.set(false)
    });
  }

  goBack(): void { this.navCtrl.back(); }

  onFechaChange(event: CustomEvent): void {
    this.fechaHoraCita.set(event.detail.value ?? null);
    this.touchedFecha.set(true);
  }

  seleccionarMascota(id: number): void {
    this.idMascotaSeleccionada.set(id);
    this.touchedMascota.set(true);
  }

  seleccionarTipo(value: string): void {
    this.tipoCita.set(value);
    this.touchedTipo.set(true);
  }

  etiquetaMinutos(min: number): string {
    if (min < 60) return `${min} min antes`;
    if (min === 60) return '1 hora antes';
    if (min < 1440) return `${min / 60} horas antes`;
    return '1 día antes';
  }

  private get formValido(): boolean {
    return !!(
      this.idMascotaSeleccionada() &&
      this.motivo().trim() &&
      this.tipoCita().trim() &&
      this.nombreClinica().trim() &&
      this.fechaHoraCita()
    );
  }

  /** Marca todos los campos como tocados para mostrar errores al intentar guardar */
  private marcarTodos(): void {
    this.touchedMotivo.set(true);
    this.touchedTipo.set(true);
    this.touchedClinica.set(true);
    this.touchedMascota.set(true);
    this.touchedFecha.set(true);
  }

  // ── Toast helpers ─────────────────────────────
  showToast(type: 'success' | 'error', msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastType.set(type);
    this.toastMsg.set(msg);
    this.toastVisible.set(true);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 3500);
  }

  dismissToast(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastVisible.set(false);
  }

  // ── Guardar ───────────────────────────────────
  async onGuardar(): Promise<void> {
    this.marcarTodos();

    if (!this.formValido) {
      this.showToast('error', 'Completa todos los campos requeridos antes de continuar.');
      return;
    }

    this.loading.set(true);

    const payload = {
      motivo: this.motivo(),
      tipo_cita: this.tipoCita(),
      nombre_clinica: this.nombreClinica(),
      nombre_veterinario: this.nombreVeterinario() || null,
      fecha_hora_cita: this.fechaHoraCita()!.replace('T', ' ').substring(0, 19),
      estado_cita: this.estadoCita(),
      recordatorio_activo: this.recordatorioActivo(),
      minutos_antes_recordatorio: this.minutosAntesRecordatorio()
    };

    this.citaService.agregarCita(this.idMascotaSeleccionada()!, payload).subscribe({
      next: (res) => {
        if (!res.success) {
          this.loading.set(false);
          const msg = res.message ?? 'No se pudo registrar la cita. Intenta de nuevo.';
          this.showToast('error', msg);
          return;
        } else {
          this.loading.set(false);
          this.showToast('success', '¡Cita agendada correctamente!');
          setTimeout(() => this.navCtrl.back(), 1200);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'No se pudo registrar la cita. Intenta de nuevo.';
        this.showToast('error', msg);
        // El formulario NO se limpia — el usuario conserva sus datos
      }
    });
  }
}
