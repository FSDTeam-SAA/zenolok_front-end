"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SectionLoading } from "@/components/shared/section-loading";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { paginateArray, searchApi, type SearchResultItem } from "@/lib/api";

const SEARCH_PAGE_SIZE = 6;

function getResultId(result: SearchResultItem, index: number) {
  const itemId =
    typeof result.item._id === "string" ? result.item._id : `unknown-${index}`;
  return `${result.type}-${itemId}`;
}

function getResultTitle(result: SearchResultItem) {
  if (result.type === "event") {
    return (result.item.title as string) || "Untitled event";
  }
  if (result.type === "eventTodo" || result.type === "todoItem") {
    return (result.item.text as string) || "Untitled todo";
  }
  if (result.type === "brick" || result.type === "category") {
    return (result.item.name as string) || "Untitled";
  }

  return "Result";
}

function getResultSubtitle(result: SearchResultItem) {
  if (result.type === "event") {
    const location = (result.item.location as string) || "No location";
    return `Event • ${location}`;
  }
  if (result.type === "eventTodo") {
    return "Event todo";
  }
  if (result.type === "todoItem") {
    return "Todo item";
  }
  if (result.type === "brick") {
    return "Brick";
  }
  if (result.type === "category") {
    return "Todo category";
  }
  return "Result";
}

function getResultDateLabel(result: SearchResultItem) {
  const value =
    (result.item.startTime as string) ||
    (result.item.createdAt as string) ||
    "";
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
}

function handleResultClick(router: ReturnType<typeof useRouter>, result: SearchResultItem) {
  if (result.type === "event") {
    const eventId = result.item._id as string | undefined;
    if (eventId) {
      router.push(`/events/${eventId}`);
      return;
    }
  }

  if (result.type === "eventTodo") {
    const eventId = result.item.eventId as string | undefined;
    if (eventId) {
      router.push(`/events/${eventId}`);
      return;
    }
    router.push("/events");
    return;
  }

  if (result.type === "todoItem" || result.type === "category") {
    router.push("/todos");
    return;
  }

  if (result.type === "brick") {
    router.push("/settings?modal=bricks-manage");
    return;
  }

  router.push("/home");
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const normalizedQuery = query.trim();

  const searchQuery = useQuery({
    queryKey: ["global-search", normalizedQuery],
    queryFn: () => searchApi.search(normalizedQuery),
    enabled: normalizedQuery.length > 0,
  });

  const results = useMemo(
    () => searchQuery.data?.items ?? [],
    [searchQuery.data],
  );
  const totalPages = Math.max(1, Math.ceil(results.length / SEARCH_PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paged = useMemo(() => paginateArray(results, safePage, SEARCH_PAGE_SIZE), [results, safePage]);

  return (
    <div className="search-page space-y-4">
      <section className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xl font-medium text-[var(--text-default)]"
        >
          <ArrowLeft className="size-5" /> Search
        </button>
      </section>

      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              className="h-11 rounded-xl pl-9"
              placeholder="Search events, todos, bricks and categories"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {!normalizedQuery ? (
          <EmptyState title="Start searching" description="Type a keyword to search across events, todos, and bricks." />
        ) : searchQuery.isLoading ? (
          <SectionLoading rows={4} />
        ) : searchQuery.isError ? (
          <EmptyState title="Search failed" description="Please try again." />
        ) : results.length ? (
          <div className="space-y-3">
            {paged.items.map((result, index) => (
              <Card
                key={getResultId(result, index)}
                className="cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[var(--text-default)] shadow-none"
                onClick={() => handleResultClick(router, result)}
              >
                <p className="text-2xl font-semibold text-[var(--text-strong)]">{getResultTitle(result)}</p>
                <p className="text-xl text-[var(--text-default)]">{getResultSubtitle(result)}</p>
                {getResultDateLabel(result) ? (
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{getResultDateLabel(result)}</p>
                ) : null}
              </Card>
            ))}
            <PaginationControls page={paged.page} totalPages={paged.totalPages} onPageChange={setPage} />
          </div>
        ) : (
          <EmptyState title="No search results" description="Try another keyword." />
        )}
      </section>
    </div>
  );
}

