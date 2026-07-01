import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Checklist",
  description: "你標記為已看的黃禮志影片清單。",
  alternates: { canonical: "/checklist" },
});

export default function ChecklistPage() {
  return null;
}
