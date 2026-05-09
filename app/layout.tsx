import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KlippUp — Discover",
  description: "Discover content campaigns and earn rewards"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
