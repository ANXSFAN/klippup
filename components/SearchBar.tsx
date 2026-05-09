"use client";
import * as React from "react";
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

const platformChips = [
  { key: "tt", node: <TiktokIcon size={14} /> },
  { key: "yt", node: <YouTubeIcon size={14} /> },
  { key: "ig", node: <InstagramIcon size={14} /> },
  { key: "x", node: <XIcon size={14} /> },
  { key: "tw", node: <TwitchIcon size={14} /> }
];

export default function SearchBar({ resultCount = "30K" }: { resultCount?: string }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-5">
      <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row md:items-center gap-2.5">
        {/* left cluster: search + filter + platform chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 card-glass rounded-full px-3.5 h-9 w-[260px] sm:w-[280px]">
            <SearchIcon size={14} className="text-white/45" />
            <input
              type="text"
              placeholder="Campaigns and creators"
              className="flex-1 min-w-0 bg-transparent outline-none text-[12.5px] text-white placeholder:text-white/40"
            />
            <span className="text-[10px] font-medium text-white/40 tabular-nums">
              {resultCount}
            </span>
          </div>

          <button
            type="button"
            aria-label="filter"
            className="w-9 h-9 rounded-full card-glass flex items-center justify-center text-white/75 hover:text-white transition"
          >
            <FilterIcon size={14} />
          </button>

          <div className="flex items-center gap-1.5">
            {platformChips.map((p) => (
              <button
                key={p.key}
                type="button"
                aria-label={p.key}
                className="w-9 h-9 rounded-full card-glass flex items-center justify-center text-white/80 hover:text-white transition"
              >
                {p.node}
              </button>
            ))}
          </div>
        </div>

        {/* dropdowns pinned right */}
        <div className="flex items-center gap-2 md:ml-auto">
          <Dropdown label="Category" />
          <Dropdown label="Content" />
        </div>
      </div>
    </section>
  );
}

function Dropdown({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="h-9 px-3.5 rounded-full card-glass flex items-center gap-2 text-[12.5px] text-white/85 hover:text-white transition"
    >
      <span>{label}</span>
      <ChevronDownIcon size={13} className="text-white/55" />
    </button>
  );
}
