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
import { format } from "date-fns";
import { th } from "date-fns/locale";

async function getMatches() {
  try {
    return await prisma.numberMatch.findMany({
      include: {
        extracted: {
          include: {
            news: {
              select: {
                id: true,
                title: true,
                publishedAt: true,
              },
            },
          },
        },
        lottery: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [totalExtracted, totalLottery, totalMatches, exactMatches] =
      await Promise.all([
        prisma.extractedNumber.count(),
        prisma.lotteryResult.count(),
        prisma.numberMatch.count(),
        prisma.numberMatch.count({
          where: { matchType: "exact" },
        }),
      ]);
    return { totalExtracted, totalLottery, totalMatches, exactMatches };
  } catch {
    return {
      totalExtracted: 0,
      totalLottery: 0,
      totalMatches: 0,
      exactMatches: 0,
    };
  }
}

async function findPotentialMatches() {
  try {
    // หาเลขที่วิเคราะห์ได้ที่ตรงกับผลสลาก
    const extractedNumbers = await prisma.extractedNumber.findMany({
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

    const lotteryResults = await prisma.lotteryResult.findMany();

    const matches: {
      extracted: (typeof extractedNumbers)[0];
      lottery: (typeof lotteryResults)[0];
      matchType: "exact" | "partial";
    }[] = [];

    for (const extracted of extractedNumbers) {
      for (const lottery of lotteryResults) {
        // ตรวจสอบว่าข่าวมาก่อนวันออกสลากหรือไม่
        if (extracted.news.publishedAt <= lottery.drawDate) {
          if (extracted.number === lottery.lastThree) {
            matches.push({
              extracted,
              lottery,
              matchType: "exact",
            });
          }
        }
      }
    }

    return matches.slice(0, 20);
  } catch {
    return [];
  }
}

export default async function StatsPage() {
  const [matches, stats, potentialMatches] = await Promise.all([
    getMatches(),
    getStats(),
    findPotentialMatches(),
  ]);

  const accuracy =
    stats.totalExtracted > 0
      ? ((stats.exactMatches / stats.totalExtracted) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">สถิติ</h1>
        <p className="text-gray-600 mt-2">
          เปรียบเทียบตัวเลขที่วิเคราะห์ได้กับผลสลากจริง
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>เลขที่วิเคราะห์ได้</CardDescription>
            <CardTitle className="text-2xl">{stats.totalExtracted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>งวดสลากทั้งหมด</CardDescription>
            <CardTitle className="text-2xl">{stats.totalLottery}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>ตรงกับผลจริง</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {potentialMatches.filter((m) => m.matchType === "exact").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>อัตราความแม่นยำ</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{accuracy}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Potential Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            เลขที่ตรงกับผลสลาก
            <Badge variant="secondary">
              {potentialMatches.filter((m) => m.matchType === "exact").length}{" "}
              รายการ
            </Badge>
          </CardTitle>
          <CardDescription>
            ตัวเลขที่วิเคราะห์ได้จากข่าวก่อนวันออกสลาก และตรงกับผลจริง
          </CardDescription>
        </CardHeader>
        <CardContent>
          {potentialMatches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">เลข</TableHead>
                  <TableHead>ข่าว</TableHead>
                  <TableHead className="w-36">วันที่ข่าว</TableHead>
                  <TableHead className="w-36">งวดสลาก</TableHead>
                  <TableHead className="w-24">ผลสลาก</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {potentialMatches
                  .filter((m) => m.matchType === "exact")
                  .map((match, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge className="text-xl font-bold bg-green-600">
                          {match.extracted.number}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/news/${match.extracted.news.id}`}
                          className="text-blue-600 hover:underline line-clamp-1"
                        >
                          {match.extracted.news.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(
                          match.extracted.news.publishedAt,
                          "d MMM yyyy",
                          { locale: th }
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(match.lottery.drawDate, "d MMM yyyy", {
                          locale: th,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-lg">
                          {match.lottery.lastThree}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">ยังไม่พบเลขที่ตรงกับผลสลาก</p>
              <p className="text-sm text-gray-400 mt-2">
                ระบบจะเปรียบเทียบเลขจากข่าวที่มาก่อนวันออกสลากเท่านั้น
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>วิธีการวิเคราะห์</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h3 className="font-semibold mb-2">รวบรวมข่าว</h3>
              <p className="text-sm text-gray-600">
                ดึงข่าวพระราชวงศ์และอุบัติเหตุใหญ่จากแหล่งข่าวไทย
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h3 className="font-semibold mb-2">วิเคราะห์ตัวเลข</h3>
              <p className="text-sm text-gray-600">
                ใช้ Regex ดึงตัวเลขตรงๆ และ AI วิเคราะห์ความหมายเชิงลึก
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h3 className="font-semibold mb-2">เปรียบเทียบ</h3>
              <p className="text-sm text-gray-600">
                ตรวจสอบตัวเลขกับผลสลากกินแบ่งย้อนหลัง 5 ปี
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
