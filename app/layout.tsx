import type { Metadata } from "next";
import { Outfit, Space_Grotesk, Fira_Code } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import PageWrapper from "@/components/PageWrapper";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghostwriter | Exam Predictor",
  description: "AI-powered exam probability analysis",
  icons: {
    icon: "/ghostwriter-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${spaceGrotesk.variable} ${firaCode.variable} antialiased bg-[#020202] text-white selection:bg-violet-500/30 font-sans`}>
        <div className="flex h-screen overflow-hidden">
          {/* Dashboard Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto relative bg-[#020202]">
            <PageWrapper>
              {children}
            </PageWrapper>
          </main>
        </div>
      </body>
    </html>
  );
}