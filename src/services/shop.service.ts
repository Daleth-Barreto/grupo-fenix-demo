/**
 * =============================================================================
 * shop.service.ts — Tienda online / e-commerce (capa SERVICIOS) — TODO / FUTURO
 * =============================================================================
 * PROPÓSITO (FUTURO)
 *   Catálogo y carrito de la tienda online de Grupo Fénix (libros, materiales,
 *   merchandising). Estructura preparada; aún NO conectada a la UI.
 *
 * TODO:
 *   - Endpoints sugeridos:
 *       GET  /shop/products            → catálogo
 *       GET  /shop/products/:id        → detalle
 *       POST /shop/cart                → crear/actualizar carrito
 *       POST /shop/checkout            → reutilizar el flujo de Stripe (useCheckout)
 *   - Reutilizar `payments.service` para el cobro (carrito → PaymentIntent).
 *   - Gestión de inventario (stock) y envíos.
 *   - Crear páginas: src/pages/tienda/ (Catálogo, Detalle, Carrito).
 * =============================================================================
 */

import api from './api'
import type { Product } from '../types'

export const shopService = {
  // TODO: implementar cuando se habilite el módulo de tienda.
  getProducts: () => api.get<Product[]>('/shop/products'),
  getProduct: (id: string) => api.get<Product>(`/shop/products/${id}`),
}
