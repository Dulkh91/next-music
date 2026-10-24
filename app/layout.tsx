import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "តន្ត្រីអនឡាញ",
    template: "%s | តន្ត្រីអនឡាញ",
  },
  description: "ស្តាប់ និងស្វែងរកបទចម្រៀងខ្មែរតាមអ៊ីនធឺណិត។",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <meta name="google-adsense-account" content="ca-pub-5085498185887835"></meta>
      <body className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 ">
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5085498185887835"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
          <Navbar/>
          {/* Body Display */}
          <div className="flex justify-center items-center font-sans">
              {children}
          </div>
      </body>
    </html>
  );
}
