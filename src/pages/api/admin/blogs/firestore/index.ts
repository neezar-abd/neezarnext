import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import type { APIResponse } from '@lib/types/helper';
import type { FirestoreBlog, CreateBlogData } from '@lib/types/firestore-blog';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<FirestoreBlog | FirestoreBlog[]>>
): Promise<void> {
  try {
    // Temporary: Skip authentication for testing
    // TODO: Implement proper authentication check

    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    if (req.method === 'GET') {
      // Get all blog posts
      const blogsRef = collection(db, 'blogs');
      const q = query(blogsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const blogs: FirestoreBlog[] = [];
      querySnapshot.forEach((doc) => {
        blogs.push({
          id: doc.id,
          ...doc.data()
        } as FirestoreBlog);
      });

      return res.status(200).json(blogs);
    }

    if (req.method === 'POST') {
      // Create new blog post
      const {
        title,
        description,
        content,
        tags,
        publishedAt,
        bannerAlt,
        bannerLink,
        slug
      } = req.body as CreateBlogData;

      if (!title || !description || !content || !slug) {
        return res.status(400).json({ 
          message: 'Title, description, content, and slug are required' 
        });
      }

      // Check if slug already exists
      const existingBlogRef = doc(db, 'blogs', slug);
      const existingBlogDoc = await getDocs(query(collection(db, 'blogs')));
      
      let slugExists = false;
      existingBlogDoc.forEach((doc) => {
        if (doc.id === slug) {
          slugExists = true;
        }
      });

      if (slugExists) {
        return res.status(409).json({ message: 'A blog post with this slug already exists' });
      }

      const blogData: Record<string, any> = {
        title,
        description,
        content,
        tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
        publishedAt,
        bannerAlt: bannerAlt || '',
        bannerLink: bannerLink || '',
        slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Use the slug as the document ID
      const blogRef = doc(db, 'blogs', slug);
      await addDoc(collection(db, 'blogs'), { ...blogData, id: slug });

      const newBlog = {
        id: slug,
        ...blogData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      } as FirestoreBlog;

      return res.status(201).json(newBlog);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Blogs API error:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}
