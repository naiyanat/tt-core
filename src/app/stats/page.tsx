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

interface LotteryPeriodAnalysis {
  lottery: {
    id: string;
    drawDate: Date;
    lastThree: string;
    firstPrize: string;
  };
  newsCount: number;
  topNumbers: {
    number: string;
    count: number;
    isMatch: boolean;
  }[];
  hasMatch: boolean;
}

async function getAnalysisByLotteryPeriod(): Promise<LotteryPeriodAnalysis[]> {
  try {
    // Get all lottery results ordered by date (most recent first)
    const lotteryResults = await prisma.lotteryResult.findMany({
      orderBy: { drawDate: "desc" },
      take: 24, // Last 24 draws (about 1 year)
    });

    const analyses: LotteryPeriodAnalysis[] = [];

    for (const lottery of lotteryResults) {
      // Calculate the 15-day period before this draw
      const periodEnd = lottery.drawDate;
      const periodStart = subDays(periodEnd, 15);

      // Find news published in this period
      const newsInPeriod = await prisma.news.findMany({
        where: {
          publishedAt: {
            gte: periodStart,
            lt: periodEnd,
          },
        },
        include: {
          extractedNumbers: true,
        },
      });

      // Count number frequency
      const numberCounts: Record<string, number> = {};
      for (const news of newsInPeriod) {
        for (const extracted of news.extractedNumbers) {
          numberCounts[extracted.number] = (numberCounts[extracted.number] || 0) + 1;
        }
      }

      // Sort by frequency and get top 10
      const topNumbers = Object.entries(numberCounts)
        .map(([number, count]) => ({
          number,
          count,
          isMatch: number === lottery.lastThree,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const hasMatch = topNumbers.some((n) => n.isMatch);

      analyses.push({
        lottery,
        newsCount: newsInPeriod.length,
        topNumbers,
        hasMatch,
      });
    }

    return analyses;
  } catch {
    return [];
  }
}

async function getOverallStats() {
  try {
    const analyses = await getAnalysisByLotteryPeriod();
    const totalPeriods = analyses.length;
    const periodsWithMatch = analyses.filter((a) => a.hasMatch).length;
    const matchRate = totalPeriods > 0 ? ((periodsWithMatch / totalPeriods) * 100).toFixed(1) : "0";

    return {
      totalPeriods,
      periodsWithMatch,
      matchRate,
    };
  } catch {
    return {
      totalPeriods: 0,
      periodsWithMatch: 0,
      matchRate: "0",
    };
  }
}

export default async function StatsPage() {
  const [analyses, overallStats] = await Promise.all([
    getAnalysisByLotteryPeriod(),
    getOverallStats(),
  ]);

  // Get current period (upcoming draw)
  const now = new Date();
  const upcomingAnalysis = analyses.length > 0 ? analyses[0] : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">สถิติเลขเด่น</h1>
        <p className="text-gray-600 mt-2">
          วิเคราะห์เลขเด่นจากข่าว 15 วันก่อนออกผลสลากแต่ละงวด
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>งวดที่วิเคราะห์</CardDescription>
            <CardTitle className="text-2xl">{overallStats.totalPeriods}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>งวดที่เลขเด่นตรง</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {overallStats.periodsWithMatch}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>อัตราความแม่นยำ</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {overallStats.matchRate}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>วิธีการวิเคราะห์</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                1
              </div>
              <h3 className="font-semibold mb-2">เก็บข่าว</h3>
              <p className="text-sm text-gray-600">
                รวบรวมข่าวพระราชวงศ์ และอุบัติเหตุใหญ่
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                2
              </div>
              <h3 className="font-semibold mb-2">ดึงตัวเลข</h3>
              <p className="text-sm text-gray-600">
                วิเคราะห์ตัวเลข 3 หลักจากข่าว
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold mb-2">จัดอันดับ</h3>
              <p className="text-sm text-gray-600">
                นับความถี่ 15 วันก่อนออกผล
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                4
              </div>
              <h3 className="font-semibold mb-2">เปรียบเทียบ</h3>
              <p className="text-sm text-gray-600">
                ตรวจสอบกับผลสลากจริง
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis by Lottery Period */}
      <Card>
        <CardHeader>
          <CardTitle>เลขเด่นแยกตามงวดสลาก</CardTitle>
          <CardDescription>
            Top 10 เลขที่ปรากฏบ่อยในข่าว 15 วันก่อนออกผลแต่ละงวด
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyses.length > 0 ? (
            <div className="space-y-6">
              {analyses.map((analysis) => (
                <div
                  key={analysis.lottery.id}
                  className={`p-4 rounded-lg border ${
                    analysis.hasMatch
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        งวด {format(analysis.lottery.drawDate, "d MMMM yyyy", { locale: th })}
                      </h3>
                      <p className="text-sm text-gray-500">
                        วิเคราะห์จากข่าว {analysis.newsCount} ข่าว
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">ผลออก</p>
                        <Badge
                          variant="outline"
                          className="text-2xl font-bold px-3 py-1"
                        >
                          {analysis.lottery.lastThree}
                        </Badge>
                      </div>
                      {analysis.hasMatch && (
                        <Badge className="bg-green-600">ตรง!</Badge>
                      )}
                    </div>
                  </div>

                  {analysis.topNumbers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.topNumbers.map((num, index) => (
                        <div
                          key={num.number}
                          className={`px-3 py-2 rounded-lg border text-center min-w-[70px] ${
                            num.isMatch
                              ? "bg-green-600 text-white border-green-600"
                              : index < 3
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white"
                          }`}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {num.isMatch ? "✓" : `#${index + 1}`}
                          </div>
                          <div
                            className={`text-xl font-bold ${
                              num.isMatch
                                ? "text-white"
                                : index < 3
                                ? "text-blue-600"
                                : "text-gray-700"
                            }`}
                          >
                            {num.number}
                          </div>
                          <div
                            className={`text-xs ${
                              num.isMatch ? "text-green-100" : "text-gray-500"
                            }`}
                          >
                            {num.count} ครั้ง
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      ไม่มีข่าวในช่วงนี้
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">ยังไม่มีข้อมูลสำหรับวิเคราะห์</p>
              <p className="text-sm text-gray-400 mt-2">
                รอระบบรวบรวมข่าวและวิเคราะห์ตัวเลข
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
