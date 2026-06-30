import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "入坑必看",
  description: "新粉絲精選影片，從這裡開始認識黃禮志。",
  alternates: { canonical: "/starter" },
});

export default function StarterPage() {
  return null;
}
