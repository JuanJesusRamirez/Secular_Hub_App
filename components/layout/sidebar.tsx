"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/lib/hooks/use-sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  PieChart,
  TrendingUp,
  History,
  Compass,
  Settings,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Cloud,
  CloudRain,
  BookOpen,
  Calendar,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

const navigation: NavigationItem[] = [
  { name: "Methodology", href: "/", icon: LayoutDashboard },
  { name: "2025 Reality Check", href: "/2025", icon: History },

  //  { name: "Word Cloud", href: "/wordcloud", icon: Cloud },
  { name: "Word Analysis", href: "/wordcloud-new", icon: CloudRain },

  { name: "Historical Evolution", href: "/tesis", icon: History },
  { name: "2026 Outlook", href: "/overview", icon: Briefcase },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <div
      className={cn(
        "flex flex-col bg-primary text-primary-foreground transition-all duration-300 ease-in-out relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        <div className={cn(
          "flex items-center gap-2 font-bold text-xl overflow-hidden",
          collapsed && "justify-center"
        )}>
          <span className={cn(
            "transition-all duration-300 whitespace-nowrap",
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            Secular Forum Hub
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const button = (
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full",
                  collapsed ? "justify-center px-2" : "justify-start",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-primary-foreground/80 hover:bg-primary/50 hover:text-white"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", !collapsed && "mr-3")} />
                  <span className={cn(
                    "transition-all duration-300 whitespace-nowrap",
                    collapsed ? "opacity-0 w-0 hidden" : "opacity-100"
                  )}>
                    {item.name}
                  </span>
                  {item.badge && !collapsed && (
                    <span className="ml-auto bg-blue-500 text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </Button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>
                    {button}
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.name}>{button}</div>;
          })}
        </nav>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggle}
        className={cn(
          "absolute -right-3 top-20 z-50",
          "flex h-6 w-6 items-center justify-center",
          "rounded-full border bg-background shadow-md",
          "text-muted-foreground hover:text-foreground",
          "transition-colors duration-200"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
