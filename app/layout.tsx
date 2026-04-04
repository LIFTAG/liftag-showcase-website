import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifTag — Scan. Track. Progress.",
  description: "QR codes on every machine. Instant workout tracking. Zero friction between you and your gains.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
