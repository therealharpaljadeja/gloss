"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** A button that opens a small panel. Closes on outside click and Escape. */
export function Popover({
  label,
  trigger,
  children,
  align = "right",
  width = 300,
  triggerClass = "",
  tip,
  openOn,
}: {
  label: string;
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  width?: number;
  triggerClass?: string;
  /** The trigger's tooltip; defaults to the label. */
  tip?: string;
  /** A window event that opens the panel from elsewhere on the page. */
  openOn?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  // Keep the panel on screen when the trigger sits away from the edge it is anchored to (narrow phones).
  // Measured from the trigger, not the panel: the panel is mid scale-in when this runs.
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const t = ref.current.getBoundingClientRect();
    const pad = 12;
    const w = Math.min(width, window.innerWidth - 2 * pad);
    const left = align === "right" ? t.right - w : t.left;
    const right = left + w;
    setShift(left < pad ? pad - left : right > window.innerWidth - pad ? window.innerWidth - pad - right : 0);
  }, [open, width, align]);

  useEffect(() => {
    if (!openOn) return;
    // On the next frame, so the click that sent the event does not count as an outside click.
    const show = () => requestAnimationFrame(() => setOpen(true));
    window.addEventListener(openOn, show);
    return () => window.removeEventListener(openOn, show);
  }, [openOn]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      // During a view transition the pointer lands on the root's snapshot, not on the page.
      if (e.target === document.documentElement && document.documentElement.classList.contains("theme-swap")) return;
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        data-tip={open ? undefined : tip ?? label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className={`${triggerClass} ${open ? "bg-sunk text-ink" : ""}`}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className={`pop absolute top-[calc(100%+8px)] z-[60] p-4 ${align === "right" ? "right-0" : "left-0"}`}
          style={{ width: `min(${width}px, calc(100vw - 24px))`, translate: shift ? `${shift}px 0` : undefined, ["--origin" as string]: align === "right" ? "top right" : "top left" }}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/** Every nav control: same height, same center line, same hover. */
export const barBtn =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full px-2.5 text-[13.5px] font-medium leading-none text-ink-2 transition-[background-color,color,transform] duration-150 hover:bg-sunk hover:text-ink active:scale-[0.94]";
