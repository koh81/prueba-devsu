import { Component, inject, signal } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product';
import { CrearProducto } from '../../../../core/models/product.model';

import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  private fb = inject(FormBuilder);
  private servicioProducto = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  idProducto = signal<string | null>(null);
  estaCargando = signal(false);
  estaEnviando = signal(false);
  error = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  formulario: FormGroup = this.fb.group({
    id: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
      [this.validadorIdUnicoAsync.bind(this)],
    ],
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', [Validators.required]],
    date_release: ['', [Validators.required, this.validadorFechaLiberacion.bind(this)]],
    date_revision: [{ value: '', disabled: true }, [Validators.required]],
  });

  constructor() {
    this.formulario.get('date_release')?.valueChanges.subscribe((valor) => {
      if (valor) {
        const [year, month, day] = valor.split('-');
        const nuevaFecha = new Date(Number(year) + 1, Number(month) - 1, Number(day));

        const y = nuevaFecha.getFullYear();
        const m = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
        const d = String(nuevaFecha.getDate()).padStart(2, '0');

        this.formulario.get('date_revision')?.setValue(`${y}-${m}-${d}`);
      }
    });
  }

  private validadorFechaLiberacion(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor) return null;

    const fechaInput = new Date(valor);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaInput < hoy) {
      return { dateInPast: true };
    }
    return null;
  }

  tieneError(nombreCampo: string): boolean {
    const campo = this.formulario.get(nombreCampo);
    return !!campo && campo.invalid && (campo.dirty || campo.touched);
  }

  obtenerMensajeError(nombreCampo: string): string {
    const campo = this.formulario.get(nombreCampo);
    if (!campo || !campo.errors) return '';

    const errores = campo.errors;

    if (errores['required']) {
      return 'Este campo es requerido';
    }
    if (errores['minlength']) {
      return `Mínimo ${errores['minlength'].requiredLength} caracteres`;
    }
    if (errores['maxlength']) {
      return `Máximo ${errores['maxlength'].requiredLength} caracteres`;
    }
    if (errores['dateInPast']) {
      return 'La fecha debe ser igual o mayor a la fecha actual';
    }
    if (errores['idExists']) {
      return 'Este ID ya existe';
    }

    return 'Campo inválido';
  }

  private validadorIdUnicoAsync(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value || control.value.length < 3) {
      return of(null);
    }

    return timer(500).pipe(
      switchMap(() => this.servicioProducto.verificarIdentificador(control.value)),
      map((existe: boolean) => (existe ? { idExists: true } : null)),
      catchError(() => of(null)),
    );
  }

  alEnviar(): void {
    if (this.formulario.invalid || this.formulario.pending) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.estaEnviando.set(true);
    this.error.set(null);
    this.mensajeExito.set(null);

    const valorFormulario = this.formulario.getRawValue();

    const datosCreacion: CrearProducto = {
      id: valorFormulario.id,
      name: valorFormulario.name,
      description: valorFormulario.description,
      logo: valorFormulario.logo,
      date_release: valorFormulario.date_release,
      date_revision: valorFormulario.date_revision,
    };

    this.servicioProducto.crearProducto(datosCreacion).subscribe({
      next: () => {
        this.mensajeExito.set('Producto creado exitosamente');
        this.estaEnviando.set(false);
        setTimeout(() => this.router.navigate(['/products']), 1500);
      },
      error: (err: any) => {
        this.error.set(err);
        this.estaEnviando.set(false);
      },
    });
  }

  alReiniciar(): void {
    this.formulario.reset();
    this.error.set(null);
    this.mensajeExito.set(null);
  }
}
