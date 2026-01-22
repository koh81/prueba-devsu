import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/pages/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./features/products/pages/product-form/product-form').then((m) => m.ProductForm),
  },
  {
    path: 'products/edit/:id',
    loadComponent: () =>
      import('./features/products/pages/product-form/product-form').then((m) => m.ProductForm),
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
