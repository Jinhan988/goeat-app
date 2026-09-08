import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoEat AI — Your fridge. Your meals. Your budget.",
  description: "Snap your fridge. Get a personalized 7-day meal plan with calories, shopping list, and estimated savings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
