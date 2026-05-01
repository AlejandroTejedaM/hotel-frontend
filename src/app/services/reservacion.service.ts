import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { ReservacionRequest, ReservacionResponse } from '../models/reservacion.model';
import { EstadoReserva, IdEstadoReserva } from '../constants/EstadoReserva';

@Injectable({
  providedIn: 'root',
})
export class ReservacionService {
  private apiUrl: string = environment.apiReservaciones;

  constructor(private http: HttpClient) {}

  public getReservaciones(): Observable<ReservacionResponse[]> {
    return this.http.get<ReservacionResponse[]>(this.apiUrl).pipe(
      map((reservaciones) => reservaciones.sort()),
      catchError((error) => {
        console.error('Error al obtener las reservaciones', error);
        return of([]);
      }),
    );
  }

  postReservacion(reservacion: ReservacionRequest): Observable<ReservacionResponse> {
    return this.http.post<ReservacionResponse>(this.apiUrl, reservacion).pipe(
      catchError((error) => {
        console.error('Error al registrar la reservación', error);
        return throwError(() => error);
      }),
    );
  }

  putReservacion(
    reservacion: ReservacionRequest,
    reservacionId: number,
  ): Observable<ReservacionResponse> {
    return this.http.put<ReservacionResponse>(`${this.apiUrl}/${reservacionId}`, reservacion).pipe(
      catchError((error) => {
        console.error('Error al actualizar la reservación', error);
        return throwError(() => error);
      }),
    );
  }

  changeStatus(reservacionId: number, statusReserva: EstadoReserva): Observable<ReservacionResponse> {
    return this.http
      .put<any>(`${this.apiUrl}/${reservacionId}/estado/${IdEstadoReserva[statusReserva]}`, null)
      .pipe(
        catchError((error) => {
          console.error('Error al actualizar la reservación', error);
          return throwError(() => error);
        }),
      );
  }

  deleteReservacion(reservacionId: number): Observable<ReservacionResponse> {
    return this.http.delete<ReservacionResponse>(`${this.apiUrl}/${reservacionId}`).pipe(
      catchError((error) => {
        console.error('Error al eliminar la reservación', error);
        return throwError(() => error);
      }),
    );
  }
}
