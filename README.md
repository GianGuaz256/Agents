# News Agent

An automated news collection and distribution system that fetches top tech news from Hacker News, analyzes them using Claude AI, and distributes them through Telegram.

## Features

- Daily automated news collection from Hacker News
- AI-powered news analysis and summarization
- Personalized content relevance scoring
- Automated distribution through Telegram
- Error handling and retry mechanisms
- Secure API endpoints with authentication

## Prerequisites

- Node.js 18+ and npm
- Vercel account (for deployment)
- Anthropic API key (for Claude AI)
- Telegram Bot token and chat ID
- Environment variables setup

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd news-agent
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
CRON_SECRET=your_cron_secret_key
```

4. Run the development server:
```bash
npm run dev
```

## Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Set up environment variables in Vercel:
- Go to your project settings
- Add the environment variables from your `.env.local` file

4. Set up a cron job:
- Use Vercel Cron Jobs or an external service
- Schedule the job to run daily at 9:00 AM CET
- Make a POST request to `/api/cron` with the authorization header:
  ```
  Authorization: Bearer your_cron_secret_key
  ```

## Architecture

The system consists of three main modules:

1. **News Collection Module**
   - Fetches top stories from Hacker News
   - Validates and cleans the data
   - Structures content for analysis

2. **Analysis Module**
   - Processes news using Claude AI
   - Generates summaries
   - Scores content relevance
   - Assesses impact

3. **Distribution Module**
   - Formats content for Telegram
   - Handles message distribution
   - Implements retry mechanism
   - Provides error notifications

## Error Handling

The system includes comprehensive error handling:
- Automatic retries for temporary failures
- Error notifications via Telegram
- Detailed logging
- Graceful degradation

## Monitoring

Monitor the system through:
- Vercel dashboard
- Application logs
- Telegram error notifications
- Custom status endpoints

## License

MIT License - see LICENSE file for details
