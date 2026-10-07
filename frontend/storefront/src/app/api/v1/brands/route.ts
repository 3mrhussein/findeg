import { NextResponse } from 'next/server';
import { createBrandService } from '@findeg/backend/features/catalog';
import { parse } from '@findeg/backend/features/core';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const resolvedLocale = parse(lang);
    const brandService = createBrandService();
    const brands = await brandService.getAll(true, resolvedLocale);
    return NextResponse.json(brands);
  } catch (error) {
    console.error('API /api/v1/brands error:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}
