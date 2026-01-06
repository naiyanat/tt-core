import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import prisma from "@/lib/db";
import { format } from "date-fns";
import { th } from "date-fns/locale";

// Revalidate every 60 seconds to get fresh news data
export const revalidate = 60;

// Category configuration
const CATEGORY_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  royal: {
    label: "พระราชวงศ์",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  accident: {
    label: "อุบัติเหตุ",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  religion: {
    label: "ศาสนา",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  politics: {
    label: "การเมือง",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  lucky_number: {
    label: "เลขเด็ด",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
};

function getCategoryBadge(category: string) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.accident;

  const badgeClass = {
    royal: "bg-blue-600",
    accident: "bg-red-600",
    religion: "bg-orange-600",
    politics: "bg-purple-600",
    lucky_number: "bg-green-600",
  }[category] || "bg-gray-600";

  return (
    <Badge className={badgeClass}>
      {config.label}
    </Badge>
  );
}

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

  const categoryCounts = {
    royal: news.filter((n) => n.category === "royal").length,
    accident: news.filter((n) => n.category === "accident").length,
    religion: news.filter((n) => n.category === "religion").length,
    politics: news.filter((n) => n.category === "politics").length,
    lucky_number: news.filter((n) => n.category === "lucky_number").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ข่าว</h1>
        <p className="text-gray-600 mt-2">รวบรวมข่าวสำคัญจากหลากหลายแหล่ง</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ข่าวทั้งหมด</CardDescription>
            <CardTitle className="text-2xl">{news.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={`${CATEGORY_CONFIG.royal.borderColor} ${CATEGORY_CONFIG.royal.bgColor}`}>
          <CardHeader className="pb-2">
            <CardDescription>พระราชวงศ์</CardDescription>
            <CardTitle className={`text-2xl ${CATEGORY_CONFIG.royal.color}`}>
              {categoryCounts.royal}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className={`${CATEGORY_CONFIG.accident.borderColor} ${CATEGORY_CONFIG.accident.bgColor}`}>
          <CardHeader className="pb-2">
            <CardDescription>อุบัติเหตุ</CardDescription>
            <CardTitle className={`text-2xl ${CATEGORY_CONFIG.accident.color}`}>
              {categoryCounts.accident}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className={`${CATEGORY_CONFIG.religion.borderColor} ${CATEGORY_CONFIG.religion.bgColor}`}>
          <CardHeader className="pb-2">
            <CardDescription>ศาสนา</CardDescription>
            <CardTitle className={`text-2xl ${CATEGORY_CONFIG.religion.color}`}>
              {categoryCounts.religion}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className={`${CATEGORY_CONFIG.politics.borderColor} ${CATEGORY_CONFIG.politics.bgColor}`}>
          <CardHeader className="pb-2">
            <CardDescription>การเมือง</CardDescription>
            <CardTitle className={`text-2xl ${CATEGORY_CONFIG.politics.color}`}>
              {categoryCounts.politics}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className={`${CATEGORY_CONFIG.lucky_number.borderColor} ${CATEGORY_CONFIG.lucky_number.bgColor}`}>
          <CardHeader className="pb-2">
            <CardDescription>เลขเด็ด</CardDescription>
            <CardTitle className={`text-2xl ${CATEGORY_CONFIG.lucky_number.color}`}>
              {categoryCounts.lucky_number}
            </CardTitle>
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
                        {getCategoryBadge(item.category)}
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
