import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
  version: string;
}

export default async function GET(): Promise<NextResponse<HealthResponse>> {
  const healthData: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json'
    }
  });
}