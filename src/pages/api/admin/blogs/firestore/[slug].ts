import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import type { APIResponse } from '@lib/types/helper';
import type { FirestoreBlog, UpdateBlogData } from '@lib/types/firestore-blog';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<FirestoreBlog | { content: string }>>
): Promise<void> {
  try {
    // Temporary: Skip authentication for testing
    // TODO: Implement proper authentication check

    const { slug } = req.query as { slug: string };

    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const blogRef = doc(db, 'blogs', slug);

    if (req.method === 'GET') {
      // Get blog content for editing
      const blogDoc = await getDoc(blogRef);
      
      if (!blogDoc.exists()) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      const blogData = blogDoc.data() as FirestoreBlog;
      
      return res.status(200).json({ content: blogData.content });
    }

    if (req.method === 'PUT') {
      // Update blog post
      const {
        title,
        description,
        tags,
        publishedAt,
        bannerAlt,
        bannerLink,
        content
      } = req.body;

      if (!title || !description || !content) {
        return res.status(400).json({ 
          message: 'Title, description, and content are required' 
        });
      }

      // Check if blog exists
      const blogDoc = await getDoc(blogRef);
      
      if (!blogDoc.exists()) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      const updateData: Record<string, any> = {
        title,
        description,
        content,
        tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
        publishedAt,
        bannerAlt: bannerAlt || '',
        bannerLink: bannerLink || '',
        updatedAt: serverTimestamp()
      };

      await updateDoc(blogRef, updateData);

      return res.status(200).json({ message: 'Blog post updated successfully' });
    }

    if (req.method === 'DELETE') {
      // Delete blog post
      const blogDoc = await getDoc(blogRef);
      
      if (!blogDoc.exists()) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      await deleteDoc(blogRef);
      
      return res.status(200).json({ message: 'Blog post deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Blog API error:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}
