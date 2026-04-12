import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface OrderData {
  nombre: string;
  fecha: string;
  direccion: string;
  hora: string;
  sabores: string;
  vasos: string;
  vitroleros: number;
  categoria: string;
  totalCups: number;
  endulzante?: string;
  notas?: string;
  invitados?: number;
  servicioEntrega?: string;
  incluirEnvio?: boolean;
  incluirCarrito?: boolean;
  precioBase?: number;
  precioTotal?: number;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  submitOrder(data: OrderData) {
    return this.http.post('http://localhost:3000/api/orders', data);
  }
}
