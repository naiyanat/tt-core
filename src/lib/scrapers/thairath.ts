import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapedNews } from "./types";

const BASE_URL = "https://www.thairath.co.th";

// Keywords สำหรับกรองข่าว
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
  "พระราชดำรัส",
  "พระราชพิธี",
];

const ACCIDENT_KEYWORDS = [
  "อุบัติเหตุ",
  "รถชน",
  "รถพลิกคว่ำ",
  "ไฟไหม้",
  "จมน้ำ",
  "ตกตึก",
  "ระเบิด",
  "เครื่องบินตก",
  "เรือล่ม",
  "ดับ",
  "เสียชีวิต",
  "บาดเจ็บ",
  "สังเวย",
];

const RELIGION_KEYWORDS = [
  "พระ",
  "วัด",
  "พุทธ",
  "ศาสนา",
  "สงฆ์",
  "บุญ",
  "กฐิน",
  "ผ้าป่า",
  "เจ้าอาวาส",
  "หลวงพ่อ",
  "หลวงปู่",
  "พระธาตุ",
  "มหาเจดีย์",
  "วิปัสสนา",
  "ธรรมะ",
  "นิพพาน",
];

const POLITICS_KEYWORDS = [
  "นายกรัฐมนตรี",
  "รัฐบาล",
  "รัฐสภา",
  "สภาผู้แทน",
  "วุฒิสภา",
  "พรรค",
  "เลือกตั้ง",
  "รัฐมนตรี",
  "ครม.",
  "คณะรัฐมนตรี",
  "กกต.",
  "ส.ส.",
  "ส.ว.",
  "ฝ่ายค้าน",
  "อภิปราย",
  "งบประมาณ",
  "ทำเนียบ",
];

const LUCKY_NUMBER_KEYWORDS = [
  "เลขเด็ด",
  "หวย",
  "ลอตเตอรี่",
  "สลากกินแบ่ง",
  "เลขท้าย",
  "งวดนี้",
  "เลขดัง",
  "เลขมงคล",
  "ให้โชค",
  "ต้นตะเคียน",
  "ไอ้ไข่",
  "ขอหวย",
  "เลขธูป",
  "น้ำมนต์",
  "ปู่ศรีสุทโธ",
];

type NewsCategory = "royal" | "accident" | "religion" | "politics" | "lucky_number";

function categorizeNews(
  title: string,
  content: string
): NewsCategory | null {
  const text = (title + " " + content).toLowerCase();

  // Check lucky_number first (highest priority for this app)
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

export async function scrapeThairath(): Promise<ScrapedNews[]> {
  const news: ScrapedNews[] = [];

  try {
    // Scrape หน้าข่าวหลัก
    const urls = [
      `${BASE_URL}/news/crime`,
      `${BASE_URL}/news/society`,
      `${BASE_URL}/news/royal`,
      `${BASE_URL}/news/politics`,
      `${BASE_URL}/horoscope`,
    ];

    for (const pageUrl of urls) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay 1 second

      const response = await axios.get(pageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);

      // หา link ข่าวจากหน้า listing
      const articleLinks: string[] = [];
      $('a[href*="/news/"], a[href*="/horoscope/"]').each((_, element) => {
        const href = $(element).attr("href");
        if (href && (href.match(/\/news\/\w+\/\d+/) || href.match(/\/horoscope\/\w+\/\d+/))) {
          const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
          if (!articleLinks.includes(fullUrl)) {
            articleLinks.push(fullUrl);
          }
        }
      });

      // Scrape แต่ละข่าว (จำกัด 5 ข่าวต่อหมวด)
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

          const title =
            article$('h1, [class*="title"]').first().text().trim() || "";
          const content =
            article$('article, [class*="content"], [class*="article-body"]')
              .text()
              .trim() || "";

          // หาวันที่
          let publishedAt = new Date();
          const dateText = article$('time, [class*="date"]').first().attr("datetime");
          if (dateText) {
            publishedAt = new Date(dateText);
          }

          // หารูป
          const imageUrl =
            article$('meta[property="og:image"]').attr("content") ||
            article$("article img").first().attr("src");

          // กรองตามหมวดหมู่
          const category = categorizeNews(title, content);
          if (category && title && content.length > 100) {
            news.push({
              title,
              content: content.substring(0, 5000), // จำกัดความยาว
              url: articleUrl,
              imageUrl,
              publishedAt,
              source: "thairath",
              category,
            });
          }
        } catch (articleError) {
          console.error(`Error scraping article ${articleUrl}:`, articleError);
        }
      }
    }
  } catch (error) {
    console.error("Error scraping Thairath:", error);
  }

  return news;
}
