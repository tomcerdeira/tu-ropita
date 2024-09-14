import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "'FindClo' Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header />
        <main className="container mx-auto mt-4 flex-grow px-4">
          {children}
        </main>
        
        {/* Spacer div to prevent content from being hidden under the mobile header */}
      <div className="h-12 md:hidden"></div>
        
        <Footer />
      </body>
    </html>
  );
}
