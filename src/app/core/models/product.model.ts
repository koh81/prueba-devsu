/**
 * Interfaz que define el modelo de los productos financieros
 */
export interface ProductoFinanciero {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface ResponseProductos{
    data: ProductoFinanciero[];
}