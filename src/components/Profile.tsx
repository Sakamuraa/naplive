import { Broadcast, MusicNotes, PaintBrush, UsersThree } from "@phosphor-icons/react";

import { career, music, site, youtubeChannels } from "@/content/site";
import { Reveal, StaggerGroup, StaggerItem } from "@/lib/reveal";

/**
 * Profile section.
 *
 * `detail` promotes the heading to an h1 for the standalone /tentang route; on
 * the home page it is a section and the hero owns the h1. The facts are the real
 * ones for Alfachri Gani (NapLive / Bang Al), sourced from the Lucupedia wiki
 * (lucupedia.fandom.com/id/wiki/Alfachri_Gani) — nothing invented. The music
 * chips are the original songs listed in content/site.ts, read off the
 * @naplive7 videos tab; covers are not part of that list.
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
              {site.about}
            </p>
          </Reveal>
        )}

        <div className={`grid gap-14 md:grid-cols-12 md:gap-12 ${detail ? "mt-16" : ""}`}>
          <Reveal className="md:col-span-5" amount={0.3}>
            {detail ? (
              <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                {site.realName}
              </h2>
            ) : (
              <h2
                id="profile-heading"
                className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
              >
                {site.realName}
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
                  Nama
                </p>
                <p className="mt-2 text-sm leading-snug text-fg">{site.realName}</p>
              </StaggerItem>
              <StaggerItem className="bg-surface p-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-subtle">
                  Lahir
                </p>
                <p className="mt-2 text-sm leading-snug text-fg">{site.born}</p>
              </StaggerItem>
              <StaggerItem className="bg-surface p-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-subtle">
                  Dikenal
                </p>
                <p className="mt-2 text-sm leading-snug text-fg">{site.aka}</p>
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
        <Reveal className="mt-24 md:mt-28" amount={0.2}>
          <div className="grid gap-14 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-5">
              <h3 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
                <UsersThree size={22} className="text-silvermist" aria-hidden="true" />
                Perjalanan
              </h3>
              <ul className="mt-6">
                {career.map((item, i) => (
                  <li
                    key={`${item.title}-${i}`}
                    className="flex items-baseline justify-between gap-4 border-b border-line py-4"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium text-fg">{item.title}</span>
                      <span className="mt-0.5 block text-sm text-fg-subtle">{item.note}</span>
                    </span>
                    <span className="shrink-0 font-mono text-sm text-fg-subtle">{item.year}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-6 md:col-start-7">
              <h3 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
                <MusicNotes size={22} className="text-silvermist" aria-hidden="true" />
                Musik &amp; seni
              </h3>
              <p className="mt-6 text-sm leading-relaxed text-fg-muted">
                Selain streaming, Bang Al bikin lagunya sendiri (bareng Dying Prince):
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {music.map((song) => (
                  <li
                    key={song.title}
                    className="inline-flex items-center gap-2 rounded-pill border border-line-strong px-3 py-1.5 text-sm font-medium text-fg"
                  >
                    {song.title}
                    {"note" in song && song.note && (
                      <span className="text-xs font-normal text-fg-subtle">{song.note}</span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-fg-muted">
                Dia juga suka menggambar lewat livestream mingguan{" "}
                <span className="font-medium text-fg">&ldquo;JumArt&rdquo;</span> tiap Jumat pagi,
                dan hasilnya dipajang di Instagram{" "}
                <a
                  href="https://instagram.com/nepnep.art"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono underline underline-offset-4 hover:text-fg"
                >
                  @nepnep.art
                </a>
                .
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
