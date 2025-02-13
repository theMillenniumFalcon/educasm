import { NextResponse } from 'next/server';

export const runtime = 'edge';

export default async function GET() {
  return NextResponse.json({ message: 'Hello World' });
}