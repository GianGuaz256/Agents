import TelegramBot from 'node-telegram-bot-api';
import { AnalyzedNewsItem } from '../analysis/analyzer';
import { format } from 'date-fns';

// Define topics of interest with their emojis
const INTEREST_TOPICS = {
  bitcoin: '₿',
  crypto: '🪙',
  stablecoin: '💵',
  payments: '💳',
  ai: '🤖',
  coding: '👨‍💻',
  programming: '⌨️',
  developer: '🛠️',
  blockchain: '⛓️',
  machine_learning: '🧠'
};

export class TelegramDistributor {
  private bot: TelegramBot;
  private chatId: string;
  private maxRetries: number = 3;

  constructor(token: string, chatId: string) {
    this.bot = new TelegramBot(token, { polling: false });
    this.chatId = chatId;
  }

  async distributeNews(news: AnalyzedNewsItem[]): Promise<void> {
    try {
      // Take only top 5 most relevant news to ensure single message
      const topNews = news
        .sort((a, b) => this.calculateTopicRelevance(b) - this.calculateTopicRelevance(a))
        .slice(0, 5);
      
      const message = this.createMessage(topNews);
      
      let attempts = 0;
      while (attempts < this.maxRetries) {
        try {
          await this.bot.sendMessage(this.chatId, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: false,
          });
          console.log('News distributed successfully');
          break;
        } catch (error) {
          attempts++;
          console.error(`Attempt ${attempts} failed:`, error);
          if (attempts === this.maxRetries) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    } catch (error) {
      console.error('Failed to distribute news:', error);
      throw new Error('Failed to distribute news after maximum retries');
    }
  }

  private calculateTopicRelevance(item: AnalyzedNewsItem): number {
    const content = `${item.title} ${item.summary} ${item.impact}`.toLowerCase();
    let relevance = 0;
    
    for (const topic of Object.keys(INTEREST_TOPICS)) {
      if (content.includes(topic)) {
        relevance += 2;
      }
    }
    
    return relevance + item.relevance;
  }

  private createHeader(): string {
    const now = new Date();
    const formattedDate = format(now, 'MMMM d, yyyy');
    return `🎯 Today's Tech Insights ${now.getHours() < 12 ? '🌅' : '🌆'}\n📅 ${formattedDate}\n\n${this.getTimeEmoji()} Latest updates on Bitcoin, AI, and Tech:`;
  }

  private getTimeEmoji(): string {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙';
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
  }

  private formatNewsItem(item: AnalyzedNewsItem): string {
    const title = item.title.replace(/[<>]/g, '');
    const summary = item.summary.replace(/[<>]/g, '');
    const impact = item.impact.replace(/[<>]/g, '');
    
    // Calculate topic relevance and add relevant emojis
    const topicEmojis = Object.entries(INTEREST_TOPICS)
      .filter(([topic]) => 
        `${title} ${summary}`.toLowerCase().includes(topic)
      )
      .map(([, emoji]) => emoji)
      .join('');
    
    const relevanceIndicator = '🎯'.repeat(Math.min(Math.ceil(item.relevance / 2), 5));
    
    const sourceLink = item.url ? 
      `\n🔗 ${item.url}` : 
      '\n📝 Text-only post';

    return `\n┄┄┄┄┄┄┄┄┄┄┄┄\n
${topicEmojis} ${title}

${summary}

🔮 ${impact}

${relevanceIndicator} ${item.relevance}/10
${sourceLink}`;
  }

  private createMessage(news: AnalyzedNewsItem[]): string {
    const header = this.createHeader();
    const newsItems = news.map(item => this.formatNewsItem(item)).join('');
    return `${header}${newsItems}`;
  }

  async sendErrorNotification(error: Error): Promise<void> {
    try {
      const errorMessage = `⚠️ News Agent Alert:\n${error.message}`;
      await this.bot.sendMessage(this.chatId, errorMessage, {
        parse_mode: 'HTML',
      });
    } catch (sendError) {
      console.error('Failed to send error notification:', sendError);
    }
  }
} 