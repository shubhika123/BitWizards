import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Myntra Bharat Layer - AI-Powered Regional Fashion & Trust Discovery",
  description: "Making Myntra culturally aware, context-personalized, and locally connected for Tier-2 and Tier-3 India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${assistant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#282c3f]">{children}</body>
    </html>
  );
}
