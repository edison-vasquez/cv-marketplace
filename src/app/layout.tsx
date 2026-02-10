import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VisionHub | Computer Vision Marketplace",
  description: "The ultimate marketplace for computer vision models, powered by Roboflow & Pipeless.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>
          <Navbar />
          <main className="pt-20 min-h-screen bg-white">
            {children}
          </main>
          <footer className="border-t border-[#dadce0] py-8 px-6 bg-[#f8f9fa]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1a73e8] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <span className="font-semibold text-[#202124]">VisionHub</span>
              </div>
              <div className="flex gap-8 text-sm text-[#5f6368]">
                <a href="#" className="hover:text-[#1a73e8] transition-colors">Twitter</a>
                <a href="#" className="hover:text-[#1a73e8] transition-colors">GitHub</a>
                <a href="#" className="hover:text-[#1a73e8] transition-colors">Discord</a>
              </div>
              <p className="text-sm text-[#80868b]">© 2026 VisionHub. Built with Roboflow & Pipeless AI.</p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
