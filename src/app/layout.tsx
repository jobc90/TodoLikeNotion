import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notion-like Todo",
  description: "Block-based todo management app like Notion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
