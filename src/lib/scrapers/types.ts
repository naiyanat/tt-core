export interface ScrapedNews {
  title: string;
  content: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date;
  source: "thairath" | "khaosod" | "matichon";
  category: "royal" | "accident";
}

export interface NewsSource {
  name: string;
  baseUrl: string;
  scrapeNews: () => Promise<ScrapedNews[]>;
}
