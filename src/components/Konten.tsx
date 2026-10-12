import { Broadcast, FilmSlate, Scissors } from "@phosphor-icons/react";
import { useState } from "react";

import { ActionLink } from "@/components/Action";
import { UpcomingCard } from "@/components/Upcoming";
import { Reveal, StaggerGroup, StaggerItem } from "@/lib/reveal";
import { ageLabel, useContent } from "@/lib/useContent";
import type { ChannelKey, ContentItem } from "@/lib/useContent";

/**
 * /konten is split by channel, and within a channel by type.
 *
 * NapLive runs three YouTube channels, and Sam asked that they not be mixed:
 * NapLive and Nepnep each broadcast (Streams + Video), NapKing is uploads-only
 * (Video). Clips is cross-channel, found by searching for the name. Each state is
 * its own route so a card can be linked, bookmarked and crawled.
 */
export type KontenView =
  | "naplive-streams"
  | "naplive-video"
  | "nepnep-streams"
  | "nepnep-video"
  | "napking-video"
  | "clips";

type ViewMeta = {
  channel: ChannelKey | null;
  type: "streams" | "video" | "clips";
  title: string;
  blurb: string;
  empty: string;
  icon: typeof Broadcast;
};

const VIEWS: Record<KontenView, ViewMeta> = {
  "naplive-streams": { channel: "naplive", type: "streams", title: "NapLive · Streams", blurb: "Livestream dari channel NapLive, terbaru lebih dulu. Klik untuk memutar.", empty: "Belum ada livestream NapLive yang terbaca.", icon: Broadcast },
  "naplive-video": { channel: "naplive", type: "video", title: "NapLive · Video", blurb: "Upload non-livestream dari channel NapLive.", empty: "Belum ada video NapLive.", icon: FilmSlate },
  "nepnep-streams": { channel: "nepnep", type: "streams", title: "Nepnep · Streams", blurb: "Livestream dari channel Nepnep, terbaru lebih dulu. Klik untuk memutar.", empty: "Belum ada livestream Nepnep.", icon: Broadcast },
  "nepnep-video": { channel: "nepnep", type: "video", title: "Nepnep · Video", blurb: "Upload non-livestream dari channel Nepnep.", empty: "Belum ada video Nepnep.", icon: FilmSlate },
  "napking-video": { channel: "napking", type: "video", title: "NapKing · Video", blurb: "Upload dari channel NapKing.", empty: "Belum ada video NapKing.", icon: FilmSlate },
  clips: { channel: null, type: "clips", title: "Clips", blurb: "Konten dari channel lain yang menyebut NapLive, lewat judul atau deskripsi.", empty: "Belum ada klip yang menyebut namanya.", icon: Scissors },
};

/** Top-level channel tabs. `streams` is null for the uploads-only channel. */
const TABS = [
  { key: "naplive", label: "NapLive", streams: "/konten", video: "/konten/naplive/video" },
  { key: "nepnep", label: "Nepnep", streams: "/konten/nepnep", video: "/konten/nepnep/video" },
  { key: "napking", label: "NapKing", streams: null, video: "/konten/napking/video" },
] as const;

const CLIPS_PATH = "/konten/clips";

const TAB_BASE =
  "inline-flex min-h-11 items-center gap-2 rounded-btn px-4 py-2 text-sm font-medium transition-colors duration-200";
const TAB_ON = "bg-obsidian text-bg";
const TAB_OFF = "text-fg-muted hover:bg-surface hover:text-fg";
export function Konten({ view = "naplive-streams" }: { view?: KontenView }) {
  const { channels, clips, live, upcoming, source } = useContent();
  const meta = VIEWS[view];

  const list: ContentItem[] =
    meta.channel === null
      ? clips
      : meta.type === "streams"
        ? channels[meta.channel].streams
        : channels[meta.channel].videos;

  const activeTab = TABS.find((t) => t.key === meta.channel) ?? null;

  return (
    <section id="isi-konten" aria-labelledby="konten-heading" className="py-24 md:py-32">
      <div className="shell">
        <Reveal amount={0.3}>
          <h1
            id="konten-heading"
            className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
          >
            {meta.title}
          </h1>
          <p className="mt-5 flex items-center gap-2.5 text-base leading-relaxed text-fg-muted md:text-lg">
            <meta.icon size={20} aria-hidden="true" className="shrink-0 text-fg-subtle" />
            {meta.blurb}
          </p>
        </Reveal>

        {/* Channel row. Each channel links to its primary view (streams for the
            two that broadcast, video for the uploads-only one); Clips is its own
            cross-channel entry. */}
        <Reveal amount={0.2} delay={0.05}>
          <nav
            aria-label="Channel"
            className="mt-12 flex flex-wrap items-center gap-2 border-b border-line pb-4"
          >
            {TABS.map((tab) => {
              const selected = meta.channel === tab.key;
              return (
                <a
                  key={tab.key}
                  href={tab.streams ?? tab.video}
                  aria-current={selected ? "page" : undefined}
                  className={`${TAB_BASE} ${selected ? TAB_ON : TAB_OFF}`}
                >
                  {tab.label}
                </a>
              );
            })}
            <a
              href={CLIPS_PATH}
              aria-current={view === "clips" ? "page" : undefined}
              className={`${TAB_BASE} ${view === "clips" ? TAB_ON : TAB_OFF}`}
            >
              Clips
            </a>
          </nav>
        </Reveal>

        {/* Type sub-row, only for a channel that has both streams and video. */}
        {activeTab && activeTab.streams ? (
          <nav aria-label="Jenis" className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={activeTab.streams}
              aria-current={meta.type === "streams" ? "page" : undefined}
              className={`${TAB_BASE} ${meta.type === "streams" ? TAB_ON : TAB_OFF}`}
            >
              Streams
            </a>
            <a
              href={activeTab.video}
              aria-current={meta.type === "video" ? "page" : undefined}
              className={`${TAB_BASE} ${meta.type === "video" ? TAB_ON : TAB_OFF}`}
            >
              Video
            </a>
          </nav>
        ) : null}
        <div className="mt-10">
          {meta.type === "streams" && <UpcomingCard item={upcoming} />}
          {list.length > 0 ? (
            <StaggerGroup
              key={view}
              className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3"
              stagger={0.04}
              amount={0.06}
            >
              {list.map((item) => (
                <StaggerItem key={item.videoId} className="min-w-0">
                  <ContentCard item={item} type={meta.type} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          ) : (
            <p className="mt-8 max-w-[52ch] text-sm leading-relaxed text-fg-subtle">
              {meta.empty}
              {source === "loading" ? " Sedang diambil." : ""}
            </p>
          )}

          <p className="mt-12 flex items-center gap-2 text-xs text-fg-subtle">
            <Broadcast size={14} aria-hidden="true" />
            {source === "api"
              ? live
                ? "Ada yang sedang live. Daftar disegarkan tiap menit selama itu berjalan."
                : "Dibaca langsung dari YouTube saat halaman dibuka."
              : source === "loading"
                ? "Mengambil data terbaru."
                : "Menampilkan salinan tersimpan. Data langsung tidak tersedia."}
          </p>

          {live && meta.type !== "streams" ? (
            <div className="mt-8">
              <ActionLink href="/konten" variant="quiet" size="md">
                Lihat yang sedang live
              </ActionLink>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * One content card. A stream links to the player page on this site; video and
 * clips go straight to YouTube.
 */
function ContentCard({ item, type }: { item: ContentItem; type: "streams" | "video" | "clips" }) {
  const label = ageLabel(item);
  const href = type === "streams" ? `/konten/tonton?id=${item.videoId}` : item.url;
  const external = type !== "streams";

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-card border border-line bg-surface">
        <CardThumb item={item} />
        {item.live && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-pill bg-obsidian px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-bg">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-bg opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-bg" />
            </span>
            Live
          </span>
        )}
      </div>

      <p className="mt-3.5 font-display text-base font-medium leading-snug tracking-tight text-fg wrap-anywhere">
        {item.title}
      </p>

      <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-fg-subtle">
        {item.channel && <span className="truncate">{item.channel}</span>}
        {item.channel && (label || item.duration) ? <span aria-hidden="true">·</span> : null}
        {item.duration && <span className="font-mono">{item.duration}</span>}
        {label && (
          <>
            {item.duration ? <span aria-hidden="true">·</span> : null}
            <span>{label}</span>
          </>
        )}
      </p>
    </a>
  );
}

/** Thumbnail with a fallback chain: endpoint image, then maxres, then hq. */
function CardThumb({ item }: { item: ContentItem }) {
  const [step, setStep] = useState(0);

  const sources = [
    item.thumbnail,
    `https://i.ytimg.com/vi/${item.videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
  ].filter(Boolean);

  const src = sources[Math.min(step, sources.length - 1)] ?? "";

  return (
    <img
      key={src}
      src={src}
      alt=""
      width={1280}
      height={720}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (step < sources.length - 1) setStep(step + 1);
      }}
      className="aspect-video w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
    />
  );
}