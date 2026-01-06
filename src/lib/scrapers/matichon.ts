import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedNews } from "./types";

const BASE_URL = "https://www.matichon.co.th";

const ROYAL_KEYWORDS = [
  "พระราชวงศ์",
  "สมเด็จ",
  "พระบาทสมเด็จ",
  "กรมสมเด็จ",
  "พระบรม",
  "เจ้าฟ้า",
  "พระองค์",
  "ทรง",
  "เสด็จ",
];

const ACCIDENT_KEYWORDS = [
  "อุบัติเหตุ",
  "รถชน",
  "ไฟไหม้",
  "จมน้ำ",
  "ระเบิด",
  "ดับ",
  "เสียชีวิต",
  "บาดเจ็บ",
];

const RELIGION_KEYWORDS = [
  "พระ",
  "วัด",
  "พุทธ",
  "ศาสนา",
  "สงฆ์",
  "บุญ",
  "หลวงพ่อ",
  "หลวงปู่",
  "ธรรมะ",
];

const POLITICS_KEYWORDS = [
  "นายกรัฐมนตรี",
  "รัฐบาล",
  "รัฐสภา",
  "พรรค",
  "เลือกตั้ง",
  "รัฐมนตรี",
  "ครม.",
  "ส.ส.",
  "ส.ว.",
];

const LUCKY_NUMBER_KEYWORDS = [
  "เลขเด็ด",
  "หวย",
  "ลอตเตอรี่",
  "สลากกินแบ่ง",
  "เลขท้าย",
  "งวดนี้",
  "เลขดัง",
  "ให้โชค",
  "ขอหวย",
];

type NewsCategory = "royal" | "accident" | "religion" | "politics" | "lucky_number";

function categorizeNews(
  title: string,
  content: string
): NewsCategory | null {
  const text = (title + " " + content).toLowerCase();

  for (const keyword of LUCKY_NUMBER_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      return "lucky_number";
    }
  }

  for (const keyword of ROYAL_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      return "royal";
    }
  }

  for (const keyword of ACCIDENT_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      return "accident";
    }
  }

  for (const keyword of RELIGION_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      return "religion";
    }
  }

  for (const keyword of POLITICS_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      return "politics";
    }
  }

  return null;
}

export async function scrapeMatichon(): Promise<ScrapedNews[]> {
  const news: ScrapedNews[] = [];

  try {
    const urls = [
      `${BASE_URL}/news`,
      `${BASE_URL}/local`,
      `${BASE_URL}/politics`,
      `${BASE_URL}/religion`,
    ];

    for (const pageUrl of urls) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const response = await axios.get(pageUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);

        const articleLinks: string[] = [];
        $('a[href*="matichon.co.th"]').each((_, element) => {
          const href = $(element).attr("href");
          if (href && href.match(/matichon\.co\.th\/[\w-]+\/[\w-]+/)) {
            if (!articleLinks.includes(href)) {
              articleLinks.push(href);
            }
          }
        });

        for (const articleUrl of articleLinks.slice(0, 5)) {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          try {
            const articleResponse = await axios.get(articleUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
              timeout: 10000,
            });

            const article$ = cheerio.load(articleResponse.data);

            const title = article$("h1").first().text().trim() || "";
            const content =
              article$(".entry-content, .td-post-content, article")
                .text()
                .trim() || "";

            let publishedAt = new Date();
            const dateText = article$('time, meta[property="article:published_time"]')
              .first()
              .attr("datetime") ||
              article$('meta[property="article:published_time"]').attr("content");
            if (dateText) {
              publishedAt = new Date(dateText);
            }

            const imageUrl =
              article$('meta[property="og:image"]').attr("content");

            const category = categorizeNews(title, content);
            if (category && title && content.length > 100) {
              news.push({
                title,
                content: content.substring(0, 5000),
                url: articleUrl,
                imageUrl,
                publishedAt,
                source: "matichon",
                category,
              });
            }
          } catch (articleError) {
            console.error(`Error scraping article ${articleUrl}:`, articleError);
          }
        }
      } catch (pageError) {
        console.error(`Error scraping page ${pageUrl}:`, pageError);
      }
    }
  } catch (error) {
    console.error("Error scraping Matichon:", error);
  }

  return news;
}
