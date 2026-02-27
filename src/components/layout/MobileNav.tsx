"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  History,
  BarChart3,
  Award,
  Users,
  FileText,
  Heart,
  School,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type UserRole = "student" | "teacher" | "parent";

interface MobileNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MOBILE_NAV: Record<UserRole, MobileNavItem[]> = {
  student: [
    { href: "/student", label: "홈", icon: LayoutDashboard },
    { href: "/student/daily", label: "학습", icon: BookOpen },
    { href: "/student/stats", label: "통계", icon: BarChart3 },
    { href: "/student/history", label: "기록", icon: History },
    { href: "/student/rewards", label: "뱃지", icon: Award },
  ],
  teacher: [
    { href: "/teacher", label: "홈", icon: LayoutDashboard },
    { href: "/teacher/classes", label: "학급", icon: School },
    { href: "/teacher/students", label: "학생", icon: Users },
    { href: "/teacher/assignments", label: "과제", icon: ClipboardList },
    { href: "/teacher/reports", label: "리포트", icon: FileText },
  ],
  parent: [
    { href: "/parent", label: "홈", icon: LayoutDashboard },
    { href: "/parent/children", label: "자녀", icon: Heart },
    { href: "/parent/reports", label: "리포트", icon: FileText },
  ],
};

interface MobileNavProps {
  role: UserRole;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const items = MOBILE_NAV[role];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname === item.href + "/" ||
            (item.href !== "/student" &&
              item.href !== "/teacher" &&
              item.href !== "/parent" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 h-1 w-6 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
