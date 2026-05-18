"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import {
  SearchIcon,
  ChevronDownIcon,
  FilterIcon,
  TiktokIcon,
  YouTubeIcon,
  InstagramIcon,
  XIcon,
  TwitchIcon
} from "./Icons";
import LocaleSwitcher from "./LocaleSwitcher";

const platformChips = [
  { key: "tiktok", node: <TiktokIcon size={14} /> },
  { key: "youtube", node: <YouTubeIcon size={14} /> },
  { key: "instagram", node: <InstagramIcon size={14} /> },
  { key: "x", node: <XIcon size={14} /> },
  { key: "twitch", node: <TwitchIcon size={14} /> }
];

export default function SearchBar({ resultCount = "30K" }: { resultCount?: string }) {
  const t = useTranslations("search");
  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-5">
      <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row md:items-center gap-2.5">
        {/* left cluster: search + filter + platform chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 card-glass rounded-full px-3.5 h-9 w-[260px] sm:w-[280px]">
            <SearchIcon size={14} className="text-black/45" />
            <input
              type="text"
              placeholder={t("placeholder")}
              className="flex-1 min-w-0 bg-transparent outline-none text-[12.5px] text-ink placeholder:text-black/40"
            />
            <span className="text-[10px] font-medium text-black/40 tabular-nums">
              {resultCount}
            </span>
          </div>

          <button
            type="button"
            aria-label={t("filter")}
            className="w-9 h-9 rounded-full card-glass flex items-center justify-center text-black/65 hover:text-ink transition"
          >
            <FilterIcon size={14} />
          </button>

          <div className="flex items-center gap-1.5">
            {platformChips.map((p) => (
              <button
                key={p.key}
                type="button"
                aria-label={p.key}
                className="w-9 h-9 rounded-full card-glass flex items-center justify-center text-black/75 hover:text-ink transition"
              >
                {p.node}
              </button>
            ))}
          </div>
        </div>

        {/* dropdowns + language pinned right */}
        <div className="flex items-center gap-2 md:ml-auto">
          <Dropdown label={t("category")} />
          <Dropdown label={t("content")} />
          <LocaleSwitcher />
        </div>
      </div>
    </section>
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
