import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductForm } from './product-form';
import { ProductService } from '../../../../core/services/product';
import { CrearProducto, ProductoFinanciero } from '../../../../core/models/product.model';

describe('ProductForm', () => {
  let component: ProductForm;
  let fixture: ComponentFixture<ProductForm>;
  let productService: jest.Mocked<ProductService>;
  let router: jest.Mocked<Router>;

  const baseProducto: ProductoFinanciero = {
    id: 'ABC123',
    name: 'Producto 1',
    description: 'Descripcion del producto 1',
    logo: 'logo.png',
    date_release: '2024-01-01T00:00:00.000Z',
    date_revision: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    productService = {
      verificarIdentificador: jest.fn(),
      crearProducto: jest.fn(),
      actualizarProducto: jest.fn(),
      getProductos: jest.fn(),
      eliminarProducto: jest.fn(),
    } as unknown as jest.Mocked<ProductService>;
    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({}) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update revision date when release date changes', () => {
    component.formulario.get('date_release')?.setValue('2024-01-15');
    expect(component.formulario.get('date_revision')?.value).toBe('2025-01-15');
  });

  it('should flag past release dates as invalid', () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const valor = ayer.toISOString().split('T')[0];
    const control = component.formulario.get('date_release');

    control?.setValue(valor);
    control?.markAsTouched();
    control?.updateValueAndValidity();

    expect(control?.errors).toEqual({ dateInPast: true });
    expect(component.obtenerMensajeError('date_release')).toBe(
      'La fecha debe ser igual o mayor a la fecha actual',
    );
  });

  it('should mark fields as touched when submitting invalid form', () => {
    const spy = jest.spyOn(component.formulario, 'markAllAsTouched');
    component.alEnviar();
    expect(spy).toHaveBeenCalled();
  });

  it('should send create request and navigate on success', fakeAsync(() => {
    const datos: CrearProducto = {
      id: 'NEW1',
      name: 'Producto nuevo',
      description: 'Descripcion del producto nuevo',
      logo: 'logo.png',
      date_release: '2024-02-01',
      date_revision: '2025-02-01',
    };

    productService.verificarIdentificador.mockReturnValue(of(false));
    component.formulario.setValue(datos);
    tick(500);
    component.formulario.updateValueAndValidity();
    productService.crearProducto.mockReturnValue(of({ message: 'ok', data: datos }));

    component.alEnviar();
    tick(1500);

    expect(productService.crearProducto).toHaveBeenCalledWith(datos);
    expect(component.mensajeExito()).toBe('Producto creado exitosamente');
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  }));

  it('should send update request in edit mode', fakeAsync(() => {
    const datos: CrearProducto = {
      id: 'EDIT1',
      name: 'Producto editado',
      description: 'Descripcion editada',
      logo: 'logo.png',
      date_release: '2024-03-01',
      date_revision: '2025-03-01',
    };

    productService.verificarIdentificador.mockReturnValue(of(false));
    component.esModoEdicion.set(true);
    component.formulario.setValue(datos);
    tick(500);
    component.formulario.updateValueAndValidity();
    productService.actualizarProducto.mockReturnValue(of({ message: 'ok', data: datos }));

    component.alEnviar();
    tick(1500);

    expect(productService.actualizarProducto).toHaveBeenCalledWith(datos.id, datos);
    expect(component.mensajeExito()).toBe('Producto actualizado exitosamente');
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  }));

  it('should reset form for editing keeping the id disabled', () => {
    component.esModoEdicion.set(true);
    component.formulario.get('id')?.setValue(baseProducto.id);
    component.formulario.get('id')?.disable();
    component.alReiniciar();

    expect(component.formulario.get('id')?.value).toBe(baseProducto.id);
    expect(component.formulario.get('id')?.disabled).toBe(true);
    expect(component.error()).toBeNull();
  });

  it('should set error message when loading product fails', () => {
    component.esModoEdicion.set(true);
    productService.getProductos.mockReturnValue(throwError(() => 'Error'));

    (component as unknown as { cargarProductoParaEditar: (id: string) => void }).cargarProductoParaEditar(
      'ABC123',
    );

    expect(component.error()).toBe('Error al cargar datos del producto');
  });
});
