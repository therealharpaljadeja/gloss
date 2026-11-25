/**
 * Fortytwo client. Server-side only. Raw fetch, OpenAI-compatible SSE.
 *
 * Kept on purpose:
 * 1. A named User-Agent, so requests are identifiable.
 * 2. stream_options.include_usage, so the cost receipt is real, not a guess.
 * 3. Errors come back as JSON: surface error.message, not the raw body.
 * 4. reasoning_effort:"none" keeps reasoners from spending the budget thinking.
 */

export const FORTYTWO_API = "https://api.fortytwo.network/v1";
export const FORTYTWO_URL = `${FORTYTWO_API}/chat/completions`;
export const APP_UA = "Gloss/0.1";

import { MODELS, costFor, type ModelEntry, type ModelKey, type StreamEvent, type Usage } from "./models";

export { MODELS, DEFAULT_MODEL, isModelKey, costFor } from "./models";
export type { ModelKey, StreamEvent, Usage } from "./models";

export type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };
export type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; content: string; tool_call_id: string };

type Chunk = {
  choices?: { delta?: { content?: string; reasoning?: string; reasoning_content?: string; tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[] } }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number };
  };
};

function errorMessage(status: number, body: string): string {
  let msg = body.slice(0, 280);
  try {
    const j = JSON.parse(body) as { error?: { message?: string } | string; message?: string };
    if (typeof j.error === "string") msg = j.error;
    else if (j.error?.message) msg = j.error.message;
    else if (j.message) msg = j.message;
  } catch {
    /* not JSON */
  }
  if (status === 401) return "Fortytwo rejected that API key. Check it and try again.";
  if (status === 402) return "This Fortytwo key is out of credits. Top it up, or use another key.";
  if (status === 429) return "Fortytwo is rate limiting this key. Wait a moment, or use your own key.";
  return `Fortytwo API ${status}: ${msg}`;
}

export async function* streamChat(req: {
  messages: ChatMessage[];
  model: ModelKey;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
  /** Tools the model may call; a call ends the stream with a "tool" event instead of an answer. */
  tools?: readonly unknown[];
  /** "none" sends the tools (a conversation that already used one needs them) but asks for an answer. */
  toolChoice?: "auto" | "none";
}): AsyncGenerator<StreamEvent> {
  const model: ModelEntry = MODELS[req.model];
  const apiKey = req.apiKey?.trim();
  if (!apiKey) {
    yield { type: "error", text: "Add your Fortytwo API key to start." };
    return;
  }

  yield { type: "meta", model: model.label };

  let res: Response;
  try {
    res = await fetch(FORTYTWO_URL, {
      method: "POST",
      signal: req.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": APP_UA,
      },
      body: JSON.stringify({
        model: model.id,
        stream: true,
        stream_options: { include_usage: true },
        temperature: req.temperature ?? 0.4,
        max_tokens: req.maxTokens ?? 900,
        reasoning_effort: "none",
        messages: req.messages,
        ...(req.tools ? { tools: req.tools, tool_choice: req.toolChoice ?? "auto" } : {}),
      }),
    });
  } catch (e) {
    if (req.signal?.aborted) return;
    yield { type: "error", text: `Could not reach Fortytwo: ${String(e)}` };
    return;
  }

  if (!res.ok || !res.body) {
    yield { type: "error", text: errorMessage(res.status, await res.text().catch(() => "")) };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sawContent = false;
  let sawReasoning = false;
  // A tool call arrives in pieces, by index: its id and name once, its arguments in fragments.
  const calls: { id: string; name: string; args: string }[] = [];

  const finish = (): StreamEvent => {
    if (calls[0]?.name) return { type: "tool", id: calls[0].id || "call_0", name: calls[0].name, args: calls[0].args };
    return !sawContent && sawReasoning ? { type: "error", text: `${model.label} answered only in its reasoning. Try again.` } : { type: "done" };
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") {
        yield finish();
        return;
      }
      let chunk: Chunk;
      try {
        chunk = JSON.parse(payload);
      } catch {
        continue;
      }
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.reasoning || delta?.reasoning_content) sawReasoning = true;
      for (const tc of delta?.tool_calls ?? []) {
        const c = (calls[tc.index] ??= { id: "", name: "", args: "" });
        if (tc.id) c.id = tc.id;
        if (tc.function?.name) c.name += tc.function.name;
        if (tc.function?.arguments) c.args += tc.function.arguments;
      }
      if (delta?.content) {
        sawContent = true;
        yield { type: "content", text: delta.content };
      }
      if (chunk.usage && typeof chunk.usage.completion_tokens === "number") {
        const pt = chunk.usage.prompt_tokens ?? 0;
        const cached = chunk.usage.prompt_tokens_details?.cached_tokens ?? 0;
        const ct = chunk.usage.completion_tokens ?? 0;
        yield {
          type: "usage",
          usage: { promptTokens: pt, cachedTokens: cached, completionTokens: ct, costUsd: costFor(req.model, pt, cached, ct) },
        };
      }
    }
  }
  yield finish();
}

/** Non-streaming JSON completion, for structured output like the brief. */
export async function completeJSON<T>(req: {
  messages: ChatMessage[];
  model: ModelKey;
  apiKey?: string;
  maxTokens?: number;
  signal?: AbortSignal;
  /** Let the model reason before it answers, for checking a text against itself. Its thinking spends from maxTokens. */
  thinking?: boolean;
}): Promise<{ ok: true; data: T; usage: Usage } | { ok: false; error: string }> {
  const model: ModelEntry = MODELS[req.model];
  const apiKey = req.apiKey?.trim();
  if (!apiKey) return { ok: false, error: "Add your Fortytwo API key to start." };

  let res: Response;
  try {
    res = await fetch(FORTYTWO_URL, {
      method: "POST",
      signal: req.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "User-Agent": APP_UA },
      body: JSON.stringify({
        model: model.id,
        temperature: 0.3,
        max_tokens: req.maxTokens ?? 1400,
        reasoning_effort: req.thinking ? "low" : "none",
        // Fortytwo returns an upstream 502 for json_object combined with reasoning; the prompt asks for JSON and the
        // reply is cut to its outermost braces below, so thinking calls go without it.
        ...(req.thinking ? {} : { response_format: { type: "json_object" } }),
        messages: req.messages,
      }),
    });
  } catch (e) {
    return { ok: false, error: `Could not reach Fortytwo: ${String(e)}` };
  }
  const body = await res.text();
  if (!res.ok) return { ok: false, error: errorMessage(res.status, body) };

  try {
    const j = JSON.parse(body) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } };
    };
    const raw = j.choices?.[0]?.message?.content ?? "";
    const jsonText = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const data = JSON.parse(jsonText) as T;
    const pt = j.usage?.prompt_tokens ?? 0;
    const cached = j.usage?.prompt_tokens_details?.cached_tokens ?? 0;
    const ct = j.usage?.completion_tokens ?? 0;
    return { ok: true, data, usage: { promptTokens: pt, cachedTokens: cached, completionTokens: ct, costUsd: costFor(req.model, pt, cached, ct) } };
  } catch {
    return { ok: false, error: "The model returned something that was not valid JSON. Try again." };
  }
}

/** The reader's own key, from the body or an Authorization header. Keys live in the browser; the server keeps none. */
export function keyFrom(req: Request, body?: { apiKey?: string }): string | undefined {
  return body?.apiKey?.trim() || req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim() || undefined;
}

/** The JSON a route answers with when the reader has not added their Fortytwo key. */
export function needKey(message = "Add your Fortytwo API key to start. It stays in this browser."): Response {
  return Response.json({ error: message, code: "need_key" }, { status: 401 });
}
