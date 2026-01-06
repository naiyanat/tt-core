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
import prisma from "@/lib/db";
import { format } from "date-fns";
import { th } from "date-fns/locale";

// Revalidate every 60 seconds
export const revalidate = 60;

async function getLotteryResults() {
  try {
    return await prisma.lotteryResult.findMany({
      orderBy: { drawDate: "desc" },
    });
  } catch {
    return [];
  }
}

async function getLastThreeStats() {
  try {
    const results = await prisma.lotteryResult.groupBy({
      by: ["lastThree"],
      _count: { lastThree: true },
      orderBy: { _count: { lastThree: "desc" } },
      take: 10,
    });
    return results;
  } catch {
    return [];
  }
}

export default async function LotteryPage() {
  const [results, stats] = await Promise.all([
    getLotteryResults(),
    getLastThreeStats(),
  ]);

  // Group by year
  const resultsByYear = results.reduce(
    (acc, result) => {
      const year = format(result.drawDate, "yyyy");
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(result);
      return acc;
    },
    {} as Record<string, typeof results>
  );

  const years = Object.keys(resultsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ผลสลากกินแบ่ง</h1>
        <p className="text-gray-600 mt-2">
          ข้อมูลผลสลากย้อนหลัง 5 ปี
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>จำนวนงวดทั้งหมด</CardDescription>
            <CardTitle className="text-2xl">{results.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>ผลล่าสุด</CardDescription>
            {results[0] ? (
              <>
                <CardTitle className="text-3xl text-blue-600">
                  {results[0].lastThree}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {format(results[0].drawDate, "d MMMM yyyy", { locale: th })}
                </p>
              </>
            ) : (
              <CardTitle className="text-xl text-gray-400">-</CardTitle>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ปีที่มีข้อมูล</CardDescription>
            <CardTitle className="text-2xl">{years.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular Last Three */}
        <Card>
          <CardHeader>
            <CardTitle>เลขท้าย 3 ตัวที่ออกบ่อย</CardTitle>
            <CardDescription>Top 10</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.length > 0 ? (
              <div className="space-y-2">
                {stats.map((item, index) => (
                  <div
                    key={item.lastThree}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 flex items-center justify-center text-sm font-medium rounded-full ${
                          index < 3
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-2xl font-bold">{item.lastThree}</span>
                    </div>
                    <Badge variant="outline">{item._count.lastThree} ครั้ง</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">ยังไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>

        {/* Results by Year */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ผลสลากรายปี</CardTitle>
            <CardDescription>เรียงตามปี พ.ศ.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {years.map((year) => (
                <div key={year}>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    ปี {parseInt(year) + 543}
                    <Badge variant="secondary">
                      {resultsByYear[year].length} งวด
                    </Badge>
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>วันที่</TableHead>
                          <TableHead>รางวัลที่ 1</TableHead>
                          <TableHead>เลขท้าย 3 ตัว</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultsByYear[year].map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              {format(result.drawDate, "d MMM", { locale: th })}
                            </TableCell>
                            <TableCell className="font-mono">
                              {result.firstPrize}
                            </TableCell>
                            <TableCell>
                              <Badge className="text-lg font-bold">
                                {result.lastThree}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
