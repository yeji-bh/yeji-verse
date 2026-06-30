import type { Video } from "@/lib/types";

export const mockVideos: Video[] = [
  {
    id: "1",
    title: "Yeji Vlog — A day in Seoul",
    description: "禮志在首爾的日常紀錄，從練習室到咖啡廳的溫柔一日。",
    category: "vlog",
    tags: ["日常", "首爾", "ITZY"],
    year: 2024,
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    siteViews: 1280,
    createdAt: "2024-06-15T10:00:00Z",
    sources: [
      {
        id: "1-yt",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        viewCount: 2450000,
        viewCountUpdatedAt: "2024-06-20T00:00:00Z",
      },
      {
        id: "1-bili",
        platform: "bilibili",
        url: "https://www.bilibili.com/video/BV1xx411c7mD",
        viewCount: 890000,
        viewCountUpdatedAt: "2024-06-20T00:00:00Z",
      },
    ],
  },
  {
    id: "2",
    title: "Kill This Love — Yeji Fancam",
    description: "經典舞台直拍，穩定輸出的表情管理與舞蹈實力。",
    category: "fancam",
    tags: ["直拍", "舞台", "4K"],
    year: 2023,
    thumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    siteViews: 3420,
    createdAt: "2023-11-08T14:30:00Z",
    sources: [
      {
        id: "2-yt",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        viewCount: 5200000,
        viewCountUpdatedAt: "2024-06-18T00:00:00Z",
      },
    ],
  },
  {
    id: "3",
    title: "Running Man Guest Appearance",
    description: "綜藝名場面合集，禮志的綜藝感與魅力全開。",
    category: "variety",
    tags: ["綜藝", "Running Man", "搞笑"],
    year: 2024,
    thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
    siteViews: 890,
    createdAt: "2024-03-22T09:00:00Z",
    sources: [
      {
        id: "3-yt",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        viewCount: 1200000,
        viewCountUpdatedAt: null,
      },
      {
        id: "3-bili",
        platform: "bilibili",
        url: "https://www.bilibili.com/video/BV1GJ411x7h7",
        viewCount: 450000,
        viewCountUpdatedAt: null,
      },
    ],
  },
  {
    id: "4",
    title: "Solo Stage — WANNABE",
    description: "個人舞台剪輯，展現獨特的舞台魅力。",
    category: "solo",
    tags: ["Solo", "WANNABE", "舞台"],
    year: 2022,
    thumbnail: "https://i.ytimg.com/vi/L_jWHffIx5E/hqdefault.jpg",
    siteViews: 2100,
    createdAt: "2022-08-17T16:00:00Z",
    sources: [
      {
        id: "4-yt",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=L_jWHffIx5E",
        viewCount: 3800000,
        viewCountUpdatedAt: "2024-06-15T00:00:00Z",
      },
    ],
  },
  {
    id: "5",
    title: "MAMA Awards Performance",
    description: "MAMA 頒獎典禮舞台完整版。",
    category: "stage",
    tags: ["MAMA", "頒獎典禮", "團體"],
    year: 2023,
    thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
    siteViews: 1560,
    createdAt: "2023-11-29T20:00:00Z",
    sources: [
      {
        id: "5-yt",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
        viewCount: 8900000,
        viewCountUpdatedAt: null,
      },
    ],
  },
  {
    id: "6",
    title: "Cover — 'Flowers' Acoustic",
    description: "禮志翻唱 acoustic 版本，溫柔嗓音詮釋。",
    category: "cover",
    tags: ["翻唱", "Acoustic", "Cover"],
    year: 2024,
    thumbnail: "https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg",
    siteViews: 4200,
    createdAt: "2024-01-10T12:00:00Z",
    sources: [
      {
        id: "6-yt",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=RgKAFK5djSk",
        viewCount: 670000,
        viewCountUpdatedAt: null,
      },
      {
        id: "6-bili",
        platform: "bilibili",
        url: "https://www.bilibili.com/video/BV1xx411c7mD",
        viewCount: null,
        viewCountUpdatedAt: null,
      },
    ],
  },
  {
    id: "7",
    title: "Behind the Scenes — UNTOUCHABLE MV",
    description: "MV 拍攝幕後花絮，一窺製作過程。",
    category: "behind",
    tags: ["幕後", "MV", "花絮"],
    year: 2024,
    thumbnail: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
    siteViews: 780,
    createdAt: "2024-05-01T08:00:00Z",
    sources: [
      {
        id: "7-yt",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        viewCount: 320000,
        viewCountUpdatedAt: null,
      },
    ],
  },
  {
    id: "8",
    title: "Weekly Idol — Dance Challenge",
    description: "週偶舞蹈挑戰環節，禮志的可愛反應。",
    category: "variety",
    tags: ["週偶", "舞蹈", "挑戰"],
    year: 2023,
    thumbnail: "https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg",
    siteViews: 1890,
    createdAt: "2023-09-14T11:00:00Z",
    sources: [
      {
        id: "8-bili",
        platform: "bilibili",
        url: "https://www.bilibili.com/video/BV1GJ411x7h7",
        viewCount: 210000,
        viewCountUpdatedAt: null,
      },
    ],
  },
];

export function getAllTags(videos: Video[]): string[] {
  const tagSet = new Set<string>();
  videos.forEach((v) => v.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getAllYears(videos: Video[]): number[] {
  const yearSet = new Set<number>();
  videos.forEach((v) => yearSet.add(v.year));
  return Array.from(yearSet).sort((a, b) => b - a);
}
