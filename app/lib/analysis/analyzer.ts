/* eslint-disable @typescript-eslint/no-unused-vars */
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { NewsItem } from '../news/collector';
import { z } from 'zod';

export interface AnalyzedNewsItem extends NewsItem {
  summary: string;
  relevance: number;
  impact: string;
}

const AnalysisResponseSchema = z.object({
  summary: z.string(),
  relevance: z.number().min(1).max(10),
  impact: z.string()
});

type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;

export class NewsAnalyzer {
  private model = anthropic("claude-3-5-sonnet-latest");

  constructor(private apiKey: string) {
    process.env.ANTHROPIC_API_KEY = apiKey;
  }

  async analyzeNews(items: NewsItem[]): Promise<AnalyzedNewsItem[]> {
    const analyzedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const analysis = await this.analyzeItem(item);
          return {
            ...item,
            ...analysis,
          };
        } catch (error) {
          console.error(`Error analyzing item ${item.id}:`, error);
          return null;
        }
      })
    );

    const validItems = analyzedItems.filter((item): item is AnalyzedNewsItem => item !== null);
    console.log(`Analyzed ${validItems.length} news items`);
    return validItems;
  }

  private async analyzeItem(item: NewsItem): Promise<AnalysisResponse> {
    const prompt = `You are a news analyzer. Analyze this tech news item and provide a response in ONLY valid JSON format with these exact keys: summary, relevance, impact.

News Item:
Title: ${item.title}
URL: ${item.url || 'N/A'}
Text: ${item.text || 'N/A'}
Score: ${item.score}

Requirements:
1. summary: A brief 2-3 sentence summary (max 200 characters)
2. relevance: A number from 1-10
3. impact: A brief one-sentence impact assessment (max 100 characters)

Return ONLY the JSON object, nothing else. Example format:
{"summary": "Brief summary here", "relevance": 8, "impact": "Brief impact here"}`;

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.3,
        maxTokens: 1000,
      });

      try {
        const analysis = JSON.parse(text.trim());
        const validatedAnalysis = AnalysisResponseSchema.parse(analysis);
        
        // Enforce length limits
        return {
          summary: validatedAnalysis.summary.slice(0, 200),
          relevance: validatedAnalysis.relevance,
          impact: validatedAnalysis.impact.slice(0, 100)
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', text);
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      console.error('Error analyzing news item:', error);
      throw new Error('Failed to analyze news item');
    }
  }
} 