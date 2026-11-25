import { parseCarefully, type Tier } from "@/lib/llamaparse";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * "Read it more carefully": a PDF read again by LlamaParse, for layouts the
 * free reader gets wrong. It runs on the reader's own LlamaParse key, sent as
 * the bearer token and never stored.
 */
// Agentic scored 8.1/10 against cost_effective's 6.9 in scripts/pdf-eval, at $0.0125 a page against $0.0037.
const TIER: Tier = "agentic";
/** Vercel refuses request bodies over 4.5MB. */
const MAX_BYTES = 4_300_000;
const MAX_PAGES = 60;

export async function POST(req: Request) {
  const key = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!key) return Response.json({ error: "Reading carefully needs your LlamaParse key. Add it from the key button.", code: "need_key" }, { status: 401 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES + 10_000) return tooLarge();

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {}
  if (!file) return Response.json({ error: "Send the PDF as a file." }, { status: 400 });
  if (file.size > MAX_BYTES) return tooLarge();

  const result = await parseCarefully(file, { key, tier: TIER, maxPages: MAX_PAGES, signal: req.signal, deadlineMs: 270_000 });
  if (!result.ok) return Response.json({ error: result.error }, { status: 502 });
  return Response.json({ pages: result.pages, truncated: result.pages.length >= MAX_PAGES });
}

function tooLarge() {
  return Response.json({ error: "That PDF is over 4MB, too large to read carefully here." }, { status: 413 });
}
