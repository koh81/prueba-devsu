import { inject, Injectable } from '@angular/core';
import {
  CrearProducto,
  ProductoFinanciero,
  ProductoResponse,
  ResponseProductos,
} from '../models/product.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Mock environment para la URL base.
const environment = {
  baseUrl: 'http://localhost:3002/bp/products',
};

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private urlApi = environment.baseUrl;

  getProductos(): Observable<ProductoFinanciero[]> {
    return this.http.get<ResponseProductos>(this.urlApi).pipe(
      map((response) => response.data),
      catchError(this.manejarError),
    );
  }

  verificarIdentificador(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.urlApi}/verification`, { params: { id } }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of(false);
        }
        return this.manejarError(error);
      }),
    );
  }

  crearProducto(producto: CrearProducto): Observable<ProductoResponse> {
    return this.http
      .post<ProductoResponse>(this.urlApi, producto)
      .pipe(catchError(this.manejarError));
  }

  actualizarProducto(
    id: string,
    producto: Omit<CrearProducto, 'id'>,
  ): Observable<ProductoResponse> {
    return this.http
      .put<ProductoResponse>(`${this.urlApi}/${id}`, producto)
      .pipe(catchError(this.manejarError));
  }

  // Manejo de errores
  private manejarError(error: HttpErrorResponse): Observable<never> {
    let mensajeError = 'Ocurrió un error inesperado en el sistema.';

    if (error.error instanceof ErrorEvent) {
      mensajeError = `Error: ${error.error.message}`;
    } else {
      if (error.error && typeof error.error === 'object' && error.error.message) {
        mensajeError = error.error.message;
      } else if (typeof error.error === 'string') {
        mensajeError = error.error;
      } else {
        switch (error.status) {
          case 400:
            mensajeError = 'La solicitud es inválida. Verifique los datos enviados.';
            break;
          case 404:
            mensajeError = 'El recurso solicitado no fue encontrado.';
            break;
          case 500:
            mensajeError = 'Error interno del servidor. Intente más tarde.';
            break;
          case 0:
            mensajeError = 'No se pudo conectar con el servidor.';
            break;
          default:
            mensajeError = `Código de error: ${error.status}\nMensaje: ${error.message}`;
        }
      }
    }

    return throwError(() => mensajeError);
  }
}
