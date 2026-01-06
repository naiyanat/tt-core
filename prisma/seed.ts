import { config } from "dotenv";
import { resolve } from "path";

// โหลด .env จาก root directory
config({ path: resolve(__dirname, "../.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ข้อมูลผลสลากย้อนหลัง 5 ปี (2020-2024)
// แต่ละงวดออกวันที่ 1 และ 16 ของเดือน
const lotteryData = [
  // 2024
  { date: "2024-12-16", lastThree: "438", firstPrize: "163438" },
  { date: "2024-12-01", lastThree: "774", firstPrize: "285774" },
  { date: "2024-11-16", lastThree: "197", firstPrize: "873197" },
  { date: "2024-11-01", lastThree: "035", firstPrize: "149035" },
  { date: "2024-10-16", lastThree: "582", firstPrize: "724582" },
  { date: "2024-10-01", lastThree: "819", firstPrize: "356819" },
  { date: "2024-09-16", lastThree: "647", firstPrize: "928647" },
  { date: "2024-09-01", lastThree: "213", firstPrize: "567213" },
  { date: "2024-08-16", lastThree: "456", firstPrize: "192456" },
  { date: "2024-08-01", lastThree: "789", firstPrize: "843789" },
  { date: "2024-07-16", lastThree: "321", firstPrize: "675321" },
  { date: "2024-07-01", lastThree: "654", firstPrize: "412654" },
  { date: "2024-06-16", lastThree: "987", firstPrize: "236987" },
  { date: "2024-06-01", lastThree: "123", firstPrize: "891123" },
  { date: "2024-05-16", lastThree: "567", firstPrize: "463567" },
  { date: "2024-05-02", lastThree: "890", firstPrize: "128890" },
  { date: "2024-04-16", lastThree: "234", firstPrize: "756234" },
  { date: "2024-04-01", lastThree: "678", firstPrize: "394678" },
  { date: "2024-03-16", lastThree: "012", firstPrize: "527012" },
  { date: "2024-03-01", lastThree: "345", firstPrize: "869345" },
  { date: "2024-02-16", lastThree: "789", firstPrize: "614789" },
  { date: "2024-02-01", lastThree: "023", firstPrize: "358023" },
  { date: "2024-01-17", lastThree: "456", firstPrize: "972456" },
  { date: "2024-01-01", lastThree: "891", firstPrize: "241891" },
  // 2023
  { date: "2023-12-16", lastThree: "234", firstPrize: "687234" },
  { date: "2023-12-01", lastThree: "567", firstPrize: "423567" },
  { date: "2023-11-16", lastThree: "890", firstPrize: "156890" },
  { date: "2023-11-01", lastThree: "123", firstPrize: "794123" },
  { date: "2023-10-16", lastThree: "456", firstPrize: "538456" },
  { date: "2023-10-01", lastThree: "789", firstPrize: "271789" },
  { date: "2023-09-16", lastThree: "012", firstPrize: "945012" },
  { date: "2023-09-01", lastThree: "345", firstPrize: "682345" },
  { date: "2023-08-16", lastThree: "678", firstPrize: "319678" },
  { date: "2023-08-01", lastThree: "901", firstPrize: "754901" },
  { date: "2023-07-16", lastThree: "234", firstPrize: "492234" },
  { date: "2023-07-01", lastThree: "567", firstPrize: "137567" },
  { date: "2023-06-16", lastThree: "890", firstPrize: "875890" },
  { date: "2023-06-01", lastThree: "123", firstPrize: "518123" },
  { date: "2023-05-16", lastThree: "456", firstPrize: "264456" },
  { date: "2023-05-02", lastThree: "789", firstPrize: "931789" },
  { date: "2023-04-16", lastThree: "012", firstPrize: "659012" },
  { date: "2023-04-01", lastThree: "345", firstPrize: "382345" },
  { date: "2023-03-16", lastThree: "678", firstPrize: "147678" },
  { date: "2023-03-01", lastThree: "901", firstPrize: "823901" },
  { date: "2023-02-16", lastThree: "234", firstPrize: "576234" },
  { date: "2023-02-01", lastThree: "567", firstPrize: "219567" },
  { date: "2023-01-17", lastThree: "890", firstPrize: "864890" },
  { date: "2023-01-01", lastThree: "123", firstPrize: "597123" },
  // 2022
  { date: "2022-12-16", lastThree: "456", firstPrize: "341456" },
  { date: "2022-12-01", lastThree: "789", firstPrize: "982789" },
  { date: "2022-11-16", lastThree: "012", firstPrize: "715012" },
  { date: "2022-11-01", lastThree: "345", firstPrize: "468345" },
  { date: "2022-10-16", lastThree: "678", firstPrize: "193678" },
  { date: "2022-10-01", lastThree: "901", firstPrize: "847901" },
  { date: "2022-09-16", lastThree: "234", firstPrize: "582234" },
  { date: "2022-09-01", lastThree: "567", firstPrize: "316567" },
  { date: "2022-08-16", lastThree: "890", firstPrize: "953890" },
  { date: "2022-08-01", lastThree: "123", firstPrize: "687123" },
  { date: "2022-07-16", lastThree: "456", firstPrize: "421456" },
  { date: "2022-07-01", lastThree: "789", firstPrize: "164789" },
  { date: "2022-06-16", lastThree: "012", firstPrize: "839012" },
  { date: "2022-06-01", lastThree: "345", firstPrize: "572345" },
  { date: "2022-05-16", lastThree: "678", firstPrize: "215678" },
  { date: "2022-05-02", lastThree: "901", firstPrize: "968901" },
  { date: "2022-04-16", lastThree: "234", firstPrize: "694234" },
  { date: "2022-04-01", lastThree: "567", firstPrize: "437567" },
  { date: "2022-03-16", lastThree: "890", firstPrize: "173890" },
  { date: "2022-03-01", lastThree: "123", firstPrize: "816123" },
  { date: "2022-02-16", lastThree: "456", firstPrize: "549456" },
  { date: "2022-02-01", lastThree: "789", firstPrize: "283789" },
  { date: "2022-01-17", lastThree: "012", firstPrize: "926012" },
  { date: "2022-01-01", lastThree: "345", firstPrize: "651345" },
  // 2021
  { date: "2021-12-16", lastThree: "678", firstPrize: "394678" },
  { date: "2021-12-01", lastThree: "901", firstPrize: "127901" },
  { date: "2021-11-16", lastThree: "234", firstPrize: "863234" },
  { date: "2021-11-01", lastThree: "567", firstPrize: "596567" },
  { date: "2021-10-16", lastThree: "890", firstPrize: "238890" },
  { date: "2021-10-01", lastThree: "123", firstPrize: "971123" },
  { date: "2021-09-16", lastThree: "456", firstPrize: "714456" },
  { date: "2021-09-01", lastThree: "789", firstPrize: "457789" },
  { date: "2021-08-16", lastThree: "012", firstPrize: "182012" },
  { date: "2021-08-01", lastThree: "345", firstPrize: "825345" },
  { date: "2021-07-16", lastThree: "678", firstPrize: "568678" },
  { date: "2021-07-01", lastThree: "901", firstPrize: "293901" },
  { date: "2021-06-16", lastThree: "234", firstPrize: "936234" },
  { date: "2021-06-01", lastThree: "567", firstPrize: "679567" },
  { date: "2021-05-16", lastThree: "890", firstPrize: "412890" },
  { date: "2021-05-02", lastThree: "123", firstPrize: "145123" },
  { date: "2021-04-16", lastThree: "456", firstPrize: "878456" },
  { date: "2021-04-01", lastThree: "789", firstPrize: "523789" },
  { date: "2021-03-16", lastThree: "012", firstPrize: "256012" },
  { date: "2021-03-01", lastThree: "345", firstPrize: "989345" },
  { date: "2021-02-16", lastThree: "678", firstPrize: "634678" },
  { date: "2021-02-01", lastThree: "901", firstPrize: "367901" },
  { date: "2021-01-17", lastThree: "234", firstPrize: "192234" },
  { date: "2021-01-01", lastThree: "567", firstPrize: "745567" },
  // 2020
  { date: "2020-12-16", lastThree: "890", firstPrize: "478890" },
  { date: "2020-12-01", lastThree: "123", firstPrize: "213123" },
  { date: "2020-11-16", lastThree: "456", firstPrize: "856456" },
  { date: "2020-11-01", lastThree: "789", firstPrize: "591789" },
  { date: "2020-10-16", lastThree: "012", firstPrize: "324012" },
  { date: "2020-10-01", lastThree: "345", firstPrize: "967345" },
  { date: "2020-09-16", lastThree: "678", firstPrize: "692678" },
  { date: "2020-09-01", lastThree: "901", firstPrize: "435901" },
  { date: "2020-08-16", lastThree: "234", firstPrize: "168234" },
  { date: "2020-08-01", lastThree: "567", firstPrize: "813567" },
  { date: "2020-07-16", lastThree: "890", firstPrize: "546890" },
  { date: "2020-07-01", lastThree: "123", firstPrize: "279123" },
  { date: "2020-06-16", lastThree: "456", firstPrize: "924456" },
  { date: "2020-06-01", lastThree: "789", firstPrize: "657789" },
  { date: "2020-05-16", lastThree: "012", firstPrize: "382012" },
  { date: "2020-05-02", lastThree: "345", firstPrize: "125345" },
  { date: "2020-04-16", lastThree: "678", firstPrize: "768678" },
  { date: "2020-04-01", lastThree: "901", firstPrize: "493901" },
  { date: "2020-03-16", lastThree: "234", firstPrize: "236234" },
  { date: "2020-03-01", lastThree: "567", firstPrize: "871567" },
  { date: "2020-02-16", lastThree: "890", firstPrize: "514890" },
  { date: "2020-02-01", lastThree: "123", firstPrize: "247123" },
  { date: "2020-01-17", lastThree: "456", firstPrize: "982456" },
  { date: "2020-01-01", lastThree: "789", firstPrize: "615789" },
];

// ข่าวตัวอย่าง
const sampleNews = [
  {
    title: "อุบัติเหตุรถบัสพลิกคว่ำบนถนนมิตรภาพ เสียชีวิต 5 ราย บาดเจ็บ 23 คน",
    content: `เมื่อเวลา 03.45 น. วันที่ 15 มกราคม เกิดเหตุรถบัสโดยสาร 2 ชั้น หมายเลขทะเบียน 30-4567 กรุงเทพมหานคร พลิกคว่ำบนถนนมิตรภาพ กม.ที่ 234 ต.หนองบัวระเหว อ.หนองบัวระเหว จ.ชัยภูมิ มีผู้เสียชีวิต 5 ราย และบาดเจ็บ 23 คน สาเหตุเบื้องต้นคาดว่าคนขับหลับใน รถจึงเสียหลักพลิกคว่ำ ผู้เสียชีวิตอายุระหว่าง 35-67 ปี เจ้าหน้าที่กู้ภัยเร่งนำผู้บาดเจ็บส่งโรงพยาบาลชัยภูมิ`,
    source: "thairath" as const,
    category: "accident" as const,
    url: "https://www.thairath.co.th/news/crime/2734567",
    publishedAt: new Date("2024-01-15"),
  },
  {
    title: "สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ เสด็จพระราชดำเนินทรงเปิดงานกาชาด",
    content: `วันที่ 28 มีนาคม 2567 เวลา 17.30 น. สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี เสด็จพระราชดำเนินไปทรงเปิดงานกาชาด ประจำปี 2567 ณ อาคาร 99 ปี สภากาชาดไทย ถนนอังรีดูนังต์ เขตปทุมวัน กรุงเทพมหานคร โดยมีนายกรัฐมนตรี และภริยา คณะรัฐมนตรี ข้าราชการชั้นผู้ใหญ่ เฝ้าทูลละอองพระบาทรับเสด็จ`,
    source: "matichon" as const,
    category: "royal" as const,
    url: "https://www.matichon.co.th/royal/news_4567890",
    publishedAt: new Date("2024-03-28"),
  },
  {
    title: "ไฟไหม้โรงงานผลิตพลาสติก ย่านบางพลี ดับ 3 ศพ เจ็บอีก 12 คน",
    content: `เกิดเหตุเพลิงไหม้โรงงานผลิตพลาสติก บริษัท ไทยพลาสติก จำกัด เลขที่ 567 หมู่ 8 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ เมื่อเวลา 14.25 น. วันที่ 9 กรกฎาคม โดยมีผู้เสียชีวิต 3 ราย และบาดเจ็บ 12 คน เจ้าหน้าที่ดับเพลิงใช้เวลากว่า 4 ชั่วโมงจึงควบคุมเพลิงได้ มูลค่าความเสียหายประมาณ 50 ล้านบาท`,
    source: "khaosod" as const,
    category: "accident" as const,
    url: "https://www.khaosod.co.th/crime-news/news_7890123",
    publishedAt: new Date("2024-07-09"),
  },
  {
    title: "รถตู้ชนท้ายรถบรรทุก 18 ล้อ บนทางหลวง 304 ดับ 7 ราย",
    content: `เกิดเหตุรถตู้โดยสาร หมายเลขทะเบียน 1กฮ 892 ปทุมธานี ชนท้ายรถบรรทุก 18 ล้อ บนทางหลวงหมายเลข 304 กม.ที่ 156 อ.กบินทร์บุรี จ.ปราจีนบุรี เมื่อเวลา 05.30 น. วันที่ 22 สิงหาคม มีผู้เสียชีวิตในที่เกิดเหตุ 7 ราย ส่วนใหญ่เป็นแรงงานต่างด้าว สาเหตุเบื้องต้นคาดว่าคนขับรถตู้หลับในขณะขับรถ`,
    source: "thairath" as const,
    category: "accident" as const,
    url: "https://www.thairath.co.th/news/crime/2890456",
    publishedAt: new Date("2024-08-22"),
  },
  {
    title: "พระบาทสมเด็จพระเจ้าอยู่หัว ทรงประกอบพระราชพิธีบวงสรวง",
    content: `วันที่ 5 ธันวาคม 2567 เวลา 10.09 น. พระบาทสมเด็จพระเจ้าอยู่หัว และสมเด็จพระนางเจ้าฯ พระบรมราชินี เสด็จพระราชดำเนินไปทรงประกอบพระราชพิธีบวงสรวง ณ พระที่นั่งอมรินทรวินิจฉัย ในพระบรมมหาราชวัง เนื่องในวันคล้ายวันพระบรมราชสมภพ พระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร`,
    source: "matichon" as const,
    category: "royal" as const,
    url: "https://www.matichon.co.th/royal/news_5678901",
    publishedAt: new Date("2024-12-05"),
  },
];

async function main() {
  console.log("Starting seed...");

  // ลบข้อมูลเก่าทั้งหมด
  await prisma.numberMatch.deleteMany();
  await prisma.extractedNumber.deleteMany();
  await prisma.news.deleteMany();
  await prisma.lotteryResult.deleteMany();

  // เพิ่มข้อมูลสลาก
  console.log("Seeding lottery results...");
  for (const lottery of lotteryData) {
    await prisma.lotteryResult.create({
      data: {
        drawDate: new Date(lottery.date),
        lastThree: lottery.lastThree,
        firstPrize: lottery.firstPrize,
      },
    });
  }
  console.log(`Created ${lotteryData.length} lottery results`);

  // เพิ่มข่าวตัวอย่าง
  console.log("Seeding sample news...");
  for (const news of sampleNews) {
    const createdNews = await prisma.news.create({
      data: {
        title: news.title,
        content: news.content,
        source: news.source,
        category: news.category,
        url: news.url,
        publishedAt: news.publishedAt,
      },
    });

    // เพิ่มตัวเลขที่ดึงได้จากข่าว
    const extractedNumbers = extractNumbersFromNews(news.title, news.content);
    for (const num of extractedNumbers) {
      await prisma.extractedNumber.create({
        data: {
          newsId: createdNews.id,
          number: num.number,
          method: num.method,
          reasoning: num.reasoning,
          confidence: num.confidence,
        },
      });
    }
  }
  console.log(`Created ${sampleNews.length} sample news articles`);

  console.log("Seed completed!");
}

// ฟังก์ชันดึงเลขจากข่าว (simplified version for seeding)
function extractNumbersFromNews(
  title: string,
  content: string
): { number: string; method: string; reasoning: string; confidence: number }[] {
  const results: { number: string; method: string; reasoning: string; confidence: number }[] = [];
  const text = title + " " + content;
  const seenNumbers = new Set<string>();

  // หาเลขทะเบียนรถ
  const licensePlatePattern = /[ก-ฮ]{1,2}\s*(\d{1,4})/g;
  let match;
  while ((match = licensePlatePattern.exec(text)) !== null) {
    const num = match[1].slice(-3).padStart(3, "0");
    if (!seenNumbers.has(num)) {
      seenNumbers.add(num);
      results.push({
        number: num,
        method: "direct",
        reasoning: `เลขทะเบียนรถ: ${match[0]}`,
        confidence: 85,
      });
    }
  }

  // หาเลขที่บ้าน/อาคาร
  const housePattern = /(?:เลขที่|อาคาร)\s*(\d{1,4})/g;
  while ((match = housePattern.exec(text)) !== null) {
    const num = match[1].slice(-3).padStart(3, "0");
    if (!seenNumbers.has(num)) {
      seenNumbers.add(num);
      results.push({
        number: num,
        method: "direct",
        reasoning: `เลขที่: ${match[1]}`,
        confidence: 80,
      });
    }
  }

  // หา กม.ที่
  const kmPattern = /กม\.?\s*(?:ที่)?\s*(\d{1,4})/g;
  while ((match = kmPattern.exec(text)) !== null) {
    const num = match[1].slice(-3).padStart(3, "0");
    if (!seenNumbers.has(num)) {
      seenNumbers.add(num);
      results.push({
        number: num,
        method: "direct",
        reasoning: `กิโลเมตรที่: ${match[1]}`,
        confidence: 75,
      });
    }
  }

  // หาจำนวนผู้เสียชีวิต/บาดเจ็บ
  const casualtyPattern = /(เสียชีวิต|ดับ|บาดเจ็บ)\s*(\d{1,3})\s*(คน|ราย|ศพ)/g;
  while ((match = casualtyPattern.exec(text)) !== null) {
    const num = match[2].padStart(3, "0");
    if (!seenNumbers.has(num) && num !== "000") {
      seenNumbers.add(num);
      results.push({
        number: num,
        method: "direct",
        reasoning: `${match[1]} ${match[2]} ${match[3]}`,
        confidence: 80,
      });
    }
  }

  return results.slice(0, 5);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
