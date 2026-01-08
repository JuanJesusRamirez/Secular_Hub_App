import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DemoController } from "@/components/demo/demo-controller";
import { DemoScript } from "@/components/demo/demo-script";
import { SidebarProvider } from "@/lib/hooks/use-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Secular Forum Hub",
  description: "Financial intelligence application for FLAR investment team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TooltipProvider>
          <SidebarProvider>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6 md:p-8">
                  {children}
                </main>
              </div>
            </div>
            <DemoController />
            <DemoScript />
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
