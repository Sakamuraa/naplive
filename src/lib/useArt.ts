import { useCallback, useEffect, useRef, useState } from "react";

export type Art = {
  id: string;
  url: string;
  image: string;
  postedLabel: string | null;
};

type Payload = {
  reason?: string;
  profileUrl?: string;
  art?: Art[];
  nextCursor?: string | null;
};

type State = {
  art: Art[];
  reason: "loading" | "live" | "unavailable";
  /** Where to send someone who wants the whole timeline rather than this page. */
  profileUrl: string;
  /** Opaque continuation. Null once the archive is exhausted. */
  nextCursor: string | null;
  loadingMore: boolean;
  /** How many items the first response carried (so appended ones skip the entrance). */
  initialCount: number;
};

export const ART_LIMIT = 48;
const MAX_ITEMS = 240;
const POLL_MS = 300_000;

/** Merge pages without duplicates. Nitter repeats the boundary item across pages. */
function merge(existing: Art[], incoming: Art[]): Art[] {
  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const item of incoming) byId.set(item.id, { ...byId.get(item.id), ...item });
  return [...byId.values()].slice(0, MAX_ITEMS);
}

/**
 * NapLive's own artwork from X, via /api/art. A long poll because art shows up
 * whenever it shows up, and the endpoint is edge-cached. A failed read keeps the
 * last good wall rather than blanking it. `loadMore` follows the cursor on demand.
 */
export function useArt(): State & { loadMore: () => void } {
  const [state, setState] = useState<State>({
    art: [],
    reason: "loading",
    profileUrl: "https://x.com/Alfachri9/media",
    nextCursor: null,
    loadingMore: false,
    initialCount: 0,
  });

  const cursorRef = useRef<string | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      try {
        const res = await fetch("/api/art", { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`api returned ${res.status}`);

        const payload = (await res.json()) as Payload;
        const list = Array.isArray(payload.art) ? payload.art.slice(0, ART_LIMIT) : [];

        cursorRef.current = payload.nextCursor ?? null;
        setState((prev) => ({
          art: list.length > 0 ? list : prev.art,
          reason: list.length > 0 ? "live" : "unavailable",
          profileUrl: payload.profileUrl ?? prev.profileUrl,
          nextCursor: payload.nextCursor ?? null,
          loadingMore: false,
          initialCount: prev.initialCount || list.length,
        }));
      } catch {
        if (controller.signal.aborted) return;
        setState((prev) => (prev.art.length > 0 ? prev : { ...prev, reason: "unavailable" }));
      }

      if (!controller.signal.aborted) timer = setTimeout(load, POLL_MS);
    }

    void load();

    return () => {
      if (timer) clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const loadMore = useCallback(() => {
    if (busyRef.current || !cursorRef.current) return;
    busyRef.current = true;
    const cursor = cursorRef.current;
    setState((prev) => ({ ...prev, loadingMore: true }));

    void (async () => {
      try {
        const res = await fetch(`/api/art?cursor=${encodeURIComponent(cursor)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`api returned ${res.status}`);
        const payload = (await res.json()) as Payload;
        const incoming = Array.isArray(payload.art) ? payload.art : [];

        cursorRef.current = payload.nextCursor ?? null;
        setState((prev) => ({
          ...prev,
          art: merge(prev.art, incoming),
          reason: prev.reason === "unavailable" && incoming.length > 0 ? "live" : prev.reason,
          nextCursor: payload.nextCursor ?? null,
          loadingMore: false,
        }));
      } catch {
        setState((prev) => ({ ...prev, loadingMore: false }));
      } finally {
        busyRef.current = false;
      }
    })();
  }, []);

  return { ...state, loadMore };
}
