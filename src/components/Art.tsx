import { ArrowSquareOut, ImageSquare, Spinner } from "@phosphor-icons/react";

import { ActionButton, ActionLink } from "@/components/Action";
import { Reveal } from "@/lib/reveal";
import { useArt } from "@/lib/useArt";
import type { Art as ArtItem } from "@/lib/useArt";

/**
 * Art.
 *
 * NapLive's own artwork, pulled from x.com/Alfachri9. Deliberately a different
 * layout from every other site here: no character credit, no hashtags, no
 * engagement row — a quiet image-first masonry where the work is the only thing
 * on the card. Each tile links back to the original post.
 */
export function Art() {
  const { art, reason, profileUrl, nextCursor, loadingMore, loadMore } = useArt();

  return (
    <section id="isi-art" aria-labelledby="art-heading" className="pt-24 pb-24 md:pt-32 md:pb-32">
      <div className="shell">
        <Reveal amount={0.3}>
          <p className="text-sm font-medium text-accent">Karya dari NapLive</p>
          <h1
            id="art-heading"
            className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
          >
            Art
          </h1>
          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-fg-muted md:text-lg">
            Kumpulan art yang diposting langsung di X. Klik salah satu untuk buka
            postingan aslinya.
          </p>
        </Reveal>

        {art.length > 0 ? (
          <>
            {/* Masonry via CSS columns: art comes in every aspect ratio, so the
                tiles keep their natural shape instead of being cropped square. */}
            <div className="mt-14 gap-4 [column-fill:_balance] columns-2 md:columns-3 lg:columns-4">
              {art.map((item) => (
                <ArtCard key={item.id} item={item} />
              ))}
            </div>

            {nextCursor && (
              <div className="mt-14 flex justify-center">
                <ActionButton
                  variant="quiet"
                  onClick={loadMore}
                  disabled={loadingMore}
                  aria-busy={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Spinner size={16} aria-hidden="true" className="animate-spin" />
                      Memuat…
                    </>
                  ) : (
                    "Muat lebih banyak"
                  )}
                </ActionButton>
              </div>
            )}
          </>
        ) : reason === "loading" ? (
          <p className="mt-14 flex items-center gap-2.5 text-sm text-fg-muted">
            <Spinner size={18} aria-hidden="true" className="animate-spin" />
            Mengambil art…
          </p>
        ) : (
          <div className="mt-14 max-w-[52ch]">
            <p className="flex items-center gap-2.5 text-sm leading-relaxed text-fg-muted">
              <ImageSquare size={20} aria-hidden="true" className="text-fg-subtle" />
              Art belum bisa dibaca dari server untuk sekarang.
            </p>
            <div className="mt-6">
              <ActionLink href={profileUrl} external variant="quiet">
                Buka di X
                <ArrowSquareOut size={16} aria-hidden="true" />
              </ActionLink>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * One piece. The image fills the tile at its own aspect ratio; the only chrome is
 * a small date that fades in on hover, so the wall reads as artwork and nothing
 * else. `break-inside-avoid` keeps a tile from splitting across two columns.
 */
function ArtCard({ item }: { item: ArtItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative mb-4 block break-inside-avoid overflow-hidden rounded-card border border-line bg-surface"
    >
      <img
        src={item.image}
        alt="Art oleh NapLive"
        loading="lazy"
        decoding="async"
        className="w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />
      {item.postedLabel && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {item.postedLabel}
        </span>
      )}
    </a>
  );
}
