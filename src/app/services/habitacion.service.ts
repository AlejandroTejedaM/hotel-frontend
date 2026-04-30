import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { HabitacionRequest, HabitacionResponse } from '../models/habitacion.model';

@Injectable({
  providedIn: 'root',
})
export class HabitacionService {
  private apiUrl: string = environment.apiHabitaciones;

  constructor(private http: HttpClient) {}

  getHabitaciones(): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(this.apiUrl).pipe(
      map((habitaciones) => habitaciones.sort()),
      catchError((error) => {
        console.error('Error al obtener las habitaciones', error);
        return of([]);
      }),
    );
  }

  postHabitacion(habitacion: HabitacionRequest): Observable<HabitacionResponse> {
    return this.http.post<HabitacionResponse>(this.apiUrl, habitacion).pipe(
      catchError((error) => {
        console.error('Error al registrar la habitación', error);
        return throwError(() => error);
      }),
    );
  }

  putHabitacion(habitacion: HabitacionRequest, habitacionId: number): Observable<HabitacionResponse> {
    return this.http.put<HabitacionResponse>(`${this.apiUrl}/${habitacionId}`, habitacion).pipe(
      catchError((error) => {
        console.error('Error al actualizar la habitación', error);
        return throwError(() => error);
      }),
    );
  }

  deleteHabitacion(habitacionId: number): Observable<HabitacionResponse> {
    return this.http.delete<HabitacionResponse>(`${this.apiUrl}/${habitacionId}`).pipe(
      catchError((error) => {
        console.error('Error al eliminar la habitación', error);
        return throwError(() => error);
      }),
    );
  }
}
