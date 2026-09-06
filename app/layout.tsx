import type { Metadata } from "next";
import "./globals.css";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "AmeriSave | Home Financing",
  description: "A modern home financing experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <div className="min-h-screen">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}
