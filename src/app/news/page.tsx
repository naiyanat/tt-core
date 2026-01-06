import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import prisma from "@/lib/db";
import { format } from "date-fns";
import { th } from "date-fns/locale";

async function getNews() {
  try {
    return await prisma.news.findMany({
      orderBy: { publishedAt: "desc" },
      include: {
        extractedNumbers: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const news = await getNews();

  const royalNews = news.filter((n) => n.category === "royal");
  const accidentNews = news.filter((n) => n.category === "accident");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ข่าว</h1>
        <p className="text-gray-600 mt-2">รวบรวมข่าวพระราชวงศ์และอุบัติเหตุใหญ่</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ข่าวทั้งหมด</CardDescription>
            <CardTitle className="text-2xl">{news.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardDescription>ข่าวพระราชวงศ์</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{royalNews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardDescription>ข่าวอุบัติเหตุ</CardDescription>
            <CardTitle className="text-2xl text-red-600">{accidentNews.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* News List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการข่าวทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {news.length > 0 ? (
            <div className="space-y-4">
              {news.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={item.category === "royal" ? "default" : "destructive"}
                        >
                          {item.category === "royal" ? "พระราชวงศ์" : "อุบัติเหตุ"}
                        </Badge>
                        <Badge variant="outline">{item.source}</Badge>
                      </div>
                      <h3 className="font-medium text-gray-900 text-lg">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mt-1 line-clamp-2">
                        {item.content.substring(0, 200)}...
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {format(item.publishedAt, "d MMMM yyyy", { locale: th })}
                      </p>
                    </div>
                    {item.extractedNumbers.length > 0 && (
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        <span className="text-xs text-gray-500 mb-1">เลขที่พบ</span>
                        {item.extractedNumbers.slice(0, 4).map((num) => (
                          <Badge
                            key={num.id}
                            variant="outline"
                            className="text-xl font-bold"
                          >
                            {num.number}
                          </Badge>
                        ))}
                        {item.extractedNumbers.length > 4 && (
                          <Badge variant="secondary">
                            +{item.extractedNumbers.length - 4}
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
        </CardContent>
      </Card>
    </div>
  );
}
