# TT-Core - ระบบวิเคราะห์เลขเด่นจากข่าวไทย

## สรุปโครงการ
ระบบรวบรวมข่าวสำคัญจากเว็บข่าวไทย วิเคราะห์ตัวเลข 3 หลัก และเปรียบเทียบกับผลสลากกินแบ่งย้อนหลัง 5 ปี

---

## Requirements

### ขอบเขตข่าว (5 หมวด)
| หมวด | คำค้น | สี |
|------|-------|-----|
| พระราชวงศ์ | สมเด็จ, เจ้าฟ้า, เสด็จ, พระราชพิธี | น้ำเงิน |
| อุบัติเหตุ | รถชน, ไฟไหม้, เสียชีวิต, บาดเจ็บ | แดง |
| ศาสนา | วัด, หลวงพ่อ, ธรรมะ, พระธาตุ | ส้ม |
| การเมือง | รัฐบาล, ส.ส., เลือกตั้ง, ครม. | ม่วง |
| เลขเด็ด | หวย, เลขเด็ด, ขอหวย, ต้นตะเคียน | เขียว |

### แหล่งข้อมูล
- ไทยรัฐ (thairath.co.th)
- ข่าวสด (khaosod.co.th)
- มติชน (matichon.co.th)

### วิธีวิเคราะห์เลข
1. **Regex** - ดึงตัวเลขตรงๆ จากข่าว (ทะเบียนรถ, บ้านเลขที่, วันที่, จำนวนผู้เสียชีวิต)
2. **AI (Gemini)** - วิเคราะห์ความหมายเชิงลึก (ถ้าตั้งค่า API key)

### การแสดงผล
- เว็บไซต์ Next.js เต็มรูปแบบ
- แสดงเลขเด่นสำหรับงวดถัดไป (วิเคราะห์จากข่าว 15 วันก่อนออกผล)
- เปรียบเทียบกับผลสลากย้อนหลัง

### การอัพเดทข้อมูล
- Cron Job รันวันละ 2 ครั้ง (08:00 และ 20:00 เวลาไทย)
- เก็บข่าวย้อนหลังเพียง 15 วัน
- ผลสลากย้อนหลัง 5 ปี (121 งวด)

---

## Technology Stack

| หมวด | เทคโนโลยี |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Neon (PostgreSQL) |
| ORM | Prisma 7 |
| AI | Google Gemini (Free tier) |
| Scraping | Cheerio + Axios |
| Deployment | Vercel |
| Scheduling | Vercel Cron Jobs |

---

## โครงสร้างฐานข้อมูล

### ตาราง `News`
```
id            - UUID
title         - หัวข้อข่าว
content       - เนื้อหาข่าว
source        - แหล่งที่มา (thairath/khaosod/matichon)
category      - หมวดหมู่ (royal/accident/religion/politics/lucky_number)
url           - ลิงก์ต้นฉบับ
imageUrl      - รูปภาพ
publishedAt   - วันที่เผยแพร่
createdAt     - วันที่ดึงข้อมูล
```

### ตาราง `ExtractedNumber`
```
id            - UUID
newsId        - FK เชื่อมกับข่าว
number        - ตัวเลข 3 หลัก
method        - วิธีดึง (direct/ai_analyzed)
reasoning     - เหตุผลที่วิเคราะห์
confidence    - ความมั่นใจ (0-100)
```

### ตาราง `LotteryResult`
```
id            - UUID
drawDate      - วันที่ออกรางวัล
lastThree     - เลขท้าย 3 ตัว
firstPrize    - รางวัลที่ 1 (6 หลัก)
```

### ตาราง `NumberMatch`
```
id            - UUID
extractedId   - FK เชื่อมกับ ExtractedNumber
lotteryId     - FK เชื่อมกับ LotteryResult
matchType     - ประเภทการ match (exact/partial)
```

---

## หน้าเว็บไซต์

| หน้า | URL | รายละเอียด |
|------|-----|------------|
| หน้าแรก | `/` | Dashboard สรุปเลขเด่น, ข่าวล่าสุด, สถิติ |
| ข่าว | `/news` | รายการข่าวทั้งหมด แยกตาม 5 หมวด |
| รายละเอียดข่าว | `/news/[id]` | เนื้อหาข่าว + ตัวเลขที่วิเคราะห์ได้ |
| เลขเด่น | `/numbers` | เลขเด่นสำหรับงวดถัดไป (Top 5) |
| สถิติ | `/stats` | เลขเด่นแยกตามงวด + อัตราความแม่นยำ |
| ผลสลาก | `/lottery` | ผลสลากย้อนหลัง 5 ปี |

---

## API Endpoints

| Endpoint | Method | รายละเอียด |
|----------|--------|------------|
| `/api/cron` | GET | Cron job สำหรับ scrape ข่าว + ลบข่าวเก่า |
| `/api/scrape` | POST | Manual trigger scrape (ต้องมี secret) |

---

## การตั้งค่า Cron Job

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 1,13 * * *"
    }
  ]
}
```
- รันเวลา 08:00 และ 20:00 (เวลาไทย = UTC+7)

---

## Environment Variables

```env
DATABASE_URL=             # Neon PostgreSQL connection string
GEMINI_API_KEY=           # Google Gemini API key (optional)
CRON_SECRET=              # Secret สำหรับ Cron job
```

---

## การวิเคราะห์เลขเด่น

### หลักการ
1. รวบรวมข่าว **15 วันก่อน**วันออกผลสลากแต่ละงวด
2. ดึงตัวเลข 3 หลักจากข่าวทั้งหมด
3. นับความถี่ของแต่ละเลข
4. จัดอันดับ Top 10 เลขเด่น
5. เปรียบเทียบกับผลจริง

### ตัวอย่าง
```
งวด 16 มกราคม 2569
ข่าวที่วิเคราะห์: 12 ข่าว
เลขเด่น: 706 (5 ครั้ง), 145 (3 ครั้ง), 252 (2 ครั้ง)...
ผลออก: 706 ✓ ตรง!
```

---

## Live URL

**Production:** https://tt-core-ten.vercel.app

---

## Scripts

```bash
# Scrape ข่าวแบบ manual
DATABASE_URL="..." npx tsx prisma/run-scrape.ts

# อัพเดทผลสลาก
DATABASE_URL="..." npx tsx prisma/update-lottery.ts

# Generate Prisma client
npm run db:generate

# Deploy to Vercel
vercel --prod
```
