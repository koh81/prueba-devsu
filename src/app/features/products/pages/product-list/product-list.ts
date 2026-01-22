import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../../../core/services/product';
import { ProductoFinanciero } from '../../../../core/models/product.model';
import { DatePipe } from '@angular/common';
import { delay } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [DatePipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private servicioProducto = inject(ProductService);
  estaCargando = signal(true);
  error = signal<string | null>(null);
  productos = signal<ProductoFinanciero[]>([]);
  indice: any;
  terminoBusqueda = signal('');
  tamanoPagina = signal(5);
  paginaActual = signal(1);
  router = inject(Router);

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.estaCargando.set(true);
    this.error.set(null);

    this.servicioProducto
      .getProductos()
      .pipe(delay(3000))
      .subscribe({
        next: (productos) => {
          this.productos.set(productos);
          this.estaCargando.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          this.estaCargando.set(false);
        },
      });
  }

  productosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase().trim();
    const todosLosProductos = this.productos();

    if (!termino) {
      return todosLosProductos;
    }

    return todosLosProductos.filter(
      (producto) =>
        producto.name.toLowerCase().includes(termino) ||
        producto.description.toLowerCase().includes(termino) ||
        producto.id.toLowerCase().includes(termino),
    );
  });

  productosPaginados = computed(() => {
    const filtrados = this.productosFiltrados();
    const tamano = this.tamanoPagina();
    const pagina = this.paginaActual();
    const inicio = (pagina - 1) * tamano;
    return filtrados.slice(inicio, inicio + tamano);
  });

  // Total de páginas
  totalPaginas = computed(() => {
    return Math.ceil(this.productosFiltrados().length / this.tamanoPagina());
  });

  // Contador de resultados
  conteoResultados = computed(() => {
    return this.productosFiltrados().length;
  });

  alBuscar(termino: string): void {
    this.terminoBusqueda.set(termino);
    this.paginaActual.set(1);
  }

  alCambiarTamanoPagina(tamano: number): void {
    this.tamanoPagina.set(tamano);
    this.paginaActual.set(1);
  }

  alCambiarPagina(pagina: number): void {
    this.paginaActual.set(pagina);
  }

  alAgregarProducto(): void {
    this.router.navigate(['/products/new']);
  }

  obtenerUrlLogo(logo: string): string {
    if (!logo) return 'assets/placeholder-logo.png';
    if (logo.startsWith('http') || logo.startsWith('assets/') || logo.startsWith('/assets/')) {
      return logo;
    }
    return `assets/${logo}`;
  }

  alErrorImagen(producto: ProductoFinanciero): void {
    const provisional = 'assets/placeholder-logo.png';
    if (producto.logo !== provisional) {
      this.productos.update((productos) =>
        productos.map((p) => (p.id === producto.id ? { ...p, logo: provisional } : p)),
      );
    }
  }
}
