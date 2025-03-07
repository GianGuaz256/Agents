import { NextResponse } from 'next/server';

export async function GET() {
  // Check for required environment variables
  const requiredEnvVars = [
    'ANTHROPIC_API_KEY',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
    'CRON_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    return NextResponse.json({
      status: 'error',
      message: 'Missing required environment variables',
      missingVars,
    }, { status: 500 });
  }
  
  return NextResponse.json({
    status: 'success',
    message: 'All required environment variables are set',
    env: {
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
    },
    timestamp: new Date().toISOString(),
  });
} 