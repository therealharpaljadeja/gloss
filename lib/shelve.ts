/**
 * Sorting a text onto the library's shelves, on the server: one small call
 * to the fast model with the title and the opening, which picks a topic from
 * the fixed list, and a few tags. Never in the
 * way of an import: a failure leaves the text in Unsorted.
 */

import { cleanTags, TOPICS, topicOf, type Shelving } from "./library";
import { EXCERPT_CHARS } from "./excerpt";
import { completeJSON, DEFAULT_MODEL } from "./fortytwo";

export type ShelveInput = { title: string; author?: string; source?: string; dek?: string; excerpt?: string };

const SYSTEM = `You shelve texts in a reader's personal library.

Pick the one topic that fits best, by its key:
${TOPICS.filter((t) => t.key !== "unsorted")
  .map((t) => `- ${t.key}: ${t.hint}`)
  .join("\n")}

Then up to 3 tags: short lowercase words or phrases that say what the text is about, more specific than the topic (e.g. "speculative decoding", "hiring", "stoicism").

Reply with JSON only: {"topic": "<key>", "tags": ["..."]}`;

export async function classify(
  input: ShelveInput,
  opts: { apiKey?: string; signal?: AbortSignal } = {}
): Promise<{ ok: true; shelving: Shelving; usd: number } | { ok: false; error: string }> {
  const lines = [
    `Title: ${input.title}`,
    input.author && `Author: ${input.author}`,
    input.source && `Source: ${input.source}`,
    input.dek && `Summary: ${input.dek}`,
    input.excerpt && `Opening:\n${input.excerpt.slice(0, EXCERPT_CHARS)}`,
  ].filter(Boolean);
  const r = await completeJSON<{ topic?: unknown; tags?: unknown }>({
    model: DEFAULT_MODEL,
    apiKey: opts.apiKey,
    signal: opts.signal,
    maxTokens: 220,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: lines.join("\n") },
    ],
  });
  if (!r.ok) return r;
  const topic = topicOf(r.data.topic);
  return { ok: true, shelving: { topic, tags: cleanTags(r.data.tags, topic) }, usd: r.usage.costUsd };
}
