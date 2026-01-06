import { ScrapedNews } from "./types";
import { scrapeThairath } from "./thairath";
import { scrapeKhaosod } from "./khaosod";
import { scrapeMatichon } from "./matichon";

export * from "./types";

export async function scrapeAllNews(): Promise<ScrapedNews[]> {
  console.log("Starting news scraping...");
  const allNews: ScrapedNews[] = [];

  try {
    // Scrape จากแต่ละแหล่ง
    console.log("Scraping Thairath...");
    const thairathNews = await scrapeThairath();
    allNews.push(...thairathNews);
    console.log(`Found ${thairathNews.length} news from Thairath`);

    console.log("Scraping Khaosod...");
    const khaosodNews = await scrapeKhaosod();
    allNews.push(...khaosodNews);
    console.log(`Found ${khaosodNews.length} news from Khaosod`);

    console.log("Scraping Matichon...");
    const matichonNews = await scrapeMatichon();
    allNews.push(...matichonNews);
    console.log(`Found ${matichonNews.length} news from Matichon`);

    console.log(`Total scraped news: ${allNews.length}`);
  } catch (error) {
    console.error("Error during scraping:", error);
  }

  return allNews;
}
