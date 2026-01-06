import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { scrapeAllNews } from "@/lib/scrapers";
import { extractDirectNumbers } from "@/lib/number-extractor";
import { analyzeNewsForNumbers } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    // Check for authorization (simple secret check)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting news scrape...");

    // Scrape news
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
              // Check if number already exists for this news
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
            console.error("AI analysis error:", aiError);
          }
        }
      } catch (newsError) {
        console.error(`Error processing news: ${news.url}`, newsError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Scraped ${scrapedNews.length} articles, saved ${savedCount} new, extracted ${numbersCount} numbers`,
      stats: {
        scraped: scrapedNews.length,
        saved: savedCount,
        numbers: numbersCount,
      },
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Failed to scrape news" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to trigger scraping",
    usage: "POST /api/scrape?secret=YOUR_CRON_SECRET",
  });
}
