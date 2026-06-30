"use client";

import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { MAX_TAGS } from "@/lib/constants";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  hint?: string;
}

export function TagInput({ tags, onChange, placeholder, hint }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || tags.includes(tag) || tags.length >= MAX_TAGS) return;
    onChange([...tags, tag]);
    setInput("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "，") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] p-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            active
            onClick={() => onChange(tags.filter((t) => t !== tag))}
          >
            {tag} ×
          </Badge>
        ))}
        {tags.length < MAX_TAGS && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => input && addTag(input)}
            placeholder={placeholder}
            className="min-w-[80px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
          />
        )}
      </div>
      {hint && <p className="text-[10px] text-[var(--color-textSubtle)]">{hint}</p>}
    </div>
  );
}
