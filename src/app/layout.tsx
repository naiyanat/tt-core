import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TT-Core | วิเคราะห์เลขเด่นจากข่าว",
  description: "ระบบวิเคราะห์ตัวเลขสำคัญจากข่าวไทย และเปรียบเทียบกับผลสลากกินแบ่ง",
};

const navItems = [
  { href: "/", label: "หน้าแรก" },
  { href: "/news", label: "ข่าว" },
  { href: "/numbers", label: "เลขเด่น" },
  { href: "/lottery", label: "ผลสลาก" },
  { href: "/stats", label: "สถิติ" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-blue-600">TT</span>
                  <span className="text-xl font-semibold text-gray-800">Core</span>
                </Link>
              </div>
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="sm:hidden flex items-center">
                <details className="relative">
                  <summary className="list-none cursor-pointer p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </summary>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-white border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 text-sm">
              TT-Core - ระบบวิเคราะห์เลขเด่นจากข่าวไทย
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
