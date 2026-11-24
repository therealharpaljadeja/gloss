import { BRAND } from "@/lib/brand";

/** Fortytwo, the inference provider: linked and recessed beside the app's mark. */
export function FortytwoLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={BRAND.providerUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fortytwo"
      data-tip="Models served by Fortytwo"
      className={`flex h-9 shrink-0 items-center gap-1.5 rounded-md text-[14px] font-medium text-ink-3 transition-colors duration-150 hover:text-ink ${className}`}
    >
      <span className="hidden min-[860px]:inline">Fortytwo</span>
      <span className="min-[860px]:hidden">42</span>
    </a>
  );
}
