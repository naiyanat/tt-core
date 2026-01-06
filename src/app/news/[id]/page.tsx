import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { format } from "date-fns";
import { th } from "date-fns/locale";

async function getNews(id: string) {
  try {
    return await prisma.news.findUnique({
      where: { id },
      include: {
        extractedNumbers: true,
      },
    });
  } catch {
    return null;
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNews(id);

  if (!news) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href="/news"
        className="inline-flex items-center text-blue-600 hover:underline"
      >
        ← กลับไปหน้าข่าว
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={news.category === "royal" ? "default" : "destructive"}
              >
                {news.category === "royal" ? "พระราชวงศ์" : "อุบัติเหตุ"}
              </Badge>
              <Badge variant="outline">{news.source}</Badge>
            </div>
            <CardTitle className="text-2xl">{news.title}</CardTitle>
            <CardDescription>
              {format(news.publishedAt, "d MMMM yyyy", { locale: th })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {news.content}
              </p>
            </div>
            {news.url && (
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-4 text-blue-600 hover:underline"
              >
                ดูข่าวต้นฉบับ →
              </a>
            )}
          </CardContent>
        </Card>

        {/* Extracted Numbers */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                เลขที่วิเคราะห์ได้
                <Badge variant="secondary">{news.extractedNumbers.length}</Badge>
              </CardTitle>
              <CardDescription>
                ตัวเลขที่ดึงได้จากข่าวนี้
              </CardDescription>
            </CardHeader>
            <CardContent>
              {news.extractedNumbers.length > 0 ? (
                <div className="space-y-4">
                  {news.extractedNumbers.map((num) => (
                    <div
                      key={num.id}
                      className="p-4 rounded-lg border bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-blue-600">
                          {num.number}
                        </span>
                        <Badge
                          variant={num.method === "direct" ? "default" : "secondary"}
                        >
                          {num.method === "direct" ? "ดึงตรง" : "AI วิเคราะห์"}
                        </Badge>
                      </div>
                      {num.reasoning && (
                        <p className="text-sm text-gray-600">{num.reasoning}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">ความมั่นใจ:</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${num.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{num.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  ไม่พบตัวเลขในข่าวนี้
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
