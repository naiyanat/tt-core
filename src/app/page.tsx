import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import prisma from "@/lib/db";
import { format } from "date-fns";
import { th } from "date-fns/locale";

async function getLatestNews() {
  try {
    return await prisma.news.findMany({
      take: 5,
      orderBy: { publishedAt: "desc" },
      include: {
        extractedNumbers: true,
      },
    });
  } catch {
    return [];
  }
}

async function getTopNumbers() {
  try {
    const numbers = await prisma.extractedNumber.groupBy({
      by: ["number"],
      _count: { number: true },
      orderBy: { _count: { number: "desc" } },
      take: 10,
    });
    return numbers;
  } catch {
    return [];
  }
}

async function getLatestLottery() {
  try {
    return await prisma.lotteryResult.findFirst({
      orderBy: { drawDate: "desc" },
    });
  } catch {
    return null;
  }
}

async function getStats() {
  try {
    const [newsCount, numbersCount, lotteryCount] = await Promise.all([
      prisma.news.count(),
      prisma.extractedNumber.count(),
      prisma.lotteryResult.count(),
    ]);
    return { newsCount, numbersCount, lotteryCount };
  } catch {
    return { newsCount: 0, numbersCount: 0, lotteryCount: 0 };
  }
}

export default async function Home() {
  const [latestNews, topNumbers, latestLottery, stats] = await Promise.all([
    getLatestNews(),
    getTopNumbers(),
    getLatestLottery(),
    getStats(),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          TT-Core
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          ระบบวิเคราะห์ตัวเลขสำคัญจากข่าวไทย และเปรียบเทียบกับผลสลากกินแบ่ง
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ข่าวทั้งหมด</CardDescription>
            <CardTitle className="text-3xl">{stats.newsCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>เลขที่วิเคราะห์ได้</CardDescription>
            <CardTitle className="text-3xl">{stats.numbersCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>งวดสลาก</CardDescription>
            <CardTitle className="text-3xl">{stats.lotteryCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>ผลสลากล่าสุด</CardDescription>
            {latestLottery ? (
              <>
                <CardTitle className="text-3xl text-blue-600">{latestLottery.lastThree}</CardTitle>
                <p className="text-sm text-gray-500">
                  {format(latestLottery.drawDate, "d MMMM yyyy", { locale: th })}
                </p>
              </>
            ) : (
              <CardTitle className="text-xl text-gray-400">-</CardTitle>
            )}
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Numbers */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>เลขเด่น</span>
              <Badge variant="secondary">Top 10</Badge>
            </CardTitle>
            <CardDescription>ตัวเลขที่ปรากฏบ่อยที่สุด</CardDescription>
          </CardHeader>
          <CardContent>
            {topNumbers.length > 0 ? (
              <div className="space-y-2">
                {topNumbers.map((item, index) => (
                  <div
                    key={item.number}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center text-sm font-medium text-gray-500">
                        {index + 1}
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {item.number}
                      </span>
                    </div>
                    <Badge variant="outline">{item._count.number} ครั้ง</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">ยังไม่มีข้อมูล</p>
            )}
            <Link
              href="/numbers"
              className="block mt-4 text-center text-blue-600 hover:underline text-sm"
            >
              ดูทั้งหมด →
            </Link>
          </CardContent>
        </Card>

        {/* Latest News */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ข่าวล่าสุด</CardTitle>
            <CardDescription>ข่าวพร้อมตัวเลขที่วิเคราะห์ได้</CardDescription>
          </CardHeader>
          <CardContent>
            {latestNews.length > 0 ? (
              <div className="space-y-4">
                {latestNews.map((news) => (
                  <Link
                    key={news.id}
                    href={`/news/${news.id}`}
                    className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={news.category === "royal" ? "default" : "destructive"}
                          >
                            {news.category === "royal" ? "พระราชวงศ์" : "อุบัติเหตุ"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {news.source}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {news.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(news.publishedAt, "d MMMM yyyy", { locale: th })}
                        </p>
                      </div>
                      {news.extractedNumbers.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {news.extractedNumbers.slice(0, 3).map((num) => (
                            <Badge
                              key={num.id}
                              variant="outline"
                              className="text-lg font-bold"
                            >
                              {num.number}
                            </Badge>
                          ))}
                          {news.extractedNumbers.length > 3 && (
                            <Badge variant="secondary">
                              +{news.extractedNumbers.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูลข่าว</p>
            )}
            <Link
              href="/news"
              className="block mt-4 text-center text-blue-600 hover:underline text-sm"
            >
              ดูข่าวทั้งหมด →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
