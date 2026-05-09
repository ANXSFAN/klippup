export type Platform = "tiktok" | "youtube" | "instagram" | "x" | "twitch";
export type Category =
  | "ugc"
  | "music"
  | "gaming"
  | "lifestyle"
  | "fashion"
  | "tech"
  | "fitness"
  | "food"
  | "auto"
  | "art";

export interface Campaign {
  id: string;
  brand: string;
  brandVerified: boolean;
  title: string;
  artTitle?: string;
  cover: string;
  description: string;
  category: Category;
  categoryLabel: string;
  platforms: Platform[];
  raised: number;
  budget: number;
  participants: number;
  rate: string;
  ageDays: number;
  hot?: boolean;
  poweredBy?: string;
  requirementsSteps?: number;
  earnings?: {
    tiktok?: { rate: string; min: string; max: string };
    youtube?: { rate: string; min: string; max: string };
    instagram?: { rate: string; min: string; max: string };
  };
  totalViews?: string;
}

const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const heroCampaign: Campaign = {
  id: "hero-1",
  brand: "Ranger Outfitters",
  brandVerified: true,
  title: "Ranger Outfitters Tactical Clipping",
  artTitle: "RANGER\nOUTFITTERS",
  cover: u("photo-1521337581100-8ca9a73a5f79", 1400),
  description:
    "Cut and clip approved combat-gear footage. Push the brand into action-tagged channels and stack views across TikTok, Reels and Shorts.",
  category: "lifestyle",
  categoryLabel: "Lifestyle",
  platforms: ["tiktok", "youtube", "instagram"],
  raised: 1_500_000,
  budget: 13_000,
  participants: 481,
  rate: "$1/1K",
  ageDays: 1,
  poweredBy: "ClipHouse",
  hot: true
};

export const featured: Campaign[] = [
  {
    id: "feat-1",
    brand: "Content Rewards",
    brandVerified: true,
    title: "Content Rewards [UGC]",
    cover: u("photo-1493612276216-ee3925520721", 800),
    description:
      "Open-call UGC drops every week. Pick a brief, ship a clip, get paid per thousand views.",
    category: "ugc",
    categoryLabel: "UGC",
    platforms: ["tiktok", "youtube", "instagram", "x"],
    raised: 2903,
    budget: 50_000,
    participants: 299,
    rate: "$1/1K",
    ageDays: 2,
    hot: true
  },
  {
    id: "feat-2",
    brand: "Vesper Studio",
    brandVerified: true,
    title: "Vesper — Night Hours Album Push",
    cover: u("photo-1511671782779-c97d3d27a1d4", 800),
    description:
      "Sync clips to the new Vesper single. Live performance and lyric-edit allowed.",
    category: "music",
    categoryLabel: "Music",
    platforms: ["tiktok", "instagram"],
    raised: 6480,
    budget: 22_000,
    participants: 162,
    rate: "$1.20/1K",
    ageDays: 5,
    hot: true
  },
  {
    id: "feat-3",
    brand: "Heavenly Cuts",
    brandVerified: true,
    title: "Heavenly Cuts — Series Trailer Clipping",
    cover: u("photo-1485579149621-3123dd979885", 800),
    description:
      "Take the official trailer pack and remix into 30s vertical edits with the supplied OST.",
    category: "art",
    categoryLabel: "Film",
    platforms: ["tiktok", "youtube"],
    raised: 8200,
    budget: 25_000,
    participants: 412,
    rate: "$1.10/1K",
    ageDays: 3
  },
  {
    id: "feat-4",
    brand: "ClipHouse",
    brandVerified: true,
    title: "ClipHouse — Open Volunteer Wave",
    cover: u("photo-1493711662062-fa541adb3fc8", 800),
    description:
      "Free-form briefs, weekly leaderboard, payout on submission approval.",
    category: "ugc",
    categoryLabel: "UGC",
    platforms: ["tiktok", "youtube", "instagram", "x", "twitch"],
    raised: 4150,
    budget: 18_000,
    participants: 240,
    rate: "$1/1K",
    ageDays: 1,
    hot: true
  },
  {
    id: "feat-5",
    brand: "Forge Athletics",
    brandVerified: true,
    title: "Forge — Summer Cut Challenge",
    cover: u("photo-1517836357463-d25dfeac3438", 800),
    description:
      "30-day fitness transformation clips. Pre/post splits, timelapse and gym-floor angles all welcome.",
    category: "fitness",
    categoryLabel: "Fitness",
    platforms: ["tiktok", "instagram", "youtube"],
    raised: 11_240,
    budget: 30_000,
    participants: 528,
    rate: "$1.30/1K",
    ageDays: 4,
    hot: true
  },
  {
    id: "feat-6",
    brand: "Nimbus Labs",
    brandVerified: true,
    title: "Nimbus — Devkit Unboxing Wave",
    cover: u("photo-1518770660439-4636190af475", 800),
    description:
      "Unbox the new dev-kit, run the demo flow, and ship a 45s vertical with the supplied OST.",
    category: "tech",
    categoryLabel: "Tech",
    platforms: ["youtube", "tiktok", "x"],
    raised: 3_780,
    budget: 16_000,
    participants: 134,
    rate: "$1.20/1K",
    ageDays: 2
  },
  {
    id: "feat-7",
    brand: "Crumb & Co",
    brandVerified: true,
    title: "Crumb & Co — Sourdough Drop",
    cover: u("photo-1509440159596-0249088772ff", 800),
    description:
      "ASMR-style bake clips. Hero shot of the crumb, brand bag in frame, 15–30s vertical only.",
    category: "food",
    categoryLabel: "Food",
    platforms: ["tiktok", "instagram"],
    raised: 1_950,
    budget: 8_000,
    participants: 96,
    rate: "$1/1K",
    ageDays: 3
  },
  {
    id: "feat-8",
    brand: "NovaForge",
    brandVerified: true,
    title: "NovaForge — Ranked Boss Run",
    cover: u("photo-1538481199705-c710c4e965fc", 800),
    description:
      "Submit ranked boss-clear highlights. Top frags and clutch finishes get the 1.5x multiplier.",
    category: "gaming",
    categoryLabel: "Gaming",
    platforms: ["youtube", "twitch", "tiktok"],
    raised: 7_360,
    budget: 22_000,
    participants: 388,
    rate: "$1.50/1K",
    ageDays: 5,
    hot: true
  },
  {
    id: "feat-9",
    brand: "Hexline Couture",
    brandVerified: true,
    title: "Hexline — Capsule Drop SS26",
    cover: u("photo-1490481651871-ab68de25d43d", 800),
    description:
      "Lookbook & try-on edits for the SS26 capsule. Editorial cuts and street-style POV both accepted.",
    category: "fashion",
    categoryLabel: "Fashion",
    platforms: ["instagram", "tiktok"],
    raised: 5_120,
    budget: 14_000,
    participants: 207,
    rate: "$1.10/1K",
    ageDays: 2
  },
  {
    id: "feat-10",
    brand: "Pluton Drift",
    brandVerified: true,
    title: "Pluton — Track Day Clipping",
    cover: u("photo-1492144534655-ae79c964c9d7", 800),
    description:
      "Approved circuit footage from the McLaurel capsule. Slow-mo and onboard angles encouraged.",
    category: "auto",
    categoryLabel: "Auto",
    platforms: ["tiktok", "youtube", "instagram"],
    raised: 6_840,
    budget: 20_000,
    participants: 274,
    rate: "$1.20/1K",
    ageDays: 6
  }
];

export const campaigns: Campaign[] = [
  {
    id: "c-1",
    brand: "ClipLaunch",
    brandVerified: true,
    title: "NappStar Clipping",
    cover: u("photo-1534438327276-14e5300c3a48", 800),
    description:
      "Sneaker drop campaign — show the silhouette in motion, tag store handle.",
    category: "fashion",
    categoryLabel: "Fashion",
    platforms: ["tiktok", "instagram"],
    raised: 837,
    budget: 3500,
    participants: 82,
    rate: "$1.50/1K",
    ageDays: 2
  },
  {
    id: "c-2",
    brand: "Clip Farm",
    brandVerified: true,
    title: "Jason — Week One Push",
    cover: u("photo-1542751371-adc38448a05e", 800),
    description:
      "Indie horror release week. Use the supplied trailer cuts and the audio pack.",
    category: "art",
    categoryLabel: "Film",
    platforms: ["tiktok", "youtube"],
    raised: 1568,
    budget: 5000,
    participants: 173,
    rate: "$1/1K",
    ageDays: 4,
    hot: true
  },
  {
    id: "c-3",
    brand: "The Clip Ship",
    brandVerified: true,
    title: "Mumford Sound | UGC Live Clipping",
    artTitle: "MUMFORD\nSOUND",
    cover: u("photo-1571260899304-425eee4c7efc", 800),
    description:
      "Clip content from the approved assets folder below to drive awareness to Mumford Sound whilst attaching one of the required sounds.",
    category: "music",
    categoryLabel: "Music",
    platforms: ["tiktok", "instagram", "youtube"],
    raised: 4417,
    budget: 9300,
    participants: 881,
    rate: "$1/1K",
    ageDays: 3,
    hot: true,
    requirementsSteps: 4,
    earnings: {
      tiktok: { rate: "$1/1K views", min: "$1Min", max: "$1Max" },
      youtube: { rate: "$1/1K views", min: "$1Min", max: "$1Max" },
      instagram: { rate: "$1/1K views", min: "$1Min", max: "$1Max" }
    },
    totalViews: "3.8M"
  },
  {
    id: "c-4",
    brand: "Galaxy Reel",
    brandVerified: true,
    title: "SW — Rogue Rebellion Clipping",
    cover: u("photo-1518717758536-85ae29035b6d", 800),
    description: "Sci-fi trailer remix campaign — vertical edits only.",
    category: "art",
    categoryLabel: "Film",
    platforms: ["tiktok", "youtube"],
    raised: 2715,
    budget: 7400,
    participants: 357,
    rate: "$1/1K",
    ageDays: 2
  },
  {
    id: "c-5",
    brand: "Bloom Music",
    brandVerified: true,
    title: "Bloom — Spring Drop",
    cover: u("photo-1493711662062-fa541adb3fc8", 800),
    description: "Lyric-edit and dance-clip campaign for the spring single.",
    category: "music",
    categoryLabel: "Music",
    platforms: ["tiktok", "instagram"],
    raised: 990,
    budget: 4000,
    participants: 64,
    rate: "$1/1K",
    ageDays: 6
  },
  {
    id: "c-6",
    brand: "StarGate",
    brandVerified: true,
    title: "StarGate — Boss Run Clipping",
    cover: u("photo-1542652694-40abf526446e", 800),
    description: "Game launch — clip approved gameplay loops.",
    category: "gaming",
    categoryLabel: "Gaming",
    platforms: ["tiktok", "youtube", "twitch"],
    raised: 6390,
    budget: 15_000,
    participants: 521,
    rate: "$1.10/1K",
    ageDays: 5,
    hot: true
  },
  {
    id: "c-7",
    brand: "Sypset Tour",
    brandVerified: true,
    title: "Sypset — World Tour Clips",
    cover: u("photo-1493612276216-ee3925520721", 800),
    description: "Tour visuals — concert footage clipping.",
    category: "music",
    categoryLabel: "Music",
    platforms: ["tiktok", "instagram", "youtube"],
    raised: 3200,
    budget: 10_000,
    participants: 270,
    rate: "$1/1K",
    ageDays: 3
  },
  {
    id: "c-8",
    brand: "Virality",
    brandVerified: true,
    title: "Spoiled — Podcast Clipping",
    cover: u("photo-1551269901-5c5e14c25df7", 800),
    description: "Top podcast moments turned into vertical clips.",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    platforms: ["tiktok", "youtube"],
    raised: 8220,
    budget: 30_000,
    participants: 698,
    rate: "$1/1K",
    ageDays: 7
  },
  {
    id: "c-9",
    brand: "ClipLaunch",
    brandVerified: true,
    title: "Lockstroke — Live Clipping",
    cover: u("photo-1488376739369-cb6f8b704e16", 800),
    description: "Live event highlights — first-week multiplier active.",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    platforms: ["tiktok", "instagram"],
    raised: 1530,
    budget: 5500,
    participants: 145,
    rate: "$1/1K",
    ageDays: 4
  },
  {
    id: "c-10",
    brand: "Ranger Outfitters",
    brandVerified: true,
    title: "Ranger — Field Pack Drop",
    cover: u("photo-1521337581100-8ca9a73a5f79", 800),
    description: "Approved combat-gear footage. Vertical only.",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    platforms: ["tiktok", "youtube"],
    raised: 4870,
    budget: 12_000,
    participants: 304,
    rate: "$1/1K",
    ageDays: 2,
    hot: true
  },
  {
    id: "c-11",
    brand: "Cliphaus",
    brandVerified: true,
    title: "Down to Heat — Podcast Clipping",
    cover: u("photo-1545239351-ef35f43d514b", 800),
    description: "Cut down podcast episodes into 60s viral hooks.",
    category: "lifestyle",
    categoryLabel: "Podcast",
    platforms: ["tiktok", "youtube"],
    raised: 2400,
    budget: 8000,
    participants: 188,
    rate: "$1/1K",
    ageDays: 5
  },
  {
    id: "c-12",
    brand: "Crisper Exchange",
    brandVerified: true,
    title: "9 Inch Nails — Heresy Clipping",
    cover: u("photo-1485579149621-3123dd979885", 800),
    description: "Industrial rock clipping — heavy filter, bass cut allowed.",
    category: "music",
    categoryLabel: "Music",
    platforms: ["tiktok", "youtube"],
    raised: 1170,
    budget: 5000,
    participants: 117,
    rate: "$1.10/1K",
    ageDays: 6
  },
  {
    id: "c-13",
    brand: "Noise Lab",
    brandVerified: true,
    title: "Noise Virality",
    cover: u("photo-1511671782779-c97d3d27a1d4", 800),
    description: "Generic UGC pool — submit any approved-format clip.",
    category: "music",
    categoryLabel: "Music",
    platforms: ["tiktok", "instagram"],
    raised: 920,
    budget: 4000,
    participants: 88,
    rate: "$1/1K",
    ageDays: 8
  },
  {
    id: "c-14",
    brand: "Globe Inc",
    brandVerified: true,
    title: "Global Trade — Series Push",
    cover: u("photo-1517694712202-14dd9538aa97", 800),
    description: "Documentary clip campaign with brand alignment.",
    category: "tech",
    categoryLabel: "Tech",
    platforms: ["tiktok", "youtube"],
    raised: 5500,
    budget: 18_000,
    participants: 230,
    rate: "$1/1K",
    ageDays: 4
  },
  {
    id: "c-15",
    brand: "Nimbus Records",
    brandVerified: true,
    title: "NIM — Industrial Push",
    cover: u("photo-1493711662062-fa541adb3fc8", 800),
    description: "Industrial electronic — gritty edits encouraged.",
    category: "music",
    categoryLabel: "Music",
    platforms: ["tiktok", "youtube"],
    raised: 3800,
    budget: 12_000,
    participants: 290,
    rate: "$1.10/1K",
    ageDays: 6
  },
  {
    id: "c-16",
    brand: "Pluton Drift",
    brandVerified: true,
    title: "Pluton — McLaurel Capsule",
    cover: u("photo-1492144534655-ae79c964c9d7", 800),
    description: "Auto capsule launch — track day footage approved.",
    category: "auto",
    categoryLabel: "Auto",
    platforms: ["tiktok", "instagram"],
    raised: 2100,
    budget: 9000,
    participants: 142,
    rate: "$1/1K",
    ageDays: 3
  },
  {
    id: "c-17",
    brand: "Cup Form",
    brandVerified: true,
    title: "Cup of McLaurel",
    cover: u("photo-1503376780353-7e6692767b70", 800),
    description: "Coffee + speed crossover. Lifestyle vertical only.",
    category: "auto",
    categoryLabel: "Lifestyle",
    platforms: ["tiktok", "instagram"],
    raised: 720,
    budget: 3000,
    participants: 56,
    rate: "$1/1K",
    ageDays: 2
  },
  {
    id: "c-18",
    brand: "Rail Co",
    brandVerified: true,
    title: "Rail — Trip RUL Clipping",
    cover: u("photo-1474487548417-781cb71495f3", 800),
    description: "Travel clipping — long-haul rail aesthetic.",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    platforms: ["tiktok", "youtube"],
    raised: 4200,
    budget: 11_000,
    participants: 320,
    rate: "$1/1K",
    ageDays: 4
  },
  {
    id: "c-19",
    brand: "Lyric Office",
    brandVerified: true,
    title: "Lyric Clipping",
    cover: u("photo-1534077962529-0b958e8df9ce", 800),
    description: "Lyric-card style edits, type-on-screen template provided.",
    category: "music",
    categoryLabel: "Music",
    platforms: ["tiktok", "instagram"],
    raised: 980,
    budget: 4000,
    participants: 92,
    rate: "$1/1K",
    ageDays: 7
  },
  {
    id: "c-20",
    brand: "Rookie",
    brandVerified: true,
    title: "Rookie Clipping",
    cover: u("photo-1551836022-d5d88e9218df", 800),
    description: "Beginner-friendly UGC pool, smaller payout per clip.",
    category: "ugc",
    categoryLabel: "UGC",
    platforms: ["tiktok"],
    raised: 510,
    budget: 2000,
    participants: 48,
    rate: "$0.80/1K",
    ageDays: 1
  },
  {
    id: "c-21",
    brand: "Tilesh",
    brandVerified: true,
    title: "Premiere Music Vibes",
    cover: u("photo-1485579149621-3123dd979885", 800),
    description: "Mood-based music vertical with weekly themes.",
    category: "music",
    categoryLabel: "Music",
    platforms: ["tiktok", "instagram"],
    raised: 1820,
    budget: 6000,
    participants: 174,
    rate: "$1/1K",
    ageDays: 5
  },
  {
    id: "c-22",
    brand: "Tilesh",
    brandVerified: true,
    title: "T Break — Sneak Peek",
    cover: u("photo-1518972559570-7cc1309f3229", 800),
    description: "Pre-release sneak peeks — embargo-aware briefs.",
    category: "music",
    categoryLabel: "Music",
    platforms: ["tiktok", "youtube"],
    raised: 660,
    budget: 3000,
    participants: 71,
    rate: "$1/1K",
    ageDays: 2
  },
  {
    id: "c-23",
    brand: "Killdozer",
    brandVerified: true,
    title: "Killdozer Clipping",
    cover: u("photo-1542652694-40abf526446e", 800),
    description: "Action gameplay — heavy machinery aesthetic.",
    category: "gaming",
    categoryLabel: "Gaming",
    platforms: ["tiktok", "youtube", "twitch"],
    raised: 3300,
    budget: 9000,
    participants: 256,
    rate: "$1/1K",
    ageDays: 3
  },
  {
    id: "c-24",
    brand: "Starcraft Vitality",
    brandVerified: true,
    title: "Starcraft Vitality (Gaming Clipping)",
    cover: u("photo-1583394838336-acd977736f90", 800),
    description: "RTS gameplay clipping — strategy showcase encouraged.",
    category: "gaming",
    categoryLabel: "Gaming",
    platforms: ["tiktok", "youtube", "twitch"],
    raised: 4900,
    budget: 12_000,
    participants: 298,
    rate: "$1/1K",
    ageDays: 4
  }
];

export const platformIcons: Record<Platform, string> = {
  tiktok: "TT",
  youtube: "YT",
  instagram: "IG",
  x: "X",
  twitch: "TW"
};

export const formatMoney = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${n.toLocaleString("en-US")}`;
  return `$${n}`;
};
