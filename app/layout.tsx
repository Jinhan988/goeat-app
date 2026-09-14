import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoEat AI — Smart meal plans. Smarter savings.",
  description: "Snap your fridge. Get a personalized 7-day meal plan with calories, shopping list, and estimated savings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Nunito+Sans:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
