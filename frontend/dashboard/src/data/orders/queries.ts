/** Cached public Orders reads shared by every Dashboard workflow. */
'use cache';
import { cacheLife, cacheTag } from 'next/cache';
import { createOrders, type OrderFilters, type OrderStatsOptions } from '@findeg/orders';

export async function getOrders(filters?: OrderFilters) {
  cacheTag('orders');
  cacheLife('minutes');
  return createOrders().list(filters);
}
export async function getOrderById(id: number | string) {
  cacheTag('orders');
  cacheLife('minutes');
  return createOrders().get(id);
}
export async function getOrderDetail(id: number | string) {
  cacheTag('orders');
  cacheLife('minutes');
  return createOrders().detail(id);
}
export async function getRecentOrders(limit = 5) {
  cacheTag('orders');
  cacheLife('minutes');
  return createOrders().recent(limit);
}
export async function getOrderStats(options?: OrderStatsOptions) {
  cacheTag('orders');
  cacheLife('minutes');
  return createOrders().getStats(options);
}
