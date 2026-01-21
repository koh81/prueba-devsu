import { inject, Injectable } from '@angular/core';
import { ProductoFinanciero, ResponseProductos } from '../models/product.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
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

  // Metodo para obtener los productos financieros
  getProductos(): Observable<ProductoFinanciero[]> {
    return this.http.get<ResponseProductos>(this.urlApi).pipe(
      map((response) => response.data),
      catchError(this.manejarError),
    );
  }

  verificarIdentificador(id: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.urlApi}/verification`, { params: { id } })
      .pipe(catchError(this.manejarError));
  }

  /**
   * Manejo de excepciones HTTP.
   */
  private manejarError(error: HttpErrorResponse): Observable<never> {
    let mensajeError = 'Ocurrió un error inesperado en el sistema.';

    if (error.error instanceof ErrorEvent) {
      mensajeError = `Error: ${error.error.message}`;
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
        default:
          mensajeError = `Código de error: ${error.status}\nMensaje: ${error.message}`;
      }
    }

    return throwError(() => mensajeError);
  }
}
