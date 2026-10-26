import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
export interface OrderPayload {
  requestId: string;
  nombre: string;
  telefono: string;
  email?: string;
  tipoEvento: string;
  fecha: string;
  hora: string;
  direccion: string;
  invitados: number;
  incluirEnvio: boolean;
  incluirCarrito: boolean;
  notas?: string;
  lineas: { categoria: string; endulzante: string; sabor: string }[];
}
export interface OrderResponse {
  id: string;
  folio: string;
  mensaje: string;
  totalCents: number;
  paymentPath: string;
}
export type ApiErrorTipo = 'red' | 'servidor' | 'validacion' | 'desconocido';
export interface ApiError {
  tipo: ApiErrorTipo;
  mensaje: string;
}
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  submitOrder(payload: OrderPayload): Observable<OrderResponse> {
    return this.http
      .post<OrderResponse>(environment.apiUrl + '/orders', payload)
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(
            () =>
              ({
                tipo: err.status === 0 ? 'red' : 'servidor',
                mensaje:
                  err.status === 0
                    ? 'No pudimos contactar al servidor. Reintenta sin cambiar los datos para recuperar tu solicitud.'
                    : Array.isArray(err.error?.message)
                      ? err.error.message.join('. ')
                      : (err.error?.message ?? 'No pudimos registrar el pedido. Intenta de nuevo.'),
              }) as ApiError,
          ),
        ),
      );
  }
}
