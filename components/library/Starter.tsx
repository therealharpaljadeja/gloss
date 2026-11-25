"use client";

import { useState } from "react";
import { ArrowRight, Link2, Loader2 } from "lucide-react";
import { normalizeUrl } from "@/lib/links";
import { STARTER_PACK } from "@/lib/classics";
import { TOPIC } from "@/lib/library";
import { Glyph } from "./Book";
import { importFromUrl, keep } from "@/lib/import";
import { useStore } from "@/lib/store";
import type { AddTab } from "./AddPanel";

/**
 * Under a shelf that is still nearly empty: two ways to fill it. A dozen
 * Monad and Category Labs posts in one click, or links of your own.
 */
export function Starter({ count, onAdd }: { count: number; onAdd: (tab: AddTab) => void }) {
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [failed, setFailed] = useState(0);

  const shelvePack = async () => {
    const have = new Set(useStore.getState().library.map((x) => (x.sourceUrl ? normalizeUrl(x.sourceUrl) : "")));
    const todo = STARTER_PACK.filter((c) => !have.has(normalizeUrl(c.url)));
    if (!todo.length) return;
    setBusy({ done: 0, total: todo.length });
    setFailed(0);
    const next = async () => {
      for (let c = todo.shift(); c; c = todo.shift()) {
        const r = await importFromUrl(c.url);
        const err = r.ok ? await keep({ ...r.article, title: c.title, author: c.author, published: String(c.year) }, undefined, { topic: c.topic }) : r.error;
        if (err) setFailed((n) => n + 1);
        setBusy((b) => b && { ...b, done: b.done + 1 });
      }
    };
    await Promise.all([next(), next(), next()]);
    setBusy(null);
  };

  return (
    <section className="starter" aria-label="Fill your library">
      <div className="starter-card is-classics">
        <div className="starter-fan" aria-hidden>
          {STARTER_PACK.slice(0, 5).map((c, i) => (
            <span key={c.key} style={{ ["--i" as string]: i, background: TOPIC[c.topic].shades[2] }}>
              <Glyph k={c.topic} size={16} />
            </span>
          ))}
        </div>
        <div className="min-w-0">
          <p className="starter-title">{count ? "Add the Monad reading list" : "Start with the Monad reading list"}</p>
          <p className="starter-body">A dozen posts from Category Labs and Monad: MonadBFT, RaptorCast, the base fee, spam MEV and more.</p>
          <button type="button" onClick={shelvePack} disabled={Boolean(busy)} className="starter-btn">
            {busy ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Shelving {busy.done} of {busy.total}
              </>
            ) : (
              <>
                Shelve them <ArrowRight size={15} />
              </>
            )}
          </button>
          {failed > 0 && !busy && <p className="mt-2 text-[12.5px] text-ink-3">{failed} couldn&apos;t be read in just now. Try again later.</p>}
        </div>
      </div>
      <button type="button" className="starter-card" onClick={() => onAdd("links")}>
        <span className="starter-icon">
          <Link2 size={20} />
        </span>
        <span className="starter-title">Save your own links</span>
        <span className="starter-body">Paste one or many. Gloss reads each one in and sorts it onto a topic.</span>
      </button>
    </section>
  );
}
