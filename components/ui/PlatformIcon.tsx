import Image from "next/image";

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
        <Image
          src="/bilibili.png"
          alt=""
          width={16}
          height={16}
          className={`${className} object-contain`}
          aria-hidden
          unoptimized
        />
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
      );
  }
}
