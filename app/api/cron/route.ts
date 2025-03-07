import { NextResponse } from 'next/server';
import { NewsAgent } from '../../lib/NewsAgent';

// Verify the request is from a legitimate source
const verifyRequest = (request: Request): boolean => {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  
  // Check for Vercel's internal cron job header
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  
  // If this is coming from Vercel's internal cron job system
  if (vercelCronHeader === '1') {
    console.log('Request verified as coming from Vercel cron system');
    return true;
  }
  
  // For manual requests or testing, require authorization header
  if (!authHeader) {
    console.log('Authorization header is missing');
    return false;
  }
  
  // For local development and testing with literal ${CRON_SECRET} in header
  if (process.env.NODE_ENV === 'development' && authHeader === 'Bearer ${CRON_SECRET}') {
    console.log('Development mode - accepting template string authorization');
    return true;
  }

  const isValid = authHeader === `Bearer ${expectedToken}`;
  if (!isValid) {
    console.log('Invalid authorization token provided');
  }
  return isValid;
};

export async function POST(request: Request) {
  try {
    console.log('Cron job triggered');
    
    // Verify the request
    if (!verifyRequest(request)) {
      console.log('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate environment variables
    const requiredEnvVars = [
      'ANTHROPIC_API_KEY',
      'TELEGRAM_BOT_TOKEN',
      'TELEGRAM_CHAT_ID'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        return NextResponse.json(
          { error: `Missing required environment variable: ${envVar}` },
          { status: 500 }
        );
      }
    }

    console.log('Initializing news agent');
    
    // Initialize the news agent
    const agent = new NewsAgent({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN!,
      telegramChatId: process.env.TELEGRAM_CHAT_ID!,
      newsLimit: 10,
    });

    // Execute the news collection and distribution process
    console.log('Starting news collection process');
    await agent.execute();
    console.log('News process completed successfully');

    return NextResponse.json(
      { message: 'News processing completed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing news:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 