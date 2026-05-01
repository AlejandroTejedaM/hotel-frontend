import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { HuespedRequest, HuespedResponse } from '../models/huesped.model';

@Injectable({
  providedIn: 'root',
})
export class HuespedService {
  private apiUrl: string = environment.apiHuespedes;

  constructor(private http: HttpClient) {}

  getHuespedes(): Observable<HuespedResponse[]> {
    return this.http.get<HuespedResponse[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error al obtener los huéspedes', error);
        return throwError(() => error);
      }),
    );
  }

  getHuesped(id: number): Observable<HuespedResponse> {
    return this.http.get<HuespedResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error al obtener el huésped', error);
        return throwError(() => error);
      }),
    );
  }

  postHuesped(huesped: HuespedRequest): Observable<HuespedResponse> {
    return this.http.post<HuespedResponse>(this.apiUrl, huesped).pipe(
      catchError((error) => {
        console.error('Error al registrar el huésped', error);
        return throwError(() => error);
      }),
    );
  }

  putHuesped(huesped: HuespedRequest, id: number): Observable<HuespedResponse> {
    return this.http.put<HuespedResponse>(`${this.apiUrl}/${id}`, huesped).pipe(
      catchError((error) => {
        console.error('Error al actualizar el huésped', error);
        return throwError(() => error);
      }),
    );
  }

  deleteHuesped(id: number): Observable<HuespedResponse> {
    return this.http.delete<HuespedResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error al eliminar el huésped', error);
        return throwError(() => error);
      }),
    );
  }
}
