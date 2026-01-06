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

async function getNumberStats() {
  try {
    const numbers = await prisma.extractedNumber.groupBy({
      by: ["number"],
      _count: { number: true },
      orderBy: { _count: { number: "desc" } },
    });
    return numbers;
  } catch {
    return [];
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
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function NumbersPage() {
  const [numberStats, recentNumbers] = await Promise.all([
    getNumberStats(),
    getRecentNumbers(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">เลขเด่น</h1>
        <p className="text-gray-600 mt-2">
          รวบรวมตัวเลขที่วิเคราะห์ได้จากข่าว
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Numbers */}
        <Card>
          <CardHeader>
            <CardTitle>เลขที่ปรากฏบ่อยที่สุด</CardTitle>
            <CardDescription>
              จัดอันดับตามความถี่ที่ปรากฏ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {numberStats.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {numberStats.slice(0, 15).map((item, index) => (
                  <div
                    key={item.number}
                    className={`p-4 rounded-lg border text-center ${
                      index < 3 ? "bg-blue-50 border-blue-200" : "bg-gray-50"
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      อันดับ {index + 1}
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        index < 3 ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {item.number}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {item._count.number} ครั้ง
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                ยังไม่มีข้อมูล
              </p>
            )}
          </CardContent>
        </Card>

        {/* Number Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>สถิติรวม</CardTitle>
            <CardDescription>ภาพรวมตัวเลขทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-3xl font-bold text-gray-700">
                    {numberStats.length}
                  </div>
                  <div className="text-sm text-gray-500">เลขที่ไม่ซ้ำกัน</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-3xl font-bold text-gray-700">
                    {numberStats.reduce((acc, curr) => acc + curr._count.number, 0)}
                  </div>
                  <div className="text-sm text-gray-500">จำนวนครั้งรวม</div>
                </div>
              </div>

              {numberStats.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-700 mb-3">
                    เลขที่ออกบ่อยสุด 5 อันดับ
                  </h4>
                  {numberStats.slice(0, 5).map((item, index) => (
                    <div
                      key={item.number}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
                          {index + 1}
                        </span>
                        <span className="text-xl font-bold">{item.number}</span>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: `${
                                (item._count.number /
                                  numberStats[0]._count.number) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {item._count.number} ครั้ง
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>เลขล่าสุดที่วิเคราะห์ได้</CardTitle>
          <CardDescription>
            ตัวเลขที่ดึงได้จากข่าวล่าสุด
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentNumbers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">เลข</TableHead>
                  <TableHead>ข่าว</TableHead>
                  <TableHead className="w-32">วิธีการ</TableHead>
                  <TableHead className="w-32">ความมั่นใจ</TableHead>
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
                    <TableCell>
                      <Badge
                        variant={item.method === "direct" ? "default" : "secondary"}
                      >
                        {item.method === "direct" ? "ดึงตรง" : "AI"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm">{item.confidence}%</span>
                      </div>
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
