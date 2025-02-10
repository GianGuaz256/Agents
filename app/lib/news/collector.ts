import { z } from 'zod';
import { HackerNewsClient } from '@agentic/hacker-news';

// Define the news item schema
export const NewsItemSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  url: z.string().url().optional(),
  text: z.string().optional(),
  score: z.number().min(0),
  time: z.number(),
  by: z.string().min(1),
  type: z.string(),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;

export class NewsCollector {
  private hn: HackerNewsClient;
  
  constructor() {
    this.hn = new HackerNewsClient();
  }

  async collectTopStories(limit: number = 10): Promise<NewsItem[]> {
    try {
      // Get top story IDs
      const topStoryIds = await this.hn.getTopStories();
      console.log(`Fetched ${topStoryIds.length} top story IDs`);
      
      // Get details for each story
      const stories = await Promise.all(
        topStoryIds.slice(0, limit).map(async (storyId: number) => {
          try {
            const story = await this.hn.getItem(storyId);
            
            // Only process stories (not comments, jobs, etc)
            if (story.type !== 'story') {
              console.log(`Skipping item ${storyId} as it's not a story`);
              return null;
            }
            
            const validatedStory = NewsItemSchema.safeParse(story);
            
            if (!validatedStory.success) {
              console.error(`Invalid story data for ID ${storyId}:`, validatedStory.error);
              return null;
            }
            
            return validatedStory.data;
          } catch (error) {
            console.error(`Error fetching story ${storyId}:`, error);
            return null;
          }
        })
      );

      // Filter out null values and sort by score
      const validStories = stories
        .filter((story): story is NewsItem => story !== null)
        .sort((a, b) => b.score - a.score);

      console.log(`Successfully collected ${validStories.length} valid stories`);
      return validStories;
    } catch (error) {
      console.error('Error collecting top stories:', error);
      throw new Error('Failed to collect news stories');
    }
  }

  async validateAndCleanData(items: NewsItem[]): Promise<NewsItem[]> {
    const validatedItems = items.filter(item => {
      const result = NewsItemSchema.safeParse(item);
      if (!result.success) {
        console.error(`Invalid news item:`, result.error);
        return false;
      }
      return true;
    });

    console.log(`Validated ${validatedItems.length} out of ${items.length} items`);
    return validatedItems;
  }
} 