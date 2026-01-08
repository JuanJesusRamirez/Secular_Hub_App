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
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Executive", href: "/overview", icon: Briefcase },
  { name: "Snapshot", href: "/snapshot", icon: PieChart },
  { name: "Word Cloud", href: "/wordcloud", icon: Cloud },
  { name: "Word Rain", href: "/wordrain", icon: CloudRain },
  { name: "Delta", href: "/delta", icon: TrendingUp },
  { name: "Historical", href: "/historical", icon: History },
  { name: "Narrative", href: "/narrative", icon: Sparkles },
  { name: "Explorer", href: "/explorer", icon: Compass },
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
          <div className="h-8 w-8 rounded bg-accent flex-shrink-0" />
          <span className={cn(
            "transition-all duration-300 whitespace-nowrap",
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            SF Hub
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

      {/* Settings */}
      <div className="border-t border-primary-foreground/10 p-2">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-center px-2 text-primary-foreground/60 hover:text-white hover:bg-primary/50"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Settings
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-primary-foreground/60 hover:text-white hover:bg-primary/50"
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Button>
        )}
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
