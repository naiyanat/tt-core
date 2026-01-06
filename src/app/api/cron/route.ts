import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { scrapeAllNews } from "@/lib/scrapers";
import { extractDirectNumbers } from "@/lib/number-extractor";
import { analyzeNewsForNumbers } from "@/lib/gemini";

export const maxDuration = 60; // Allow up to 60 seconds for scraping

const RETENTION_DAYS = 15; // Keep only 15 days of news

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Step 1: Delete old news (older than 15 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    console.log(`Cron: Deleting news older than ${cutoffDate.toISOString()}...`);

    // First delete related NumberMatch records
    const oldNews = await prisma.news.findMany({
      where: { createdAt: { lt: cutoffDate } },
      select: { id: true },
    });

    const oldNewsIds = oldNews.map(n => n.id);

    if (oldNewsIds.length > 0) {
      // Delete NumberMatch records for old extracted numbers
      await prisma.numberMatch.deleteMany({
        where: {
          extracted: {
            newsId: { in: oldNewsIds },
          },
        },
      });

      // Delete ExtractedNumber records
      await prisma.extractedNumber.deleteMany({
        where: { newsId: { in: oldNewsIds } },
      });

      // Delete old News records
      const deleted = await prisma.news.deleteMany({
        where: { id: { in: oldNewsIds } },
      });

      console.log(`Cron: Deleted ${deleted.count} old news articles`);
    }

    // Step 2: Scrape new news
    console.log("Cron: Starting news scrape...");

    // Scrape news directly
    const scrapedNews = await scrapeAllNews();
    console.log(`Cron: Scraped ${scrapedNews.length} news articles`);

    let savedCount = 0;
    let numbersCount = 0;

    for (const news of scrapedNews) {
      try {
        // Check if news already exists
        const existing = await prisma.news.findUnique({
          where: { url: news.url },
        });

        if (existing) {
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

        // Analyze with Gemini AI (if API key is set)
        if (process.env.GEMINI_API_KEY) {
          try {
            const aiNumbers = await analyzeNewsForNumbers(news.title, news.content);
            for (const num of aiNumbers) {
              const existingNumber = await prisma.extractedNumber.findFirst({
                where: {
                  newsId: savedNews.id,
                  number: num.number,
                },
              });

              if (!existingNumber) {
                await prisma.extractedNumber.create({
                  data: {
                    newsId: savedNews.id,
                    number: num.number,
                    method: "ai_analyzed",
                    reasoning: num.reasoning,
                    confidence: num.confidence,
                  },
                });
                numbersCount++;
              }
            }
          } catch (aiError) {
            console.error("Cron: AI analysis error:", aiError);
          }
        }
      } catch (newsError) {
        console.error(`Cron: Error processing news: ${news.url}`, newsError);
      }
    }

    console.log(`Cron: Completed - deleted ${oldNewsIds.length} old, saved ${savedCount} new articles, ${numbersCount} numbers`);

    return NextResponse.json({
      success: true,
      message: "Cron job completed",
      stats: {
        deleted: oldNewsIds.length,
        scraped: scrapedNews.length,
        saved: savedCount,
        numbers: numbersCount,
      },
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
