import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "נוכחות צוות",
  description: "Team attendance dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">{children}</body>
    </html>
  );
}
