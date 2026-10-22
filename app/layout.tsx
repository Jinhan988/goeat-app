import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "GoEat AI — What's for dinner this week?",
  description: "Pick dishes you love. Get a 7-day meal plan and grocery list with an estimated budget. Free, no sign-up. For the US and Canada.",
  openGraph: {
    title: "GoEat AI — What's for dinner this week?",
    description: "Pick dishes you love. Get a 7-day meal plan and grocery list with an estimated budget. Free, no sign-up.",
    url: "https://app.goeatai.com",
    siteName: "GoEat AI",
    type: "website",
  },
};

const GA_ID = "G-D82DXCRQ07";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Nunito+Sans:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Google Analytics 4 */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>

        {children}
        <Analytics />
      </body>
    </html>
  );
}
