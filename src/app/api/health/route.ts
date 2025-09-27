import { NextResponse } from 'next/server';

/**
 * Health check endpoint to verify if the server is running
 * This is a public API route that returns server status and timestamp
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      status: 'error',
      message: 'Server error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
