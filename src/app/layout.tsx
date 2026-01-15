import "./globals.css";

export const metadata = {
  title: "TodoLikeNotion",
  description: "Notion 스타일 할일 관리 & 데이터베이스 앱",
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
