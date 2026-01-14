import type { Metadata } from "next";
import "./globals.css";
import CommandPaletteWrapper from "@/components/CommandPaletteWrapper";
import KeyboardShortcutsProvider from "@/components/KeyboardShortcutsProvider";

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
      <body>
        <KeyboardShortcutsProvider>
          {children}
          <CommandPaletteWrapper />
        </KeyboardShortcutsProvider>
      </body>
    </html>
  );
}
