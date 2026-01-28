import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product';
import { CrearProducto, ProductoFinanciero, ProductoResponse, ResponseProductos } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:3002/bp/products';
  const productos: ProductoFinanciero[] = [
    {
      id: 'ABC123',
      name: 'Producto 1',
      description: 'Descripcion del producto 1',
      logo: 'logo.png',
      date_release: '2024-01-01',
      date_revision: '2025-01-01',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map products from the API response', () => {
    const response: ResponseProductos = { data: productos };
    service.getProductos().subscribe((data) => {
      expect(data).toEqual(productos);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should return false when verification endpoint returns 404', () => {
    service.verificarIdentificador('ABC123').subscribe((exists) => {
      expect(exists).toBe(false);
    });

    const req = httpMock.expectOne(`${baseUrl}/verification?id=ABC123`);
    expect(req.request.method).toBe('GET');
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should surface a friendly error message for bad requests', (done) => {
    service.getProductos().subscribe({
      next: () => done.fail('Expected an error'),
      error: (mensaje) => {
        expect(mensaje).toBe('La solicitud es inválida. Verifique los datos enviados.');
        done();
      },
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('should create a product', () => {
    const nuevoProducto: CrearProducto = {
      id: 'NEW1',
      name: 'Producto nuevo',
      description: 'Descripcion del producto nuevo',
      logo: 'logo.png',
      date_release: '2024-02-01',
      date_revision: '2025-02-01',
    };
    const response: ProductoResponse = {
      message: 'ok',
      data: nuevoProducto,
    };

    service.crearProducto(nuevoProducto).subscribe((data) => {
      expect(data).toEqual(response);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoProducto);
    req.flush(response);
  });
  it('should handle server error (500)', (done) => {
    service.getProductos().subscribe({
      next: () => done.fail('Expected an error'),
      error: (mensaje) => {
        expect(mensaje).toBe('Error interno del servidor. Intente más tarde.');
        done();
      },
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('should handle connection error (0)', (done) => {
    service.getProductos().subscribe({
      next: () => done.fail('Expected an error'),
      error: (mensaje) => {
        expect(mensaje).toBe('No se pudo conectar con el servidor.');
        done();
      },
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({}, { status: 0, statusText: 'Connection Error' });
  });

  it('should handle unknown error with default message', (done) => {
    service.getProductos().subscribe({
      next: () => done.fail('Expected an error'),
      error: (mensaje) => {
        expect(mensaje).toContain('Código de error: 403');
        done();
      },
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({}, { status: 403, statusText: 'Forbidden' });
  });

  it('should handle error with error object message', (done) => {
    const errorMsg = 'Custom error message';
    service.getProductos().subscribe({
      next: () => done.fail('Expected an error'),
      error: (mensaje) => {
        expect(mensaje).toBe(errorMsg);
        done();
      },
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({ message: errorMsg }, { status: 400, statusText: 'Bad Request' });
  });
});
