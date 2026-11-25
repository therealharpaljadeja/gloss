import type { Metadata } from "next";
import { Reader } from "@/components/reader/Reader";

type Props = { params: Promise<{ id: string }> };

/** Texts live in the browser, so crawlers, who would only ever see "not on this device", are asked to pass them by. */
export const metadata: Metadata = { robots: { index: false } };

export default async function ReadPage({ params }: Props) {
  const { id } = await params;
  return <Reader id={id} initial={null} />;
}
