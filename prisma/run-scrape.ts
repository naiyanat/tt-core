import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { scrapeAllNews } from "../src/lib/scrapers/index.js";
import { extractDirectNumbers } from "../src/lib/number-extractor.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const RETENTION_DAYS = 15; // Keep only 15 days of news

async function main() {
  console.log("Starting news scrape...");

  try {
    // Step 1: Delete old news (older than 15 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    console.log(`Deleting news older than ${cutoffDate.toISOString()}...`);

    const oldNews = await prisma.news.findMany({
      where: { createdAt: { lt: cutoffDate } },
      select: { id: true },
    });

    const oldNewsIds = oldNews.map((n) => n.id);

    if (oldNewsIds.length > 0) {
      await prisma.numberMatch.deleteMany({
        where: {
          extracted: {
            newsId: { in: oldNewsIds },
          },
        },
      });

      await prisma.extractedNumber.deleteMany({
        where: { newsId: { in: oldNewsIds } },
      });

      const deleted = await prisma.news.deleteMany({
        where: { id: { in: oldNewsIds } },
      });

      console.log(`Deleted ${deleted.count} old news articles`);
    } else {
      console.log("No old news to delete");
    }

    // Step 2: Scrape new news
    const scrapedNews = await scrapeAllNews();
    console.log(`Scraped ${scrapedNews.length} news articles`);

    let savedCount = 0;
    let numbersCount = 0;

    for (const news of scrapedNews) {
      try {
        // Check if news already exists
        const existing = await prisma.news.findUnique({
          where: { url: news.url },
        });

        if (existing) {
          console.log(`News already exists: ${news.url}`);
          continue;
        }

        // Save news to database
        const savedNews = await prisma.news.create({
          data: {
            title: news.title,
            content: news.content,
            source: news.source,
            category: news.category,
            url: news.url,
            imageUrl: news.imageUrl,
            publishedAt: news.publishedAt,
          },
        });
        savedCount++;
        console.log(`Saved: ${news.title.substring(0, 50)}...`);

        // Extract numbers using Regex
        const directNumbers = extractDirectNumbers(news.title + " " + news.content);
        for (const num of directNumbers) {
          await prisma.extractedNumber.create({
            data: {
              newsId: savedNews.id,
              number: num.number,
              method: num.method,
              reasoning: num.reasoning,
              confidence: num.confidence,
            },
          });
          numbersCount++;
        }
        console.log(`  Extracted ${directNumbers.length} numbers`);
      } catch (newsError) {
        console.error(`Error processing news: ${news.url}`, newsError);
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total scraped: ${scrapedNews.length}`);
    console.log(`New saved: ${savedCount}`);
    console.log(`Numbers extracted: ${numbersCount}`);
  } catch (error) {
    console.error("Scrape error:", error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
