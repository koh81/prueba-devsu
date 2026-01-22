# Gestión de Productos Financieros - Prueba Técnica

Este proyecto es una aplicación web desarrollada con **Angular 21** para la gestión de productos financieros. Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) interactuando con una API REST externa.

## 🚀 Requisitos Previos

- **Node.js**: Versión 22 o superior recomendable.
- **npm**: Administrador de paquetes de Node.

## 🛠️ Instalación

1. Clona el repositorio.
2. Navega al directorio del proyecto:
   ```bash
   cd prueba-devsu
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```

## 💻 Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo en `http://localhost:4200/`.
- `npm run build`: Compila la aplicación para producción en la carpeta `dist/`.
- `npm test`: Ejecuta las pruebas unitarias utilizando **Vitest**.

## ✨ Funcionalidades Implementadas

La aplicación incluye las siguientes características:

- **Lista de Productos**: Visualización de productos en una tabla con búsqueda reactiva.
- **Paginación**: Control de cantidad de elementos visibles por página (5, 10, 20).
- **Validación de ID**: Verificación asíncrona de existencia de ID al crear nuevos productos.
- **Cálculo Automático**: La fecha de revisión se calcula automáticamente como un año después de la fecha de liberación.
- **Menú Contextual**: Acciones rápidas (Editar/Eliminar) para cada producto.
- **Edición de Productos**: Formulario pre-cargado para modificar productos existentes (ID bloqueado).
- **Eliminación con Confirmación**: Modal de confirmación antes de eliminar un producto.

## 🏗️ Arquitectura del Proyecto

- **Core**: Contiene servicios, modelos e interceptores compartidos.
  - `ProductService`: Maneja todas las peticiones HTTP y la lógica de errores centralizada.
- **Features**: Módulos de funcionalidad específica.
  - `ProductList`: Componente para visualizar y filtrar productos.
  - `ProductForm`: Componente reactivo para creación y edición.
- **Shared**: Componentes visuales reutilizables (Header, Diálogos).

## 🧪 Pruebas Unitarias

El proyecto utiliza **Vitest** como motor de pruebas para una ejecución rápida y moderna.

- Para ejecutar las pruebas:
  ```bash
  npm test
  ```
- Para ver el reporte de cobertura:
  ```bash
  npm run test:coverage
  ```

Las pruebas cubren validaciones de formulario, lógica de filtrado de señales y manejo de errores en los servicios.

---

Desarrollado como parte de la evaluación técnica para Devsu.
