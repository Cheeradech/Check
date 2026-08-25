import type { Metadata } from "next";
import { Sarabun, Montserrat } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin", "thai"],
  variable: "--font-sarabun",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Shopping Checklist",
  description: "Shopping Checklist App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      className={`${sarabun.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col bg-[#F4F5FB]">{children}</body>
    </html>
  );
}
