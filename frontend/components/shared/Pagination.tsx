"use client";

import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
}: PaginationProps) {
  const ka = useLocale() === "ka";
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) params.delete("page");
    else params.set("page", page.toString());
    return `${pathname}${params.size ? `?${params}` : ""}`;
  };

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    const left = currentPage - 1;
    const right = currentPage + 1;

    if (left > 2) pages.push("...");

    for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <nav aria-label={ka ? "გვერდები" : "Pagination"} className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
      <Button
        variant="outline"
        size="icon"
        asChild={hasPreviousPage}
        disabled={!hasPreviousPage}
        className="h-10 w-10"
        aria-label={ka ? "წინა გვერდი" : "Previous page"}
      >
        {hasPreviousPage ? <Link href={pageHref(currentPage - 1)} rel="prev"><ChevronLeft className="h-4 w-4" /></Link> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 sm:px-3 py-2 text-gray-500 select-none"
            >
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              asChild
              aria-label={`${ka ? "გვერდი" : "Page"} ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              className={`h-10 w-10 ${
                page === currentPage
                  ? "bg-teal-500 hover:bg-teal-900"
                  : "hover:bg-gray-100"
              }`}
            >
              <Link href={pageHref(page)}>{page}</Link>
            </Button>
          ),
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        asChild={hasNextPage}
        disabled={!hasNextPage}
        className="h-10 w-10"
        aria-label={ka ? "შემდეგი გვერდი" : "Next page"}
      >
        {hasNextPage ? <Link href={pageHref(currentPage + 1)} rel="next"><ChevronRight className="h-4 w-4" /></Link> : <ChevronRight className="h-4 w-4" />}
      </Button>
    </nav>
  );
}
