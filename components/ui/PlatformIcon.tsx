interface PlatformIconProps {
  platform: string;
  className?: string;
}

export function PlatformIcon({ platform, className = "h-4 w-4" }: PlatformIconProps) {
  switch (platform) {
    case "youtube":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12 9.6 15.6Z"
          />
        </svg>
      );
    case "bilibili":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M7.2 4.4 5 6.6 3.4 5 2 6.4l1.6 1.6L2 9.6l1.4 1.4 1.6-1.6 2.2 2.2 1.4-1.4-2.2-2.2 2.2-2.2-1.4-1.4Zm9.6 0-1.4 1.4 2.2 2.2-2.2 2.2 1.4 1.4 2.2-2.2 1.6 1.6L22 9.6l-1.6-1.6L22 6.6l-1.4-1.4-1.6 1.6-2.2-2.2ZM4 10.8v8.4A1.8 1.8 0 0 0 5.8 21h12.4a1.8 1.8 0 0 0 1.8-1.8v-8.4H4Zm4.2 2.4h7.6v3.6H8.2v-3.6Z"
          />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
      );
  }
}
