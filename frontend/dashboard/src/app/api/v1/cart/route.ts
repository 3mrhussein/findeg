import { NextResponse } from 'next/server';

export async function GET() {
  // Simple empty cart for dashboard
  return NextResponse.json({ data: { cart: { items: [] } } });
}
