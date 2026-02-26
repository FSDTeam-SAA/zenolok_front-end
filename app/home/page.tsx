"use client";

import * as React from "react";
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarClock, MapPin, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { BrickIcon } from "@/components/shared/brick-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionLoading } from "@/components/shared/section-loading";
import { Badge } from "@/components/ui/badge";
import { brickApi, eventApi, type EventData } from "@/lib/api";
import { defaultBricks } from "@/lib/presets";
import { queryKeys } from "@/lib/query-keys";
import { readPreferences } from "@/lib/settings";

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  location: string;
  brickName?: string;
  icon?: string;
};

type WeekSegment = {
  id: string;
  eventId: string;
  title: string;
  color: string;
  startCol: number;
  endCol: number;
  lane: number;
  isStart: boolean;
  isEnd: boolean;
};

const weekStartsOnMap: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const exhibitionColor = "#E9DB95";

function splitIntoWeeks(days: Date[]) {
  const weeks: Date[][] = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return weeks;
}

function intersectsWeek(event: CalendarEvent, weekStart: Date, weekEnd: Date) {
  return event.start <= weekEnd && event.end >= weekStart;
}

function clampDate(date: Date, min: Date, max: Date) {
  if (date < min) {
    return min;
  }
  if (date > max) {
    return max;
  }
  return date;
}

function buildWeekSegments(week: Date[], events: CalendarEvent[]): { segments: WeekSegment[]; laneCount: number } {
  const weekStart = startOfDay(week[0]);
  const weekEnd = startOfDay(week[6]);

  const relevant = events
    .filter((event) => intersectsWeek(event, weekStart, weekEnd))
    .sort((a, b) => a.start.getTime() - b.start.getTime() || a.end.getTime() - b.end.getTime());

  const laneEnds: Date[] = [];
  const segments: WeekSegment[] = [];

  for (const event of relevant) {
    const segmentStart = clampDate(event.start, weekStart, weekEnd);
    const segmentEnd = clampDate(event.end, weekStart, weekEnd);

    let lane = 0;
    while (laneEnds[lane] && laneEnds[lane] >= segmentStart) {
      lane += 1;
    }
    laneEnds[lane] = segmentEnd;

    const startCol = differenceInCalendarDays(segmentStart, weekStart) + 1;
    const endCol = differenceInCalendarDays(segmentEnd, weekStart) + 1;

    segments.push({
      id: `${event.id}-${format(segmentStart, "yyyy-MM-dd")}-${format(segmentEnd, "yyyy-MM-dd")}`,
      eventId: event.id,
      title: event.title,
      color: event.color,
      startCol,
      endCol,
      lane,
      isStart: isSameDay(segmentStart, event.start),
      isEnd: isSameDay(segmentEnd, event.end),
    });
  }

  return { segments, laneCount: laneEnds.length };
}

export default function HomePage() {
  const [selectedBrick, setSelectedBrick] = React.useState("all");
  const [selectedDate, setSelectedDate] = React.useState(startOfDay(new Date()));
  const [monthCursor] = React.useState(startOfMonth(new Date()));

  const preferences = React.useMemo(() => readPreferences(), []);
  const weekStartsOn = weekStartsOnMap[preferences.weekStartDay] ?? 1;

  const bricksQuery = useQuery({
    queryKey: queryKeys.bricks,
    queryFn: brickApi.getAll,
  });

  const eventsQuery = useQuery({
    queryKey: queryKeys.events({ filter: "all" }),
    queryFn: () => eventApi.getAll({ filter: "all" }),
  });

  const bricks = React.useMemo(() => {
    if (bricksQuery.data?.length) {
      return bricksQuery.data;
    }

    return defaultBricks.map((brick, index) => ({
      ...brick,
      _id: `default-${index}`,
      participants: [],
      createdBy: "",
    }));
  }, [bricksQuery.data]);

  const normalizedEvents = React.useMemo<CalendarEvent[]>(() => {
    return (eventsQuery.data || []).map((event: EventData) => {
      const start = startOfDay(new Date(event.startTime));
      const rawEnd = startOfDay(new Date(event.endTime));
      const end = rawEnd < start ? start : rawEnd;

      const titleLower = event.title.toLowerCase();
      const color = titleLower.includes("exhibition week")
        ? exhibitionColor
        : event.brick?.color || "#84C6EC";

      return {
        id: event._id,
        title: event.title,
        start,
        end,
        color,
        location: event.location || "No location",
        brickName: event.brick?.name,
        icon: event.brick?.icon,
      };
    });
  }, [eventsQuery.data]);

  const filteredEvents = React.useMemo(() => {
    if (selectedBrick === "all") {
      return normalizedEvents;
    }

    const selected = bricks.find((brick) => brick._id === selectedBrick);
    if (!selected) {
      return normalizedEvents;
    }

    return normalizedEvents.filter(
      (event) =>
        event.brickName?.toLowerCase() === selected.name.toLowerCase()
    );
  }, [selectedBrick, normalizedEvents, bricks]);

  const monthStart = startOfMonth(monthCursor);
  const monthEnd = endOfMonth(monthCursor);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks = splitIntoWeeks(days);

  const weekdayLabels = React.useMemo(
    () => Array.from({ length: 7 }, (_, index) => format(addDays(startOfWeek(new Date(), { weekStartsOn }), index), "EEE")),
    [weekStartsOn]
  );

  const selectedDateEvents = React.useMemo(
    () => filteredEvents.filter((event) => event.start <= selectedDate && event.end >= selectedDate),
    [filteredEvents, selectedDate]
  );

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setSelectedBrick("all")}>
          <Badge variant={selectedBrick === "all" ? "neutral" : "neutral"} className="rounded-full px-4 py-2">
            <CalendarClock className="size-4" />
            All
          </Badge>
        </button>
        {bricks.map((brick) => {
          const active = selectedBrick === brick._id;
          return (
            <button key={brick._id} type="button" onClick={() => setSelectedBrick(brick._id)}>
              <Badge
                variant={active ? "blue" : "neutral"}
                className="rounded-full px-4 py-2"
                style={
                  active
                    ? { backgroundColor: brick.color, color: "white" }
                    : { color: brick.color, borderColor: brick.color, backgroundColor: "white" }
                }
              >
                <BrickIcon name={brick.icon} className="size-4" />
                {brick.name}
              </Badge>
            </button>
          );
        })}
      </section>

      <section className="rounded-[30px] border border-[#DFE4ED] bg-[#F4F6FA] p-3 sm:p-4">
        {eventsQuery.isLoading ? (
          <SectionLoading rows={8} />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[272px_minmax(0,1fr)]">
            <aside className="rounded-[24px] border border-[#D8DEEA] bg-[#ECEFF4] p-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-poppins text-[20px] leading-[120%] font-medium text-[#2C323E]">Scheduled</h2>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg border border-dashed border-[#BFC7D7] text-[#8A94A7]"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              {selectedDateEvents.length ? (
                <div className="space-y-2">
                  {selectedDateEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="rounded-xl border border-[#D3DAE8] bg-white px-2 py-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-1.5 rounded-full" style={{ backgroundColor: event.color }} />
                        <p className="font-poppins truncate text-[20px] leading-[120%] font-medium text-[#2E3542]">{event.title}</p>
                      </div>
                      <p className="font-poppins mt-1 flex items-center gap-1 text-[14px] leading-[120%] text-[#7A8396]">
                        <MapPin className="size-3.5" />
                        {event.location}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No events" description="No events on selected day." />
              )}
            </aside>

            <div className="overflow-x-auto">
              <div className="min-w-[840px]">
                <div className="mb-2 grid grid-cols-7">
                  {weekdayLabels.map((label) => (
                    <div key={label} className="px-2 py-1 text-center">
                      <p
                        className={`font-poppins text-[16px] leading-[120%] font-medium ${
                          label.startsWith("Sun") ? "text-[#FF3B30]" : "text-[#3A4150]"
                        }`}
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-0 rounded-[18px] border border-[#D7DCE6] bg-white">
                  {weeks.map((week, weekIndex) => {
                    const weekInfo = buildWeekSegments(week, filteredEvents);
                    const visibleSegments = weekInfo.segments.filter((segment) => segment.lane < 3);

                    return (
                      <div
                        key={`${format(week[0], "yyyy-MM-dd")}-${weekIndex}`}
                        className="relative grid grid-cols-7 border-b border-[#DDE2EC] last:border-b-0"
                      >
                        {week.map((day) => {
                          const selected = isSameDay(day, selectedDate);
                          return (
                            <button
                              key={format(day, "yyyy-MM-dd")}
                              type="button"
                              onClick={() => setSelectedDate(day)}
                              className="h-[136px] border-r border-[#DDE2EC] px-2 py-2 text-left last:border-r-0"
                            >
                              <span
                                className={`font-poppins inline-flex min-w-[32px] items-center justify-center rounded-xl px-2 text-[20px] leading-[120%] font-medium ${
                                  selected
                                    ? "bg-[#ECEDEF] text-[#2E333E]"
                                    : isSameMonth(day, monthCursor)
                                      ? "text-[#2F3542]"
                                      : "text-[#A4ABBB]"
                                }`}
                              >
                                {format(day, "d")}
                              </span>
                            </button>
                          );
                        })}

                        <div className="pointer-events-none absolute inset-x-0 top-9 px-[1px]">
                          <div className="grid grid-cols-7 auto-rows-[16px]">
                            {visibleSegments.map((segment) => (
                              <div
                                key={segment.id}
                                style={{
                                  gridColumn: `${segment.startCol} / ${segment.endCol + 1}`,
                                  gridRow: segment.lane + 1,
                                  backgroundColor: segment.color,
                                }}
                                className={`mx-[1px] mt-[1px] h-[12px] overflow-hidden text-[10px] leading-[120%] text-[#202631] ${
                                  segment.isStart ? "rounded-l-sm pl-1" : ""
                                } ${segment.isEnd ? "rounded-r-sm" : ""}`}
                              >
                                {segment.isStart ? segment.title : ""}
                              </div>
                            ))}
                          </div>
                        </div>

                        {weekInfo.laneCount > 3 ? (
                          <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-[#EDEFF4] px-1.5 py-0.5 text-[10px] text-[#6C7486]">
                            +{weekInfo.laneCount - 3}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
