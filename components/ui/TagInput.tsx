"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { MAX_TAGS } from "@/lib/constants";
import { addTag, hasTag, removeTag } from "@/lib/tags";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  hint?: string;
}

export function TagInput({ tags, onChange, placeholder, hint }: TagInputProps) {
  const [input, setInput] = useState("");
  const isComposingRef = useRef(false);
  const skipInputUpdateRef = useRef(false);

  const addTagFromInput = (raw: string) => {
    const tag = raw.trim();
    if (!tag || hasTag(tags, tag) || tags.length >= MAX_TAGS) return;
    onChange(addTag(tags, tag));
    skipInputUpdateRef.current = true;
    setInput("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "，") {
      if (e.nativeEvent.isComposing || isComposingRef.current || e.keyCode === 229) {
        return;
      }
      e.preventDefault();
      addTagFromInput(e.currentTarget.value);
      return;
    }

    if (e.key === "Backspace" && !e.currentTarget.value && tags.length > 0) {
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
            onClick={() => onChange(removeTag(tags, tag))}
          >
            {tag} ×
          </Badge>
        ))}
        {tags.length < MAX_TAGS && (
          <input
            type="text"
            value={input}
            onChange={(e) => {
              if (skipInputUpdateRef.current) {
                skipInputUpdateRef.current = false;
                return;
              }
              setInput(e.target.value);
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onKeyDown={onKeyDown}
            onBlur={(e) => {
              if (isComposingRef.current) return;
              const value = e.currentTarget.value.trim();
              if (value) addTagFromInput(value);
            }}
            placeholder={placeholder}
            className="min-w-[80px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
          />
        )}
      </div>
      {hint && <p className="text-[10px] text-[var(--color-textSubtle)]">{hint}</p>}
    </div>
  );
}
