import type { Metadata } from "next";
import { pageTitle, siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: pageTitle(),
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
