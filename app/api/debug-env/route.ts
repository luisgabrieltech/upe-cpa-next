import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
} 