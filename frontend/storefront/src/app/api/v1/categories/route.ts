import { NextResponse } from 'next/server';
import { createCategoryService } from '@findeg/backend/features/catalog';
import { parse } from '@findeg/backend/features/core';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const resolvedLocale = parse(lang);
    const categoryService = createCategoryService();
    const tree = await categoryService.getTree(resolvedLocale);
    return NextResponse.json(tree);
  } catch (error) {
    console.error('API /api/v1/categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
