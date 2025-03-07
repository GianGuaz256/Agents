import { NewsCollector } from './news/collector';
import { NewsAnalyzer } from './analysis/analyzer';
import { TelegramDistributor } from './distribution/telegram';

interface NewsAgentConfig {
  anthropicApiKey: string;
  telegramBotToken: string;
  telegramChatId: string;
  newsLimit?: number;
}

export class NewsAgent {
  private collector: NewsCollector;
  private analyzer: NewsAnalyzer;
  private distributor: TelegramDistributor;
  private newsLimit: number;

  constructor(config: NewsAgentConfig) {
    console.log('Initializing NewsAgent components');
    this.collector = new NewsCollector();
    this.analyzer = new NewsAnalyzer(config.anthropicApiKey);
    this.distributor = new TelegramDistributor(
      config.telegramBotToken,
      config.telegramChatId
    );
    this.newsLimit = config.newsLimit || 10;
    console.log(`NewsAgent initialized with news limit: ${this.newsLimit}`);
  }

  async execute(): Promise<void> {
    console.log('Starting news collection process...');
    
    try {
      // Collect news
      console.log(`Attempting to collect top ${this.newsLimit} stories`);
      const rawNews = await this.collector.collectTopStories(this.newsLimit);
      console.log(`Collected ${rawNews.length} news items`);

      if (rawNews.length === 0) {
        console.warn('No news items were collected, check Hacker News API connectivity');
        await this.distributor.sendErrorNotification(
          new Error('No news items were collected from Hacker News')
        );
        return;
      }

      // Clean and validate data
      console.log('Validating and cleaning collected data');
      const validatedNews = await this.collector.validateAndCleanData(rawNews);
      console.log(`Validated ${validatedNews.length} news items`);

      if (validatedNews.length === 0) {
        console.warn('All collected news items failed validation');
        await this.distributor.sendErrorNotification(
          new Error('All collected news items failed validation')
        );
        return;
      }

      // Analyze news
      console.log('Analyzing news items with Claude AI');
      const analyzedNews = await this.analyzer.analyzeNews(validatedNews);
      console.log(`Analyzed ${analyzedNews.length} news items`);

      if (analyzedNews.length === 0) {
        console.warn('All news items failed analysis, check Anthropic API connectivity');
        await this.distributor.sendErrorNotification(
          new Error('All news items failed analysis, check Anthropic API connectivity')
        );
        return;
      }

      // Distribute news
      console.log('Distributing news via Telegram');
      await this.distributor.distributeNews(analyzedNews);
      console.log('News distribution completed successfully');

    } catch (error) {
      console.error('Error in news agent execution:', error);
      
      // Provide more detailed error reporting
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = `${error.name}: ${error.message}`;
        if (error.stack) {
          console.error('Stack trace:', error.stack);
        }
      } else {
        errorMessage = String(error);
      }
      
      console.error(`NewsAgent execution failed: ${errorMessage}`);
      
      try {
        await this.distributor.sendErrorNotification(
          new Error(`NewsAgent execution failed: ${errorMessage}`)
        );
      } catch (notificationError) {
        console.error('Failed to send error notification:', notificationError);
      }
      
      throw error;
    }
  }
} 