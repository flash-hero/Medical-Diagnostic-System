import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedCare AI — Your Complete Health Platform",
  description:
    "Find doctors, predict diseases from symptoms, and detect cancer with deep learning. All in one platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-clinical-dark text-[#2a1010] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
