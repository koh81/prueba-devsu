import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductList } from './product-list';
import { ProductService } from '../../../../core/services/product';
import { ProductoFinanciero } from '../../../../core/models/product.model';
import { Router } from '@angular/router';

describe('ProductList', () => {
  let component: ProductList;
  let fixture: ComponentFixture<ProductList>;
  let productService: jest.Mocked<ProductService>;
  let router: jest.Mocked<Router>;

  const productos: ProductoFinanciero[] = [
    {
      id: 'ABC123',
      name: 'Producto 1',
      description: 'Descripcion del producto 1',
      logo: 'logo.png',
      date_release: '2024-01-01',
      date_revision: '2025-01-01',
    },
    {
      id: 'DEF456',
      name: 'Tarjeta',
      description: 'Descripcion tarjeta',
      logo: 'assets/logo.png',
      date_release: '2024-01-02',
      date_revision: '2025-01-02',
    },
  ];

  beforeEach(async () => {
    productService = {
      getProductos: jest.fn().mockReturnValue(of([])),
      eliminarProducto: jest.fn(),
      verificarIdentificador: jest.fn(),
      crearProducto: jest.fn(),
      actualizarProducto: jest.fn(),
    } as unknown as jest.Mocked<ProductService>;
    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [ProductList],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', fakeAsync(() => {
    productService.getProductos.mockReturnValue(of(productos));

    component.cargarProductos();
    tick(3000);

    expect(component.productos()).toEqual(productos);
    expect(component.estaCargando()).toBe(false);
  }));

  it('should filter products by search term', () => {
    component.productos.set(productos);
    component.alBuscar('tarjeta');

    expect(component.productosFiltrados().length).toBe(1);
    expect(component.productosFiltrados()[0].id).toBe('DEF456');
  });

  it('should paginate products', () => {
    component.productos.set(productos);
    component.alCambiarTamanoPagina(1);
    component.alCambiarPagina(2);

    expect(component.productosPaginados().length).toBe(1);
    expect(component.productosPaginados()[0].id).toBe('DEF456');
  });

  it('should resolve logo urls', () => {
    expect(component.obtenerUrlLogo('')).toBe('assets/placeholder-logo.png');
    expect(component.obtenerUrlLogo('assets/logo.png')).toBe('assets/logo.png');
    expect(component.obtenerUrlLogo('http://cdn/logo.png')).toBe('http://cdn/logo.png');
    expect(component.obtenerUrlLogo('logo.png')).toBe('assets/logo.png');
  });

  it('should replace missing logos with placeholder', () => {
    component.productos.set([...productos]);
    component.alErrorImagen(productos[0]);

    expect(component.productos()[0].logo).toBe('assets/placeholder-logo.png');
  });

  it('should open and close delete modal', () => {
    component.alAbrirModalEliminar(productos[0]);
    expect(component.mostrarModalEliminar()).toBe(true);
    expect(component.productoAEliminar()).toEqual(productos[0]);

    component.alCerrarModal();
    expect(component.mostrarModalEliminar()).toBe(false);
    expect(component.productoAEliminar()).toBeNull();
  });

  it('should delete product and refresh list', () => {
    productService.eliminarProducto.mockReturnValue(of({}));
    const spy = jest.spyOn(component, 'cargarProductos').mockImplementation(() => undefined);
    component.productoAEliminar.set(productos[0]);

    component.alConfirmarEliminacion();

    expect(productService.eliminarProducto).toHaveBeenCalledWith('ABC123');
    expect(spy).toHaveBeenCalled();
    expect(component.estaEliminando()).toBe(false);
    expect(component.mostrarModalEliminar()).toBe(false);
  });
});
