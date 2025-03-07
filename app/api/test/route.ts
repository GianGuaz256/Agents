import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Check for required environment variables
  const requiredEnvVars = [
    'ANTHROPIC_API_KEY',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
    'CRON_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  // Check Vercel specific headers that would be present in production
  const vercelEnv = process.env.VERCEL_ENV || 'development';
  const isVercelProd = vercelEnv === 'production';
  const hasVercelCronHeader = request.headers.get('x-vercel-cron') === '1';
  
  return NextResponse.json({
    status: missingVars.length > 0 ? 'error' : 'success',
    message: missingVars.length > 0 
      ? 'Missing required environment variables' 
      : 'All required environment variables are set',
    missingVars: missingVars.length > 0 ? missingVars : undefined,
    env: {
      node_env: process.env.NODE_ENV,
      vercel_env: vercelEnv,
      is_vercel_prod: isVercelProd,
    },
    headers: {
      has_vercel_cron_header: hasVercelCronHeader,
    },
    timestamp: new Date().toISOString(),
  }, { status: missingVars.length > 0 ? 500 : 200 });
}

// Add a POST method to test the cron endpoint with authorization
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  
  // Check authorization
  const isAuthorized = (authHeader === `Bearer ${expectedToken}`);
  
  // Mock a Vercel cron job request for testing
  const mockVercelCronHeaders = new Headers(request.headers);
  mockVercelCronHeaders.set('x-vercel-cron', '1');
  
  return NextResponse.json({
    status: 'success',
    auth_check: {
      has_auth_header: !!authHeader,
      is_authorized: isAuthorized,
    },
    mock_vercel_cron: {
      would_pass: true, // Since Vercel cron jobs are automatically authorized
      test_url: '/api/cron',
      test_method: 'POST'
    },
    message: 'To test the cron job, make a POST request to /api/cron with the x-vercel-cron: 1 header',
    timestamp: new Date().toISOString(),
  });
} 