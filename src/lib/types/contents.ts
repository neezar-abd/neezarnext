import type { StaticImageData } from 'next/image';

export type Content = {
  tags: string | string[];
  slug: string;
  title: string;
  banner: StaticImageData | { src: string; height: number; width: number; };
  readTime: string;
  description: string;
  publishedAt: string;
  lastUpdatedAt?: string;
};

export type Blog = Content & {
  bannerAlt?: string;
  bannerLink?: string;
};

export type Project = Content & {
  link?: string;
  github?: string;
  youtube?: string;
  category?: string;
};

export type ContentType = 'blog' | 'projects';
