"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Search,
  Settings,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppState } from "@/components/providers/app-state-provider";
import { BrickIcon } from "@/components/shared/brick-icon";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  {
    href: "/home",
    label: "Home",
    icon: CalendarDays,
    iconName: "home",
    activeColor: "blue" as const,
  },
  {
    href: "/events",
    label: "Events",
    icon: CalendarDays,
    iconName: "work",
    activeColor: "blue" as const,
  },
  {
    href: "/todos",
    label: "Todos",
    icon: ListTodo,
    iconName: "default",
    activeColor: "blue" as const,
  },
];

export function AppTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [viewMenuOpen, setViewMenuOpen] = React.useState(false);
  const [calendarView, setCalendarView] = React.useState<
    "day" | "week" | "month" | "year"
  >("month");
  const { monthCursor, goToToday, goToPreviousMonth, goToNextMonth } =
    useAppState();

  const viewOptions: Array<{
    value: "day" | "week" | "month" | "year";
    label: string;
    short: string;
  }> = [
    { value: "day", label: "Day", short: "D" },
    { value: "week", label: "Week", short: "W" },
    { value: "month", label: "Month", short: "M" },
    { value: "year", label: "Year", short: "Y" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E6EE] bg-[#F2F5FA]/90 backdrop-blur">
      <div className="mx-auto flex h-[76px] w-full max-w-[1180px] items-center gap-3 px-3 sm:px-5">
        <div className="flex items-center gap-3">
          <Link href="/home" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Zenolok Logo"
              width={500}
              height={500}
              className="w-[50px] h-[50px] object-contain"
              priority
            />
          </Link>
          <Button
            className="fs-pop-20-medium-center rounded-full border border-[#7A8F64] bg-[#A7C58D] px-7 text-[#2A2E36] hover:bg-[#97ba79]"
            onClick={() => {
              goToToday();
              router.push("/home");
            }}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Previous period"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Next period"
            onClick={goToNextMonth}
          >
            <ChevronRight className="size-5" />
          </Button>
          <div className="fs-pop-20-medium-center hidden md:block">
            {format(monthCursor, "MMMM yyyy")}
          </div>
        </div>

        <nav className="mx-auto hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "fs-pop-20-medium-center inline-flex items-center gap-2 rounded-full px-4 py-2 transition",
                  active
                    ? "bg-[#DDE9FF] text-[#2C5CA8]"
                    : "text-[#5E6577] hover:bg-[#E9EEF7]",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Popover open={viewMenuOpen} onOpenChange={setViewMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="hidden md:inline-flex"
                aria-label="Open calendar view filter"
              >
                <Badge
                  variant="neutral"
                  className="h-11 items-center gap-2 px-4"
                >
                  {viewOptions.find((option) => option.value === calendarView)
                    ?.label || "Month"}{" "}
                  <ChevronDown className="size-4" />
                </Badge>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[270px] rounded-2xl border border-[#D6DDE8] bg-[#ECEFF4] p-3"
            >
              <div className="space-y-1">
                {viewOptions.map((option) => {
                  const active = option.value === calendarView;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setCalendarView(option.value);
                        setViewMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition",
                        active
                          ? "bg-white text-[#2E333B]"
                          : "text-[#707780] hover:bg-white/70",
                      )}
                    >
                      <span className="fs-pop-20-medium-center">
                        {option.label}
                      </span>
                      <span className="fs-pop-20-medium-center">
                        {option.short}
                      </span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => router.push("/search")}
          >
            <Search className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hidden sm:inline-flex"
            onClick={() => router.push("/settings")}
            aria-label="Open settings"
          >
            <Settings className="size-5" />
          </Button>
          <button
            type="button"
            className="rounded-full border border-transparent transition hover:border-[#D5DAE5]"
            title="Sign out"
          >
            <Avatar className="size-12 border border-[#D0D5E0]">
              <AvatarImage
                src={session?.user?.avatar?.url}
                alt={session?.user?.name || session?.user?.email || "User"}
              />
              <AvatarFallback>
                {(session?.user?.name || session?.user?.username || "U").slice(
                  0,
                  1,
                )}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1180px] items-center gap-2 px-3 pb-3 md:hidden">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link key={item.href} href={item.href}>
              <Badge
                variant={active ? "blue" : "neutral"}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
              >
                <BrickIcon name={item.iconName} className="size-3.5" />
                {item.label}
              </Badge>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
