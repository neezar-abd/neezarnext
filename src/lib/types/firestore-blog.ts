import { Timestamp } from 'firebase/firestore';

export interface FirestoreBlog {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  publishedAt: string;
  bannerAlt?: string;
  bannerLink?: string;
  slug: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateBlogData {
  title: string;
  description: string;
  content: string;
  tags: string[];
  publishedAt: string;
  bannerAlt?: string;
  bannerLink?: string;
  slug: string;
}

export interface UpdateBlogData extends Partial<CreateBlogData> {
  updatedAt: Timestamp;
}
