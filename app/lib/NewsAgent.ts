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
    this.collector = new NewsCollector();
    this.analyzer = new NewsAnalyzer(config.anthropicApiKey);
    this.distributor = new TelegramDistributor(
      config.telegramBotToken,
      config.telegramChatId
    );
    this.newsLimit = config.newsLimit || 10;
  }

  async execute(): Promise<void> {
    console.log('Starting news collection process...');
    
    try {
      // Collect news
      const rawNews = await this.collector.collectTopStories(this.newsLimit);
      console.log(`Collected ${rawNews.length} news items`);

      // Clean and validate data
      const validatedNews = await this.collector.validateAndCleanData(rawNews);
      console.log(`Validated ${validatedNews.length} news items`);

      // Analyze news
      const analyzedNews = await this.analyzer.analyzeNews(validatedNews);
      console.log(`Analyzed ${analyzedNews.length} news items`);

      // Distribute news
      await this.distributor.distributeNews(analyzedNews);
      console.log('News distribution completed successfully');

    } catch (error) {
      console.error('Error in news agent execution:', error);
      
      if (error instanceof Error) {
        await this.distributor.sendErrorNotification(error);
      } else {
        await this.distributor.sendErrorNotification(
          new Error('An unknown error occurred')
        );
      }
      
      throw error;
    }
  }
} 