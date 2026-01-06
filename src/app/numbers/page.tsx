import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import prisma from "@/lib/db";
import { format, subDays } from "date-fns";
import { th } from "date-fns/locale";

// Revalidate every 60 seconds
export const revalidate = 60;

// Get next lottery draw date (1st or 16th of month)
function getNextDrawDate(): Date {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (currentDay < 1) {
    return new Date(currentYear, currentMonth, 1);
  } else if (currentDay < 16) {
    return new Date(currentYear, currentMonth, 16);
  } else {
    // Next month's 1st
    return new Date(currentYear, currentMonth + 1, 1);
  }
}

async function getHotNumbersForNextDraw() {
  try {
    const nextDraw = getNextDrawDate();
    const periodStart = subDays(nextDraw, 15);
    const now = new Date();

    // Get news from the last 15 days (or since periodStart)
    const newsInPeriod = await prisma.news.findMany({
      where: {
        publishedAt: {
          gte: periodStart,
          lte: now,
        },
      },
      include: {
        extractedNumbers: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    // Count number frequency
    const numberCounts: Record<string, { count: number; sources: string[] }> = {};
    for (const news of newsInPeriod) {
      for (const extracted of news.extractedNumbers) {
        if (!numberCounts[extracted.number]) {
          numberCounts[extracted.number] = { count: 0, sources: [] };
        }
        numberCounts[extracted.number].count++;
        if (!numberCounts[extracted.number].sources.includes(news.source)) {
          numberCounts[extracted.number].sources.push(news.source);
        }
      }
    }

    // Sort by frequency
    const hotNumbers = Object.entries(numberCounts)
      .map(([number, data]) => ({
        number,
        count: data.count,
        sources: data.sources,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      nextDraw,
      periodStart,
      newsCount: newsInPeriod.length,
      hotNumbers,
    };
  } catch {
    return {
      nextDraw: getNextDrawDate(),
      periodStart: subDays(getNextDrawDate(), 15),
      newsCount: 0,
      hotNumbers: [],
    };
  }
}

async function getRecentNumbers() {
  try {
    return await prisma.extractedNumber.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        news: {
          select: {
            id: true,
            title: true,
            publishedAt: true,
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function NumbersPage() {
  const [hotData, recentNumbers] = await Promise.all([
    getHotNumbersForNextDraw(),
    getRecentNumbers(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">เลขเด่น</h1>
        <p className="text-gray-600 mt-2">
          รวบรวมตัวเลขที่วิเคราะห์ได้จากข่าว 15 วันก่อนออกผลสลาก
        </p>
      </div>

      {/* Hot Numbers for Next Draw */}
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-blue-800">
                เลขเด่นสำหรับงวด {format(hotData.nextDraw, "d MMMM yyyy", { locale: th })}
              </CardTitle>
              <CardDescription>
                วิเคราะห์จากข่าว {hotData.newsCount} ข่าว ระหว่าง{" "}
                {format(hotData.periodStart, "d MMM", { locale: th })} -{" "}
                {format(new Date(), "d MMM yyyy", { locale: th })}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {hotData.hotNumbers.length} เลข
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {hotData.hotNumbers.length > 0 ? (
            <>
              {/* Top 5 Hot Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                {hotData.hotNumbers.slice(0, 5).map((item, index) => (
                  <div
                    key={item.number}
                    className={`p-4 rounded-xl border-2 text-center ${
                      index === 0
                        ? "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400"
                        : index === 1
                        ? "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400"
                        : index === 2
                        ? "bg-gradient-to-br from-orange-100 to-orange-200 border-orange-400"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      อันดับ {index + 1}
                    </div>
                    <div
                      className={`text-4xl font-bold mb-2 ${
                        index === 0
                          ? "text-yellow-700"
                          : index === 1
                          ? "text-gray-700"
                          : index === 2
                          ? "text-orange-700"
                          : "text-blue-600"
                      }`}
                    >
                      {item.number}
                    </div>
                    <Badge variant="outline">{item.count} ครั้ง</Badge>
                    <div className="text-xs text-gray-500 mt-2">
                      {item.sources.join(", ")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rest of numbers */}
              {hotData.hotNumbers.length > 5 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">
                    เลขเด่นอื่นๆ
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {hotData.hotNumbers.slice(5, 20).map((item, index) => (
                      <div
                        key={item.number}
                        className="px-3 py-2 bg-white rounded-lg border text-center"
                      >
                        <div className="text-lg font-bold text-gray-700">
                          {item.number}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.count} ครั้ง
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">
              ยังไม่มีข่าวในช่วง 15 วันก่อนงวดนี้
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>เลขที่ไม่ซ้ำกัน</CardDescription>
            <CardTitle className="text-2xl">{hotData.hotNumbers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>จำนวนครั้งรวม</CardDescription>
            <CardTitle className="text-2xl">
              {hotData.hotNumbers.reduce((acc, curr) => acc + curr.count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ข่าวที่วิเคราะห์</CardDescription>
            <CardTitle className="text-2xl">{hotData.newsCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Numbers with News */}
      <Card>
        <CardHeader>
          <CardTitle>เลขล่าสุดที่วิเคราะห์ได้</CardTitle>
          <CardDescription>
            ตัวเลขที่ดึงได้จากข่าวล่าสุด พร้อมแหล่งที่มา
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentNumbers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">เลข</TableHead>
                  <TableHead>ข่าว</TableHead>
                  <TableHead className="w-32">วันที่ข่าว</TableHead>
                  <TableHead className="w-32">วิธีการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentNumbers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-2xl font-bold text-blue-600">
                        {item.number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/news/${item.news.id}`}
                        className="text-blue-600 hover:underline line-clamp-1"
                      >
                        {item.news.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(item.news.publishedAt, "d MMM yy", { locale: th })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.method === "direct" ? "default" : "secondary"}
                      >
                        {item.method === "direct" ? "ดึงตรง" : "AI"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center py-8">
              ยังไม่มีข้อมูล
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
