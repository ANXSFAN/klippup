"use client";
import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  SearchIcon,
  ChevronDownIcon,
  FilterIcon,
  CloseIcon,
  platformGlyph
} from "./Icons";
import LocaleSwitcher from "./LocaleSwitcher";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "./ui/dropdown-menu";
import type { DiscoverFacets, SearchFilters } from "@/lib/types";

const DEBOUNCE_MS = 200;

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return k >= 10 ? `${Math.round(k)}K` : `${k.toFixed(1).replace(/\.0$/, "")}K`;
}

export default function SearchBar({
  facets,
  filters,
  resultCount,
  accountSlot
}: {
  facets: DiscoverFacets;
  filters: SearchFilters;
  resultCount: number;
  accountSlot?: React.ReactNode;
}) {
  const t = useTranslations("search");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localQ, setLocalQ] = React.useState(filters.q ?? "");

  React.useEffect(() => {
    setLocalQ(filters.q ?? "");
  }, [filters.q]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const updateParams = React.useCallback(
    (next: Partial<{ q: string; category: string; platform: string }>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value && value.trim()) sp.set(key, value);
        else sp.delete(key);
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [searchParams, pathname, router]
  );

  React.useEffect(() => {
    if (localQ === (filters.q ?? "")) return;
    const handle = window.setTimeout(
      () => updateParams({ q: localQ }),
      DEBOUNCE_MS
    );
    return () => window.clearTimeout(handle);
  }, [localQ, filters.q, updateParams]);

  const activeCategory = facets.categories.find(
    (c) => c.slug === filters.categorySlug
  );
  const activePlatformSlug = filters.platformSlug ?? "";
  const hasAnyFilter = Boolean(
    (filters.q && filters.q.trim()) ||
      filters.categorySlug ||
      filters.platformSlug
  );

  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-5">
      <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row md:items-center gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 card-glass rounded-full px-3.5 h-9 w-[260px] sm:w-[280px]">
            <SearchIcon size={14} className="text-black/45" />
            <input
              ref={inputRef}
              type="text"
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 min-w-0 bg-transparent outline-none text-[12.5px] text-ink placeholder:text-black/40"
            />
            <span className="text-[10px] font-medium text-black/40 tabular-nums shrink-0">
              {formatCount(resultCount)}
            </span>
          </div>

          {hasAnyFilter ? (
            <button
              type="button"
              onClick={() =>
                updateParams({ q: "", category: "", platform: "" })
              }
              aria-label={t("clear")}
              title={t("clear")}
              className="h-9 px-3 rounded-full card-glass flex items-center gap-1.5 text-[12px] text-black/75 hover:text-ink transition"
            >
              <CloseIcon size={12} />
              <span>{t("clear")}</span>
            </button>
          ) : (
            <button
              type="button"
              aria-label={t("filter")}
              className="w-9 h-9 rounded-full card-glass flex items-center justify-center text-black/65 hover:text-ink transition"
            >
              <FilterIcon size={14} />
            </button>
          )}

          <div className="flex items-center gap-1.5">
            {facets.platforms.map((p) => {
              const active = p.slug === activePlatformSlug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  aria-label={p.label}
                  aria-pressed={active}
                  title={p.label}
                  onClick={() =>
                    updateParams({ platform: active ? "" : p.slug })
                  }
                  className={`w-9 h-9 rounded-full card-glass flex items-center justify-center transition ${
                    active
                      ? "ring-2 ring-brand text-ink"
                      : "text-black/75 hover:text-ink"
                  }`}
                >
                  {platformGlyph(p.slug, 14) ?? (
                    <span className="text-[10px] font-semibold text-ink">
                      {p.glyph}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 md:ml-auto">
          <CategoryDropdown
            label={activeCategory ? activeCategory.label : t("category")}
            categories={facets.categories}
            activeSlug={filters.categorySlug}
            anyLabel={t("anyCategory")}
            active={Boolean(filters.categorySlug)}
            onSelect={(slug) => updateParams({ category: slug })}
          />
          <Dropdown label={t("content")} />
          <LocaleSwitcher />
          {accountSlot}
        </div>
      </div>
    </section>
  );
}

function CategoryDropdown({
  label,
  categories,
  activeSlug,
  anyLabel,
  active,
  onSelect
}: {
  label: string;
  categories: { slug: string; label: string }[];
  activeSlug: string | undefined;
  anyLabel: string;
  active: boolean;
  onSelect: (slug: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`h-9 px-3.5 rounded-full card-glass flex items-center gap-2 text-[12.5px] transition ${
            active ? "text-ink font-medium" : "text-black/80 hover:text-ink"
          }`}
        >
          <span>{label}</span>
          <ChevronDownIcon size={13} className="text-black/45" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 max-h-[60vh] overflow-y-auto"
      >
        <DropdownMenuItem
          onSelect={() => onSelect("")}
          className={!activeSlug ? "font-medium" : ""}
        >
          {anyLabel}
        </DropdownMenuItem>
        {categories.map((c) => (
          <DropdownMenuItem
            key={c.slug}
            onSelect={() => onSelect(c.slug)}
            className={c.slug === activeSlug ? "font-medium" : ""}
          >
            {c.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Dropdown({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="h-9 px-3.5 rounded-full card-glass flex items-center gap-2 text-[12.5px] text-black/80 hover:text-ink transition"
    >
      <span>{label}</span>
      <ChevronDownIcon size={13} className="text-black/45" />
    </button>
  );
}
