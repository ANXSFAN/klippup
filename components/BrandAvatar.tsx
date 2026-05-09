import * as React from "react";

const palette = [
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-violet-400 to-purple-500",
  "from-yellow-400 to-amber-500",
  "from-fuchsia-400 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-lime-400 to-emerald-500",
  "from-red-400 to-rose-500",
  "from-indigo-400 to-violet-500",
  "from-orange-400 to-red-500"
];

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function BrandAvatar({
  name,
  size = 14,
  className = ""
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const idx = hashStr(name) % palette.length;
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const fontSize = Math.max(8, Math.round(size * 0.55));

  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${palette[idx]} text-black font-bold leading-none shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize }}
    >
      {letters || "?"}
    </span>
  );
}
