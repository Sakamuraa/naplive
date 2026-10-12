import { Broadcast, PaintBrush } from "@phosphor-icons/react";

import { site, youtubeChannels } from "@/content/site";
import { Reveal, StaggerGroup, StaggerItem } from "@/lib/reveal";

/**
 * Profile section.
 *
 * `detail` promotes the heading to an h1 for the standalone /tentang route; on
 * the home page it is a section and the hero owns the h1. Copy is the creator's
 * own: the blockquote is the naplive7 channel description, verbatim. The facts
 * and the channel list are read from site config, nothing invented.
 */
export function Profile({ detail = false }: { detail?: boolean } = {}) {
  const Heading = detail ? "h1" : "h2";

  return (
    <section
      id={detail ? "isi-tentang" : "tentang"}
      aria-labelledby="profile-heading"
      className={detail ? "pb-24 pt-24 md:pb-32 md:pt-32" : "py-24 md:py-32"}
    >
      <div className="shell">
        {detail && (
          <Reveal amount={0.3}>
            <p className="text-sm font-medium text-accent">{site.channelTitle}</p>
            <Heading
              id="profile-heading"
              className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
            >
              Tentang NapLive
            </Heading>
            <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-fg-muted md:text-lg">
              Halaman ini mengumpulkan apa yang tertulis di channel dan X-nya, dan
              tidak lebih dari itu.
            </p>
          </Reveal>
        )}

        <div className={`grid gap-14 md:grid-cols-12 md:gap-12 ${detail ? "mt-16" : ""}`}>
          <Reveal className="md:col-span-5" amount={0.3}>
            {detail ? (
              <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Streamer
              </h2>
            ) : (
              <h2
                id="profile-heading"
                className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
              >
                Streamer
              </h2>
            )}

            <figure className="mt-8 border-l-2 border-amethyst pl-5">
              <Broadcast size={22} className="text-silvermist" aria-hidden="true" />
              <blockquote className="mt-3 font-display text-xl leading-relaxed">
                {site.bio}
              </blockquote>
              <figcaption className="mt-3 text-sm text-fg-subtle">
                Dari deskripsi channel YouTube, ditulis sendiri olehnya.
              </figcaption>
            </figure>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={0.08} amount={0.3}>
            <StaggerGroup className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
              <StaggerItem className="bg-surface p-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-subtle">
                  Bahasa
                </p>
                <p className="mt-2 text-sm leading-snug text-fg">Indonesia</p>
              </StaggerItem>
              <StaggerItem className="bg-surface p-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-subtle">
                  Isi
                </p>
                <p className="mt-2 text-sm leading-snug text-fg">Livestream &amp; art</p>
              </StaggerItem>
              <StaggerItem className="bg-surface p-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-subtle">
                  Channel
                </p>
                <p className="mt-2 text-sm leading-snug text-fg">{site.joined}</p>
              </StaggerItem>
            </StaggerGroup>

            <h3 className="mt-10 flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
              <PaintBrush size={22} className="text-silvermist" aria-hidden="true" />
              Channel YouTube
            </h3>
            <ul className="mt-6">
              {youtubeChannels.map((ch) => (
                <li
                  key={ch.key}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-4"
                >
                  <span className="font-medium text-fg">{ch.label}</span>
                  <span className="shrink-0 text-sm text-fg-subtle">
                    <span className="font-mono">{ch.handle}</span> · {ch.note}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
