/*
 * GET /api/art?cursor=<opaque>
 *
 * NapLive's own artwork, read from the media timeline of x.com/Alfachri9 via
 * Nitter. Unlike the other sites' fan-art route this is the creator's own posts,
 * so there is no hashtag filter and no author/credit — just the image, a date,
 * and a link back to the original post. Reposts are dropped so the page shows
 * only their own work.
 *
 * The Nitter mechanics (instance pool, cursor pagination, 429 pacing, rebuilding
 * image URLs against pbs.twimg.com) are the same as the fan-art route and are
 * kept here verbatim because api/ files cannot import one another on Vercel.
 */

interface ArtRequest {
  query: Record<string, string | string[] | undefined>;
}

interface ArtResponse {
  status(code: number): ArtResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

/** The account whose media timeline this reads. */
const ACCOUNT = "Alfachri9";

/** Two instances that answer a profile media timeline with a cursor. */
const INSTANCES = ["https://nitter1.kabii.moe", "https://nitter.kabii.moe"] as const;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/** Hard ceiling on what one response may carry. */
const ART_LIMIT = 48;
const PAGES_ON_FIRST_LOAD = 3;
const PAGES_PER_MORE = 1;
const PAGE_GAP_MS = 350;
const PAGE_TIMEOUT_MS = 12000;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export interface Art {
  id: string;
  /** Canonical x.com post, built from the status id so it survives an instance change. */
  url: string;
  /** Twitter's own image host, not the Nitter proxy that will go away. */
  image: string;
  /** Same instant in WIB, matching the tweets route. Null when Nitter omits it. */
  postedLabel: string | null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Nitter proxies every image through its own host. `/pic/orig/` is preferred over
 * the <img src> because the latter is a small webp rendition; the URL is rebuilt
 * against Twitter's host, which outlives whichever instance is up today.
 */
function toTwitterImage(url: string): string | null {
  const m = url.match(/\/pic\/(?:orig\/)?media%2F([A-Za-z0-9_-]+)\.(jpg|jpeg|png|webp|gif)/i);
  return m ? `https://pbs.twimg.com/media/${m[1]}.${m[2]}` : null;
}
/**
 * "Oct 5, 2026 · 6:42 AM UTC" -> "5 Okt 2026, 13.42" (WIB). Null when neither the
 * title timestamp nor a full visible label is present.
 */
function toWib(title: string | null, label: string | null): string | null {
  const full = title?.match(/([A-Za-z]{3,4})\.? (\d{1,2}), (\d{4}) · (\d{1,2}):(\d{2})/);
  if (full) {
    const month = monthIndex(full[1]);
    if (month >= 0) {
      const hours = (Number(full[4]) + 7) % 24;
      return `${full[2]} ${MONTHS[month]} ${full[3]}, ${String(hours).padStart(2, "0")}.${full[5]}`;
    }
  }
  const short = label?.match(/^(\d{1,2}) ([A-Za-z]{3,4})\.? (\d{4})$/);
  if (short) {
    const month = monthIndex(short[2]);
    if (month >= 0) return `${short[1]} ${MONTHS[month]} ${short[3]}, 00.00`;
  }
  return null;
}

function monthIndex(name: string): number {
  const at = MONTHS.findIndex((m) => m.toLowerCase() === name.slice(0, 3).toLowerCase());
  return at >= 0 ? at : MONTHS.findIndex((m) => m.toLowerCase() === name.toLowerCase());
}

/**
 * One `.timeline-item` block from the profile media page. Reposts are skipped so
 * only the account's own artwork shows; an item with no media is skipped too.
 */
function parseItems(html: string): Art[] {
  const blocks =
    html.match(
      /<div class="timeline-item[\s\S]*?(?=<div class="timeline-item|<div class="show-more|$)/g,
    ) ?? [];

  const out: Art[] = [];

  for (const block of blocks) {
    if (/class="retweet-header"/.test(block)) continue;

    const link = block.match(/<a class="tweet-link" href="\/([^/"]+)\/status\/(\d{15,25})/);
    if (!link) continue;
    const [, author, id] = link;

    const source =
      block.match(/<a class="still-image" href="([^"]+)"/)?.[1] ??
      block.match(/<img[^>]+src="([^"]*media%2F[^"]+)"/i)?.[1];
    if (!source) continue;
    const image = toTwitterImage(decodeEntities(source));
    if (!image) continue;

    out.push({
      id,
      url: `https://x.com/${author}/status/${id}`,
      image,
      postedLabel: toWib(
        block.match(/<span class="tweet-date">[\s\S]*?title="([^"]+)"/)?.[1] ?? null,
        block.match(/<span class="tweet-date">[\s\S]*?<a[^>]*>([^<]+)<\/a>/)?.[1]?.trim() ?? null,
      ),
    });
  }

  return out;
}

/** The next page's cursor, read off the "load more" link. Handed back raw. */
function nextCursor(html: string): string | null {
  const m = html.match(/<div class="show-more">\s*<a href="([^"]*cursor=[^"]*)"/);
  if (!m) return null;
  const raw = m[1].replace(/&amp;/g, "&");
  const q = raw.slice(raw.indexOf("cursor=") + "cursor=".length);
  return q ? q.split("&")[0] : null;
}

/** One page of the media timeline, with one retry after a 429. */
async function fetchPage(instance: string, cursor: string | null): Promise<string | null> {
  const url =
    `${instance}/${ACCOUNT}/media` + (cursor ? `?cursor=${encodeURIComponent(cursor)}` : "");

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": UA },
        signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
      });
      if (response.status === 429 && attempt === 0) {
        const after = Number(response.headers.get("retry-after"));
        const waitMs =
          Number.isFinite(after) && after > 0 ? Math.min(after * 1000, 3000) : 1200;
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }
  return null;
}

export default async function handler(req: ArtRequest, res: ArtResponse) {
  const raw = req.query?.cursor;
  const cursor = typeof raw === "string" && raw.length > 0 && raw.length < 4000 ? raw : null;
  const budget = cursor ? PAGES_PER_MORE : PAGES_ON_FIRST_LOAD;

  const seen = new Map<string, Art>();
  let next: string | null = cursor;
  let servedBy: string | null = null;
  let pages = 0;

  for (const instance of INSTANCES) {
    seen.clear();
    next = cursor;
    pages = 0;

    for (let page = 0; page < budget; page++) {
      const html = await fetchPage(instance, next);
      if (html === null) break;

      let found = 0;
      for (const item of parseItems(html)) {
        if (seen.has(item.id)) continue;
        seen.set(item.id, item);
        found++;
      }
      pages++;
      if (pages === 1) servedBy = instance;

      next = nextCursor(html);
      if (found === 0 || !next) break;
      if (page < budget - 1) await new Promise((r) => setTimeout(r, PAGE_GAP_MS));
    }

    if (seen.size > 0) break;
  }

  const art = [...seen.values()].slice(0, ART_LIMIT);

  res.setHeader(
    "Cache-Control",
    art.length > 0
      ? cursor
        ? "public, s-maxage=600, stale-while-revalidate=1800"
        : "public, s-maxage=300, stale-while-revalidate=900"
      : "public, s-maxage=60",
  );

  res.status(200).json({
    reason: art.length > 0 ? "live" : "unavailable",
    profileUrl: `https://x.com/${ACCOUNT}/media`,
    servedBy,
    pagesRead: pages,
    nextCursor: art.length > 0 ? next : null,
    art,
  });
}