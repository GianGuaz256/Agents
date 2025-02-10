import { NextResponse } from 'next/server';
import { NewsAgent } from '../../lib/NewsAgent';

// Verify the request is from a legitimate source
const verifyRequest = (authHeader: string | null): boolean => {
  const expectedToken = process.env.CRON_SECRET;
  return authHeader === `Bearer ${expectedToken}`;
};

export async function POST(request: Request) {
  try {
    // Verify the request
    const authHeader = request.headers.get('authorization');
    if (!verifyRequest(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize the news agent
    const agent = new NewsAgent({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN!,
      telegramChatId: process.env.TELEGRAM_CHAT_ID!,
      newsLimit: 10,
    });

    // Execute the news collection and distribution process
    await agent.execute();

    return NextResponse.json(
      { message: 'News processing completed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing news:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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