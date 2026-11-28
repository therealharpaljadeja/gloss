import katex from "katex";

const cache = new Map<string, string>();

/** Pages write \text{gas_limit}; in KaTeX's text mode an underscore must be escaped. */
const escapeTextUnderscores = (tex: string) =>
  tex.replace(/\\(text[a-z]*)\s*\{([^{}]*)\}/g, (_, cmd: string, body: string) => `\\${cmd}{${body.replace(/(?<!\\)_/g, "\\_")}}`);

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** A formula as KaTeX HTML. Untrusted input: no \href, \includegraphics or other trusted commands. */
export function texToHtml(tex: string, display: boolean): string {
  const key = `${display ? "d" : "i"}${tex}`;
  let html = cache.get(key);
  if (html === undefined) {
    try {
      html = katex.renderToString(escapeTextUnderscores(tex), { displayMode: display, output: "html", throwOnError: false, strict: "ignore", trust: false, maxSize: 20, maxExpand: 500 });
    } catch {
      html = `<code>${escapeHtml(tex)}</code>`;
    }
    cache.set(key, html);
  }
  return html;
}
