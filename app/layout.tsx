import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Inter, JetBrains_Mono, Literata, Newsreader } from "next/font/google";
import { BOOT_SCRIPT } from "@/lib/settings";
import "./globals.css";
import { Tooltips } from "@/components/ui/Tooltips";
import { OG_IMAGE, SITE_URL } from "@/lib/brand";

const serif = Newsreader({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--nf-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--nf-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--nf-mono",
  display: "swap",
  preload: false,
});

// Optional reading faces: declared here, fetched only when a reader picks them.
const book = Literata({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--nf-book",
  display: "swap",
  preload: false,
});

const legible = Atkinson_Hyperlegible_Next({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--nf-legible",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

const DESCRIPTION = "Highlight any line and ask it anything. An open model writes the answer in the margin, beside the words, citing the paragraphs it used.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Gloss", template: "%s" },
  description: DESCRIPTION,
  applicationName: "Gloss",
  openGraph: { type: "website", siteName: "Gloss", title: "Gloss", description: DESCRIPTION, url: "/", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: "Gloss", description: DESCRIPTION, images: [OG_IMAGE.url] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfdfc" },
    { media: "(prefers-color-scheme: dark)", color: "#111110" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable} ${book.variable} ${legible.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        {children}
        <Tooltips />
      </body>
    </html>
  );
}
