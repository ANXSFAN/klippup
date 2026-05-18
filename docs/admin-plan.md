# KlippUp 后台 · 计划书 v2

> 状态：基本定稿，留 §9 几个小确认点。
> 上一版讨论结论已并入。最后更新：2026-05-12

---

## 0. 本次范围（重要 — 先对齐）

你给的三套后台（**创作者后台 / 品牌方后台 / 平台管理后台**）是产品长期蓝图。**v1 只做其中跟"把首页静态内容变成动态"直接相关的那一块**，也就是「平台管理后台」里的：

- **3.2 Campaign 审核与管理** —— 活动全局列表、上下架/暂停、推荐/置顶（= Discover 排序权重）、分类/标签管理
- **3.7 系统配置（一部分）** —— 支持的社交平台管理、后台多语言
- **3.6 数据分析（一小块）** —— 基础数据看板（活动数、预算、参与人数等聚合）

**v1 明确不做**：用户体系 / 登录认证 / KYC / 创作者后台 / 品牌方后台 / 视频提交与审核队列 / 反作弊风控 / 财务结算 / 工单仲裁 / 平台级运营看板（DAU·GMV…）。这些等有了 `User / Brand / Submission / Payout` 等实体再说，见 §8。数据模型会留好扩展位（例：`Campaign.brand` 现在是字符串，将来可平滑迁成 `brandId` 外键）。

**认证**：v1 不做（你说"没人会看"）。`/admin` 直接可访问。以后要加，在 `middleware.ts` 加一道即可，模型层不受影响。

### 0.1 本轮新确认的决定

| 项 | 决定 |
|---|---|
| 多语言（**整个项目，前台 + 后台**） | 默认 **西班牙语 `es`**（这个产品实际在西班牙用），同时提供 **中文 `zh`**，用 **next-intl** 搭框架，留好加语言的口子。v1：把**前台 + 后台所有界面文案**（按钮/菜单/标题/表头/表单标签/aria）都抽进 `messages/{locale}.json`。**活动内容本身（标题/描述/品牌名）暂不做字段级多语言**——后台填什么显示什么（建议直接填西语），内容级 i18n 留作后续（见 §8）。 |
| placement | 一个活动**可同时出现在多个位置**（Hero / Featured / Grid）→ 用 `CampaignPlacement` 关系表，每个 slot 各自排序。 |
| Modal 里的"假数据" | **保留，并且 v1 后台就做成可编辑的真实字段**：requirements（要求列表）、earnings（各平台 rate/min/max）、Top Earners、Resources（Drive/Discord 等）、浏览量曲线。目标 = "首页能看到的，后台都能改"。seed 里没有的，先用现在的 `defaultXxx` 当 fallback。 |
| 其余 | 按上一版默认：Prisma / seed 时图片存 Unsplash 外链 / earnings 用 JSON 字段 / categoryLabel 保留 per-campaign 覆盖 / brand 内联 / 加 `status`(草稿·已发布·已下架) / 图表用 recharts。 |

---

## 1. 总体架构

同一个 Next.js 16 app，route group 分前台 `(site)` / 后台 `admin`：

```
app/
  layout.tsx                   # 根布局，包 NextIntlClientProvider（locale 来自 cookie）
  (site)/
    layout.tsx
    page.tsx                   # 首页 → server component，数据从 DB 取
  admin/
    layout.tsx                 # 后台外壳（侧边栏 + 顶栏含 LocaleSwitcher）
    page.tsx                   # 数据看板
    campaigns/page.tsx         # 活动列表（表格）
    campaigns/new/page.tsx     # 新建
    campaigns/[id]/page.tsx    # 编辑
    categories/page.tsx        # 分类管理
    platforms/page.tsx         # 平台管理
    settings/page.tsx          # （可选）语言切换 + 只读配置
  api/admin/upload/route.ts    # 签发 Supabase 图片上传地址

i18n/
  request.ts                   # next-intl getRequestConfig（无 i18n 路由模式）
  locale.ts                    # 读写 locale cookie 的工具
messages/
  es.json                      # 西语（默认）
  zh.json                      # 中文

lib/
  db.ts                        # Prisma client 单例
  queries.ts                   # 读：getDiscoverPage() / getCampaign(id) / 统计
  actions/                     # 写：Server Actions（campaigns / categories / platforms）
  supabase.ts                  # Supabase 服务端 client（service role）
  format.ts                    # formatMoney / 平台 glyph 等（从 data/campaigns.ts 迁出）
  types.ts                     # 前台视图 DTO
  validators.ts                # zod schema（表单 + action 共用）

prisma/
  schema.prisma
  seed.ts                      # 把现在 data/campaigns.ts 的内容灌进库

components/
  ui/                          # shadcn 组件
  admin/                       # CampaignForm / DataTable / ImageUpload / LocaleSwitcher / StatCard...
  ...（现有前台组件基本不动，只改数据来源）
```

**数据流**：前台 Server Component `await getDiscoverPage()` → Prisma → Postgres；后台写操作走 Server Actions（保存后 `revalidatePath('/')`）；图片走 Supabase 签名上传 URL，浏览器直传不经 Vercel 函数；locale 存 cookie，next-intl 无路由模式（URL 不变）。

---

## 2. 数据模型（Prisma schema 草案）

```prisma
// ---------- 分类 / 平台 ----------
model Category {
  id        String     @id @default(cuid())
  slug      String     @unique          // "ugc" / "music" / "gaming"...
  label     String                       // 默认徽标文案 "UGC" / "Music"
  sortOrder Int        @default(0)
  campaigns Campaign[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Platform {
  id        String             @id @default(cuid())
  slug      String             @unique   // tiktok / youtube / instagram / x / twitch
  label     String                        // "TikTok"...
  glyph     String                        // "TT" / "YT"...
  sortOrder Int                @default(0)
  campaigns CampaignPlatform[]
}

// ---------- 活动 ----------
model Campaign {
  id            String               @id @default(cuid())

  brand         String                            // v1 内联；未来可迁 brandId -> Brand
  brandVerified Boolean              @default(true)

  title         String
  artTitle      String?                            // 封面/Hero 美术字，可多行（存 \n）
  description   String               @db.Text

  coverUrl      String                             // Supabase Storage public URL

  category      Category             @relation(fields: [categoryId], references: [id])
  categoryId    String
  categoryLabel String?                            // per-campaign 覆盖；空则用 category.label

  platforms     CampaignPlatform[]

  raised        Int
  budget        Int
  participants  Int
  rate          String                             // 展示文案 "$1/1K"

  launchedAt    DateTime             @default(now())   // 取代写死的 ageDays，前台再算 "Nd"

  placements    CampaignPlacement[]                // 可同时多处
  hot           Boolean              @default(false)
  status        CampaignStatus       @default(PUBLISHED)

  // 详情区（Modal）— 原本写死，现在全部可编辑
  poweredBy         String?
  requirementsSteps Int?
  requirements      String[]         @default([])  // 要求列表（bullet）
  earnings          Json?                          // { tiktok?:{rate,min,max}, youtube?:{}, instagram?:{}, x?:{} }
  topEarners        Json?                          // [{ name, views }]
  resources         Json?                          // [{ name, subtitle, kind:"drive"|"link", url }]
  totalViews        String?                        // "3.8M" / "63.6万"
  viewsSeries       Int[]            @default([])  // 浏览量曲线点

  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  @@index([status])
}

model CampaignPlacement {
  id         String        @id @default(cuid())
  campaign   Campaign      @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  campaignId String
  slot       PlacementSlot                          // HERO / FEATURED / GRID
  sortOrder  Int           @default(0)              // 同一 slot 内排序
  @@unique([campaignId, slot])
  @@index([slot, sortOrder])
}

model CampaignPlatform {
  campaign   Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  campaignId String
  platform   Platform @relation(fields: [platformId], references: [id])
  platformId String
  order      Int      @default(0)
  @@id([campaignId, platformId])
}

enum PlacementSlot  { HERO FEATURED GRID }
enum CampaignStatus { DRAFT PUBLISHED ARCHIVED }
```

### 2.1 现有字段 → 新 schema 对照

| 现在 `data/campaigns.ts` | 新设计 | 变化 |
|---|---|---|
| 三个数组 `heroCampaign / featured / campaigns` | 一张 `Campaign` 表 + `CampaignPlacement`（slot=HERO/FEATURED/GRID） | 合并；且可一个活动多处 |
| `cover`（Unsplash URL） | `coverUrl`（seed 时先存 Unsplash 外链，后台编辑时换成上传图） | — |
| `category` / `categoryLabel` | `categoryId → Category` + `categoryLabel?` 覆盖 | 规范化 + 保留覆盖 |
| `platforms: Platform[]` | `CampaignPlatform` + `Platform` 表 | 规范化 |
| `ageDays` | `launchedAt`，前台算天数 | ✅ |
| `hot / poweredBy / requirementsSteps / totalViews / artTitle` | 同名字段 | — |
| `earnings`（对象，3 平台） | `earnings: Json`（可含 x） | — |
| Modal 里 `defaultRequirements` | `requirements: String[]` | 静态→动态 |
| Modal 里 `defaultTopEarners` | `topEarners: Json` | 静态→动态 |
| Modal 里 `defaultResources` | `resources: Json`（加 `url`） | 静态→动态 |
| Modal 里 `ViewsChart` 的点 | `viewsSeries: Int[]` | 静态→动态 |
| `formatMoney / platformIcons` | 迁到 `lib/format.ts` | — |
| TS 里 `Campaign/Platform/Category` 类型 | Prisma 生成类型 + `lib/types.ts` DTO | — |

`data/campaigns.ts` 最终删除（内容进 `prisma/seed.ts`）。

---

## 3. 首页改造（Phase 1 — 纯重构，外观不变）

1. `app/page.tsx`（现 `"use client"`）→ `app/(site)/page.tsx` = **Server Component**，`await getDiscoverPage()` 取数据传下去；交互状态（modal 开关、hero 轮播）下沉到新建的 `components/DiscoverClient.tsx`（client）。
2. `getDiscoverPage()` 一次查回：`hero`（slot=HERO 取第一）、`featured`（slot=FEATURED 按 sortOrder）、`grid`（slot=GRID 按 sortOrder），都过滤 `status=PUBLISHED`。同一活动可出现在多个数组里。
3. `formatMoney` 等迁到 `lib/format.ts`，前台组件改 import。
4. `SearchBar` 的 Category / Content 下拉 + 平台 chip 用 `Category` / `Platform` 表填充（显示真实选项）。**让筛选真正生效 = 后续，不在 v1**。
5. `CampaignModal` 改吃真实字段：`requirements / earnings / topEarners / resources / viewsSeries / totalViews`；字段为空时回退到现在的 `defaultXxx`，保证旧数据/空数据也好看。
6. `SmartImage`（纯 `<img>`）继续用，不必动 `next.config.images`（以后换 `next/image` 再加 supabase 域名）。
7. 首页缓存：`export const revalidate = 60`，后台 action 里 `revalidatePath('/')` 即时刷新。
8. 验收：改完后首页和现在长得一模一样（数据来自库，内容是 seed 进去的同一批）。

---

## 4. 后台

### 4.1 路由 & 页面

| 路由 | 内容 |
|---|---|
| `/admin` | 数据看板（§4.5） |
| `/admin/campaigns` | 活动表格：搜索 / 按 placement·status·category 筛选 / 分页；行内快捷切 status·hot；调每个 slot 内顺序（先用数字，拖拽后续） |
| `/admin/campaigns/new`、`/admin/campaigns/[id]` | 活动表单 |
| `/admin/categories` | 分类列表 + 行内增删改 + 排序；被引用时拒删 |
| `/admin/platforms` | 平台列表 + 行内增删改 + 排序；被引用时拒删 |
| `/admin/settings` | （可选）语言切换 + 只读配置（bucket 名、版本等） |

### 4.2 活动表单字段分组

- **基本信息**：brand、brandVerified、title、artTitle、description
- **媒体**：coverUrl（上传组件 + 预览 + 16:10 提示）
- **分类**：category（下拉）、categoryLabel（可选覆盖，占位符= 分类默认 label）
- **平台 & 费率**：platforms（多选 + 排序）、rate
- **数值**：raised、budget、participants、launchedAt（日期选择器）
- **展示位**：placements（多选 HERO/FEATURED/GRID，每个勾选后给一个 sortOrder）、hot、status
- **详情（Modal）**：poweredBy、requirementsSteps、requirements（可增减的文本行）、earnings（按所选平台给 rate/min/max 三个输入）、topEarners（可增减的「名字 + 播放量」行）、resources（可增减的「名称 + 副标题 + 类型 + 链接」行）、totalViews、viewsSeries（一组数字，逗号分隔或小网格）

校验：`lib/validators.ts` 的 zod schema，表单（react-hook-form + zodResolver）和 server action 入口共用同一份。

### 4.3 写操作（Server Actions in `lib/actions/`）

- `createCampaign / updateCampaign / deleteCampaign`
- `setCampaignPlacements`（增删 slot）/ `reorderCampaigns(slot, ids[])`
- `upsertCategory / deleteCategory`（被引用拒删）
- `upsertPlatform / deletePlatform`（被引用拒删）
- 每个写 action 末尾按需 `revalidatePath('/')` / `revalidatePath('/admin/campaigns')`

### 4.4 图片上传

1. 浏览器 `POST /api/admin/upload`（文件名/类型）→ 服务端用 Supabase service role 生成 **signed upload URL**。
2. 浏览器把文件直接 PUT 到该 URL（绕开 Vercel 函数 body 限制）。
3. 成功后用 `getPublicUrl()` 拿地址写进表单 `coverUrl`。
4. bucket `campaign-covers`（public 读）；命名 `campaigns/{cuid}-{ts}.{ext}`。

### 4.5 数据看板（`/admin`）

- 顶部数字卡：活动总数 / Σbudget / Σraised / Σparticipants（`prisma.campaign.aggregate`）
- 分布图：按 placement·status·category（`groupBy`）→ recharts 柱状/环形
- "最近创建的 5 个活动" 列表
- 图表库：`recharts`（约 50KB）

### 4.6 多语言（next-intl，覆盖前台 + 后台）

- 配置：locales `["es","zh"]`，**默认 `es`**；**无 i18n 路由模式** —— locale 存 `NEXT_LOCALE` cookie，URL 不变。`i18n/request.ts` 读 cookie 决定 locale + 动态 import `messages/{locale}.json`。
- `app/layout.tsx`（根布局，async）包 `NextIntlClientProvider`、`<html lang={locale}>`、用 `getTranslations` 出翻译过的 metadata。
- 前台组件（HeroCampaign / SearchBar / FeaturedRow / CampaignGrid / CampaignCard / CampaignModal）全部改用 `useTranslations()` 取文案；后台同理。Server Component 用 `getTranslations`。
- `messages/es.json` / `messages/zh.json` 用命名空间分组（`common` / `metadata` / `hero` / `search` / `discover` / `card` / `modal` / `admin.*` / `locale`）。Modal 里那几条占位（`defaultRequirements` 等）也放进 messages，作为字段为空时的本地化 fallback。
- `LocaleSwitcher`：客户端组件，写 `NEXT_LOCALE` cookie + `router.refresh()`。前台放在 SearchBar 右侧那排 pill 里；后台放顶栏。
- 扩展：加语言 = 加一个 `messages/xx.json` + 在 `locales` 数组里加一项。活动**内容**级多语言（标题/描述按 locale 存）= 后续，那会给 `Campaign` 加翻译字段或翻译表。

---

## 5. 认证

v1 不做。`/admin` 与 `/api/admin/*` 直接可访问。以后要加：`middleware.ts` 里加 cookie/Basic-Auth 校验或生产环境 404，数据层不受影响。

---

## 6. 环境变量

`.env.local`（本地）/ Vercel 项目设置（生产），并提交 `.env.example`：

```
# Supabase Postgres —— Vercel 上必须用 connection pooler(6543)，否则 serverless 会耗尽连接
DATABASE_URL="postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://...@...supabase.com:5432/postgres"      # prisma migrate 用
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."                                  # 仅服务端，签发上传 URL
SUPABASE_STORAGE_BUCKET="campaign-covers"
```

`schema.prisma`：`datasource db { url = env("DATABASE_URL"); directUrl = env("DIRECT_URL") }`。

---

## 7. 实施步骤（分阶段，每阶段独立可提交）

**Phase 0 · 基础设施**
1. 装依赖：`prisma @prisma/client @supabase/supabase-js zod react-hook-form @hookform/resolvers next-intl recharts`；`npx shadcn@latest init`。
2. 建 Supabase 项目 → 建 `campaign-covers` bucket（public）→ 复制连接串/keys → `.env.local` + `.env.example`。
3. `npx prisma init` → 写 `schema.prisma` → `npx prisma migrate dev --name init`。
4. 写 `prisma/seed.ts`：把现在 `data/campaigns.ts` 的 1+10+24 条 + Modal 里的 `defaultRequirements/defaultTopEarners/defaultResources` 灌进去（封面先用 Unsplash 外链；HERO/FEATURED/GRID 写进 `CampaignPlacement`）；`npx prisma db seed`。
5. 配 next-intl：`i18n/request.ts`、`messages/es.json`、`messages/zh.json`（先放一两个 key 占位）、root layout 包 provider。

**Phase 1 · 首页接库（外观不变）**
6. `lib/db.ts / queries.ts / format.ts / types.ts`。
7. `app/page.tsx` → `app/(site)/page.tsx`（server）+ 抽 `components/DiscoverClient.tsx`（client）。
8. 前台组件改 import；`SearchBar` 下拉/chip 用 Category/Platform 填充；`CampaignModal` 改吃真实字段（空则 fallback `defaultXxx`）。
9. 删 `data/campaigns.ts`。
10. 跑起来对比，确认一模一样。

**Phase 2 · 后台骨架**
11. `app/admin/layout.tsx`（侧边栏 + 顶栏 + `LocaleSwitcher`）。
12. 装常用 shadcn 组件：button / input / textarea / select / table / dialog / form / badge / switch / sonner / dropdown-menu / tabs。
13. `/admin/campaigns` 列表（先只读）；`es.json/zh.json` 补齐这一页的文案。

**Phase 3 · 活动 CRUD**
14. `lib/validators.ts`（zod，覆盖所有字段含 placements/requirements/earnings/topEarners/resources/viewsSeries）+ `lib/actions/campaigns.ts`。
15. 新建/编辑表单（react-hook-form，含上面所有可增减的子表单）。
16. `/api/admin/upload` + `components/admin/ImageUpload.tsx`。
17. 删除 + 确认弹窗；placements 增删 + slot 内排序（先数字输入）。
18. action 里 `revalidatePath('/')`，回前台验证生效。

**Phase 4 · 分类 & 平台管理**
19. `/admin/categories` CRUD + `lib/actions/categories.ts` + 排序 + 拒删保护。
20. `/admin/platforms` CRUD + `lib/actions/platforms.ts` + 同上。

**Phase 5 · 数据看板**
21. 统计 queries（`aggregate` / `groupBy`）。
22. `/admin` 看板：数字卡 + recharts 图 + 最近活动。

**Phase 6 · 部署**
23. Vercel：配环境变量、生产库 `prisma migrate deploy`、Supabase 生产 bucket。
24. README 补后台说明 + 部署步骤。

> 粗估：Phase 0–1 一天左右；Phase 2–3 两天上下；Phase 4–5 半天到一天；Phase 6 小半天。一个 Phase 一个 PR。

---

## 8. 路线图之外（参考文档里的大模块 — 不在 v1，但模型留好扩展位）

| 未来模块 | 大致依赖的新实体 | v1 已留的扩展位 |
|---|---|---|
| 用户体系 & 认证（创作者/品牌方/管理员注册登录、角色权限、操作日志） | `User`, `Account/Session`, `Role`, `AuditLog` | `/admin` 路由组、`middleware.ts` 入口已就位 |
| 创作者后台（绑社媒、加入 campaign、提交视频、收益、提现） | `Creator`, `SocialAccount`, `CampaignMembership`, `Submission`, `Wallet`, `Payout` | `Campaign.participants` 将来可由 `count(CampaignMembership)` 算；`raised` 由 `Submission` 聚合算 |
| 品牌方后台（建/审 campaign、效果分析、充值账单） | `Brand`, `BrandMember`, `Transaction`, `Invoice` | `Campaign.brand` 字符串 → 平滑迁 `brandId` 外键 |
| 平台管理：内容审核队列 / 反作弊风控 / 财务结算 / 工单仲裁 / 平台运营看板(DAU·GMV) | `ReviewItem`, `RiskFlag`, `Settlement`, `Ticket`, `Metric` 等 | 看板页 `/admin` 可扩展为多 tab |
| 平台多语言（前台 + 内容多语言） | `*_translations` 表 / 字段级 i18n | next-intl 已装，前台字符串迁进 `messages/` 即可；内容级 i18n 另设计 |

---

## 9. 还需你确认的少数点

1. **next-intl 用「无 i18n 路由」模式**（locale 存 cookie、URL 不变、界面里切换）—— 已按此实现。如果以后要 SEO 友好的 `/es/...`、`/zh/...` 路径，可以再切换到带前缀模式。
2. **`/admin/settings` 这页** v1 要不要？里面就放语言切换 + 一些只读配置。可以先不做，语言切换放顶栏就够。
3. **现有 seed 数据是英文占位文案**，但界面默认西语 —— 也就是现在打开会看到「西语界面 + 英文的演示活动」。要不要顺手把那批演示数据也翻成西语？（反正你之后会用真实数据替换，所以也可以不翻。）
4. **earnings 仍用 JSON 字段**（不建 `CampaignEarning` 表）—— 上一版默认如此；如果你更想要规范的表（表单里按平台一行行填）也行，说一声。

进度：i18n 基础（前台 + 后台框架，西语默认）正在落地中；DB 相关阶段需要你先建好 Supabase 项目并给连接串/keys。
