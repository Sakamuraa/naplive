/**
 * Identity strings for NapLive, sourced from the real channels.
 *
 * NapLive runs three YouTube channels (NapKing = uploads, NapLive = livestream,
 * Nepnep = stream & clips) and posts art on X as @Alfachri9. The content lists
 * are NOT here; they come from /api/content at request time.
 */

export const site = {
  name: "NapLive",
  /** Name as it appears on the primary channel, verbatim. */
  channelTitle: "NapLive",
  /** Description as published by the creator (naplive7), trimmed of decoration. */
  bio: "Isinya gw livestream dah pokonya.",
  /** Real name and aliases, from the Lucupedia wiki (lucupedia.fandom.com). */
  realName: "Alfachri Gani",
  aka: "NapKing · Bang Al",
  born: "15 Oktober 2000",
  /** One-line about, used on the /tentang route. */
  about:
    "Content creator asal Indonesia yang dikenal lewat konten tantangan dari penonton dan gimik saat streaming.",
  /** Own subdomain, so origin and site URL are the same. Keep in sync with index.html. */
  url: "https://naplive.vtube-info.xyz",
  locale: "id_ID",
  avatar: "/media/avatar-youtube.webp",
  avatarAlt: "Avatar NapLive",
  /** Smaller crop used for the nav mark. */
  avatarSmall: "/media/avatar-x.webp",
  /** Shown under the "Channel" fact in the profile. */
  joined: "NapKing · NapLive · Nepnep",
} as const;

/**
 * Career timeline, from the Lucupedia wiki. Years are the channel creation
 * dates stated there.
 */
export const career = [
  { year: "2015", title: "JustNap", note: "Channel pertama — animasi pixel." },
  { year: "2018", title: "NapKing", note: "Konten lucu pendek; mulai dikenal." },
  { year: "2018", title: "NapLive", note: "Channel khusus livestream." },
  { year: "2022", title: "Nepnep", note: "Channel stream & klip." },
] as const;

/** Self-produced music, from the wiki (with Dying Prince). */
export const music = ["Legenda Birjon", "Sorry", "With U", "Health Potion"] as const;

/**
 * The three YouTube channels, in display order. `key` matches the content API's
 * channel keys; `streams` says whether that channel broadcasts (napking uploads
 * only). The /channel page and the footer read this list.
 */
export const youtubeChannels = [
  {
    key: "naplive",
    label: "NapLive",
    handle: "@naplive7",
    url: "https://www.youtube.com/@naplive7",
    note: "Livestream",
    streams: true,
  },
  {
    key: "napking",
    label: "NapKing",
    handle: "@napking7",
    url: "https://www.youtube.com/@napking7",
    note: "Upload utama",
    streams: false,
  },
  {
    key: "nepnep",
    label: "Nepnep",
    handle: "@nepnep7",
    url: "https://www.youtube.com/@nepnep7",
    note: "Stream & klip",
    streams: true,
  },
] as const;

export type ChannelKey = (typeof youtubeChannels)[number]["key"];

/**
 * The two primary links the shared components reference by name: `youtube`
 * points at the main channel (naplive7), `x` at the art/update account.
 */
export const channels = {
  youtube: {
    label: "YouTube",
    handle: "@naplive7",
    url: "https://www.youtube.com/@naplive7",
    note: "Livestream",
  },
  x: {
    label: "X",
    handle: "@Alfachri9",
    url: "https://x.com/Alfachri9",
    note: "Art & update",
  },
} as const;

/**
 * Route table. Owned here so nav and router cannot disagree.
 *
 * /konten is split by channel and, within a channel, by type. napking has no
 * streams, so it only has a video route. Clips is cross-channel.
 */
export const ROUTES = [
  "/",
  "/tentang",
  "/konten",
  "/konten/naplive/video",
  "/konten/nepnep",
  "/konten/nepnep/video",
  "/konten/napking/video",
  "/konten/clips",
  "/konten/tonton",
  "/tweets",
  "/media",
  "/channel",
] as const;

export type Route = (typeof ROUTES)[number];

/**
 * Colophon. A credit line naming who built the page.
 */
export const colophon = {
  credit: "Developed by Sakamura",
} as const;

/**
 * Nav links. Every href is a full route, tied to the Route union via `satisfies`.
 */
export const navigation = [
  { label: "Tentang", href: "/tentang" },
  { label: "Konten", href: "/konten" },
  { label: "Tweets", href: "/tweets" },
  { label: "Media", href: "/media" },
  { label: "Channel", href: "/channel" },
] as const satisfies ReadonlyArray<{ label: string; href: Route }>;