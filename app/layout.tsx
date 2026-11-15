import type { Metadata } from "next";
import "@/css/globals.css";

export const metadata: Metadata = {
  title: "Lumen Studio — Modern Web Agency",
  description: "Independent web design and development studio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f4ee] text-[#1c1917] antialiased">
        {children}
      </body>
    </html>
  );
}

