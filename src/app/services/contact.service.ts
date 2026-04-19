import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ── Payload que se envía al API ──────────────────────────────────────────────
export interface OrderPayload {
  // Contacto
  nombre: string;
  telefono: string;
  email?: string;
  // Evento
  tipoEvento: string;
  fecha: string;
  hora: string;
  direccion: string;
  // Pedido (pre-llenado desde calculadora)
  invitados: number;
  vitroleros: number;
  categoria: string;
  endulzante: string;
  totalCups: number;
  servicioEntrega: string;
  incluirEnvio: boolean;
  incluirCarrito: boolean;
  precioBase: number;
  precioTotal: number;
  // Opcionales
  sabores?: string;
  notas?: string;
}

// ── Respuesta esperada del API ────────────────────────────────────────────────
export interface OrderResponse {
  id: string;
  folio: string;
  mensaje: string;
}

// ── Error tipado para el componente ──────────────────────────────────────────
export type ApiErrorTipo = 'red' | 'servidor' | 'validacion' | 'desconocido';

export interface ApiError {
  tipo: ApiErrorTipo;
  mensaje: string;
}

// ── Servicio ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  submitOrder(payload: OrderPayload): Observable<OrderResponse> {
    return this.http
      .post<OrderResponse>(`${environment.apiUrl}/orders`, payload)
      .pipe(
        // Reintenta 1 vez ante errores transitorios (ej: timeout de red)
        retry({ count: 1, delay: 1200 }),
        catchError((err: HttpErrorResponse) => throwError(() => this.toApiError(err)))
      );
  }

  private toApiError(err: HttpErrorResponse): ApiError {
    if (err.status === 0 || !navigator.onLine) {
      return {
        tipo: 'red',
        mensaje: 'Sin conexión. Verifica tu internet e intenta de nuevo.',
      };
    }
    if (err.status >= 500) {
      return {
        tipo: 'servidor',
        mensaje: 'Error en el servidor. Intenta en unos minutos o contáctanos al 33 1804 1630.',
      };
    }
    if (err.status === 400 || err.status === 422) {
      return {
        tipo: 'validacion',
        mensaje: (err.error as { message?: string })?.message
          ?? 'Los datos del formulario son inválidos. Revisa los campos.',
      };
    }
    return {
      tipo: 'desconocido',
      mensaje: 'Ocurrió un error inesperado. Contáctanos directamente al 33 1804 1630.',
    };
  }
}
