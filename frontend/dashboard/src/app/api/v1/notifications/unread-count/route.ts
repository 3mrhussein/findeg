import { NextResponse } from 'next/server';

export async function GET() {
  // Simple placeholder for notifications
  return NextResponse.json({ count: 0 });
}
