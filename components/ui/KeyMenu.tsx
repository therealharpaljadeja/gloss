"use client";

import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { KEY_STORAGE, readKey, validateKey, type KeyName } from "@/lib/ask";
import { BRAND } from "@/lib/brand";
import { Popover, barBtn } from "./Popover";

type Keys = Record<KeyName, string>;

const FIELDS: { name: KeyName; label: string; note: string; placeholder: string; href: string; link: string }[] = [
  { name: "fortytwo", label: "Fortytwo", note: "Required. Every answer, brief and scanned page runs on it.", placeholder: "Fortytwo API key", href: BRAND.keysUrl, link: "Get a key" },
  { name: "exa", label: "Exa", note: "Optional. Lets answers search the web.", placeholder: "Exa API key", href: "https://dashboard.exa.ai/api-keys", link: "Get a key" },
  { name: "llama", label: "LlamaParse", note: "Optional. Reads hard PDFs again, more carefully.", placeholder: "LlamaParse API key", href: "https://cloud.llamaindex.ai/api-key", link: "Get a key" },
];

const readAll = (): Keys => ({ fortytwo: readKey("fortytwo"), exa: readKey("exa"), llama: readKey("llama") });

function store(name: KeyName, v: string) {
  try {
    if (v) localStorage.setItem(KEY_STORAGE[name], v);
    else localStorage.removeItem(KEY_STORAGE[name]);
  } catch {}
}

/** The reader's own keys: Fortytwo to use the app, Exa and LlamaParse if they want them. Stored in this browser only. */
export function KeyMenu() {
  const [keys, setKeys] = useState<Keys>({ fortytwo: "", exa: "", llama: "" });
  useEffect(() => setKeys(readAll()), []);
  const ready = Boolean(keys.fortytwo);

  return (
    <Popover
      label="API keys"
      tip={ready ? "Your API keys" : "Add your Fortytwo key"}
      width={340}
      triggerClass={barBtn}
      openOn="gloss:key"
      trigger={
        <>
          <KeyRound size={15} aria-hidden />
          {!ready && <span className="hidden sm:inline">Add a key</span>}
        </>
      }
    >
      {(close) => <KeyPanel current={keys} onSave={setKeys} close={close} />}
    </Popover>
  );
}

function KeyPanel({ current, onSave, close }: { current: Keys; onSave: (k: Keys) => void; close: () => void }) {
  const [draft, setDraft] = useState<Keys>(current);
  const [state, setState] = useState<"idle" | "checking" | "bad">("idle");

  const save = async () => {
    const next: Keys = { fortytwo: draft.fortytwo.trim(), exa: draft.exa.trim(), llama: draft.llama.trim() };
    if (next.fortytwo && next.fortytwo !== current.fortytwo) {
      setState("checking");
      if (!(await validateKey(next.fortytwo))) return setState("bad");
    }
    for (const f of FIELDS) store(f.name, next[f.name]);
    onSave(next);
    window.dispatchEvent(new Event("gloss:keys"));
    close();
  };

  return (
    <div>
      <p className="text-[13.5px] font-medium text-ink">Your API keys</p>
      <p className="mt-1 text-[12.5px] leading-snug text-ink-3">Gloss runs on your own keys, with no limits of its own.</p>
      <div className="mt-3 space-y-3">
        {FIELDS.map((f, i) => (
          <label key={f.name} className="block">
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-[12.5px] font-medium text-ink-2">{f.label}</span>
              <a href={f.href} target="_blank" rel="noopener noreferrer" className="text-[11.5px] text-rubric-text underline decoration-rule-strong underline-offset-4">
                {f.link}
              </a>
            </span>
            <input
              autoFocus={i === 0}
              type="password"
              value={draft[f.name]}
              onChange={(e) => {
                setDraft((d) => ({ ...d, [f.name]: e.target.value }));
                if (f.name === "fortytwo") setState("idle");
              }}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder={f.placeholder}
              autoComplete="off"
              spellCheck={false}
              aria-label={`${f.label} API key`}
              className="mt-1 h-9 w-full rounded-lg border border-rule bg-bg px-3 text-[13px] tracking-wide text-ink outline-none focus-visible:outline-none placeholder:text-ink-4 focus:border-rule-strong"
            />
            <span className="mt-1 block text-[11.5px] leading-snug text-ink-4">{f.note}</span>
          </label>
        ))}
      </div>
      {state === "bad" && <p className="mt-2 text-[12.5px] text-rubric-text">Fortytwo rejected that key. Check it and try again.</p>}
      <p className="mt-3 text-[11.5px] leading-snug text-ink-4">Sent with your requests only. Stored in this browser, never on a server, never logged.</p>
      <div className="mt-3 flex justify-end gap-1.5">
        {(current.fortytwo || current.exa || current.llama) && (
          <button
            type="button"
            onClick={() => {
              for (const f of FIELDS) store(f.name, "");
              setDraft({ fortytwo: "", exa: "", llama: "" });
              onSave({ fortytwo: "", exa: "", llama: "" });
            }}
            className="h-8 rounded-lg px-3 text-[12.5px] font-medium text-ink-2 hover:bg-sunk"
          >
            Clear all
          </button>
        )}
        <button type="button" onClick={save} disabled={state === "checking"} className="h-8 rounded-lg bg-ink px-3.5 text-[12.5px] font-medium text-bg disabled:opacity-60">
          {state === "checking" ? "Checking" : "Save"}
        </button>
      </div>
    </div>
  );
}
