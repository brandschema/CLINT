import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLINT | Monzo writing assistant",
  description: "Paste a draft. Get a rewrite in Monzo's voice, with a note on what changed.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
