import { createTransport } from 'nodemailer';
import {
  doc,
  query,
  where,
  getDoc,
  setDoc,
  getDocs,
  orderBy,
  collection
} from 'firebase/firestore';
import {
  contentsCollection,
  guestbookCollection
} from './firebase/collections';
import { db } from './firebase/app';
import { backendEnv } from './env-server';
import { getAllContents } from './mdx';
import { getContentFiles } from './mdx-utils';
import { VALID_CONTENT_TYPES } from './helper-server';
import { removeContentExtension } from './helper';
import type { Blog, ContentType } from './types/contents';
import type { CustomSession } from './types/api';
import type { ContentMeta } from './types/meta';
import type {
  ContentData,
  ContentColumn,
  ContentStatistics
} from './types/statistics';
import type { Guestbook } from './types/guestbook';
import type { FirestoreBlog } from './types/firestore-blog';

/**
 * Initialize all blog and projects if not exists in firestore at build time.
 */
export async function initializeAllContents(): Promise<void> {
  const contentPromises = VALID_CONTENT_TYPES.map((type) =>
    initializeContents(type)
  );
  await Promise.all(contentPromises);
}

/**
 * Initialize contents with selected content type.
 */
export async function initializeContents(type: ContentType): Promise<void> {
  try {
    const contents = await getContentFiles(type);

    const contentPromises = contents.map(async (slug) => {
      slug = removeContentExtension(slug);

      try {
        const snapshot = await getDoc(doc(contentsCollection, slug));

        if (snapshot.exists()) return;

        const newContent: Omit<ContentMeta, 'slug'> = {
          type,
          views: 0,
          likes: 0,
          likesBy: {}
        };

        await setDoc(doc(contentsCollection, slug), newContent);
      } catch (error) {
        console.warn(`Failed to initialize content ${slug}:`, error);
        // Continue with next content instead of failing completely
      }
    });

    await Promise.all(contentPromises);
  } catch (error) {
    console.error('Failed to initialize contents:', error);
    // Fail silently in development when Firestore is not available
  }
}

/**
 * Returns all the guestbook.
 */
export async function getGuestbook(): Promise<Guestbook[]> {
  try {
    // If Firebase is not available, return empty array
    if (!db) {
      console.warn('Firebase not available, returning empty guestbook');
      return [];
    }

    const guestbookSnapshot = await getDocs(
      query(guestbookCollection, orderBy('createdAt', 'desc'))
    );

    const guestbook = guestbookSnapshot.docs.map((doc) => doc.data());

    const parsedGuestbook = guestbook.map(({ createdAt, ...data }) => ({
      ...data,
      createdAt: createdAt.toJSON()
    })) as Guestbook[];

    return parsedGuestbook;
  } catch (error) {
    console.error('Failed to get guestbook:', error);
    return []; // Return empty array when Firestore is not available
  }
}

/**
 * Convert FirestoreBlog to Blog format for consistency with MDX blogs
 */
function firestoreBlogToBlog(firestoreBlog: FirestoreBlog): Blog & { isFirestore?: boolean } {
  return {
    tags: firestoreBlog.tags,
    slug: firestoreBlog.slug,
    title: firestoreBlog.title,
    banner: firestoreBlog.bannerLink 
      ? { src: firestoreBlog.bannerLink, height: 400, width: 800 }
      : { src: '/assets/placeholder-cert.png', height: 400, width: 800 },
    readTime: '5 min read', // Default read time for Firestore blogs
    description: firestoreBlog.description,
    publishedAt: firestoreBlog.publishedAt,
    bannerAlt: firestoreBlog.bannerAlt,
    bannerLink: firestoreBlog.bannerLink,
    isFirestore: true // Add identifier for Firestore blogs
  };
}

/**
 * Get all Firestore blogs
 */
async function getFirestoreBlogs(): Promise<Blog[]> {
  if (!db) {
    return [];
  }

  try {
    const blogsRef = collection(db, 'blogs');
    const q = query(blogsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const firestoreBlogs: FirestoreBlog[] = [];
    querySnapshot.forEach((doc) => {
      firestoreBlogs.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreBlog);
    });

    // Convert Firestore blogs to Blog format
    return firestoreBlogs.map(firestoreBlogToBlog);
  } catch (error) {
    console.error('Failed to fetch Firestore blogs:', error);
    return [];
  }
}

export type BlogWithViews = Blog & Pick<ContentMeta, 'views'>;

/**
 * Returns all the blog posts with the views, combining MDX and Firestore blogs.
 */
export async function getAllBlogWithViews(): Promise<BlogWithViews[]> {
  try {
    // Get blogs from both sources
    const [mdxPosts, firestoreBlogs] = await Promise.all([
      getAllContents('blog'),
      getFirestoreBlogs()
    ]);

    // Combine all blogs
    const allPosts = [...mdxPosts, ...firestoreBlogs];

    // If Firebase is not available, return posts with 0 views
    if (!db) {
      console.warn('Firebase not available, returning posts with 0 views');
      return allPosts.map(post => ({ ...post, views: 0 }));
    }

    const postsPromises = allPosts.map(async (post) => {
      try {
        const snapshot = await getDoc(doc(contentsCollection, post.slug));
        const data = snapshot.data();
        
        // If document doesn't exist or views is undefined, default to 0
        const views = data?.views ?? 0;

        return { ...post, views };
      } catch (error) {
        console.error(`Error getting views for ${post.slug}:`, error);
        return { ...post, views: 0 };
      }
    });

    const postsWithViews = await Promise.all(postsPromises);

    // Sort by published date (newest first)
    postsWithViews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return postsWithViews;
  } catch (error) {
    console.error('Failed to get blog posts with views:', error);
    // Fallback: return MDX posts without views
    const posts = await getAllContents('blog');
    return posts.map(post => ({ ...post, views: 0 }));
  }
}

/**
 * Send email to my email address.
 */
export async function sendEmail(
  text: string,
  session: CustomSession
): Promise<void> {
  const client = createTransport({
    service: 'Gmail',
    auth: {
      user: backendEnv.EMAIL_ADDRESS,
      pass: backendEnv.EMAIL_PASSWORD
    }
  });

  const { name, email } = session.user;

  const emailHeader = `New guestbook from ${name} (${email})`;

  await client.sendMail({
    from: backendEnv.EMAIL_ADDRESS,
    to: backendEnv.EMAIL_TARGET,
    subject: emailHeader,
    text: text
  });
}

/**
 * Returns the contents statistics with selected content type.
 */
export async function getContentStatistics(
  type: ContentType
): Promise<ContentStatistics> {
  const contentsSnapshot = await getDocs(
    query(contentsCollection, where('type', '==', type))
  );

  const contents = contentsSnapshot.docs.map((doc) => doc.data());

  const [totalPosts, totalViews, totalLikes] = contents.reduce(
    ([accPosts, accViews, accLikes], { views, likes }) => [
      accPosts + 1,
      accViews + views,
      accLikes + likes
    ],
    [0, 0, 0]
  );

  return { type, totalPosts, totalViews, totalLikes };
}

/**
 * Returns all the contents statistics.
 */
export async function getAllContentsStatistics(): Promise<ContentStatistics[]> {
  const statisticsPromises = VALID_CONTENT_TYPES.map((type) =>
    getContentStatistics(type)
  );

  const statistics = await Promise.all(statisticsPromises);

  return statistics;
}

/**
 * Returns the content data with selected content type.
 */
export async function getContentData(type: ContentType): Promise<ContentData> {
  const contentsSnapshot = await getDocs(
    query(contentsCollection, where('type', '==', type))
  );

  const contents = contentsSnapshot.docs.map((doc) => doc.data());

  const filteredContents: ContentColumn[] = contents.map(
    ({ slug, views, likes }) => ({
      slug,
      views,
      likes
    })
  );

  const contentData: ContentData = {
    type,
    data: filteredContents
  };

  return contentData;
}

/**
 * Returns all the content data.
 */
export async function getAllContentsData(): Promise<ContentData[]> {
  const contentDataPromises = VALID_CONTENT_TYPES.map((type) =>
    getContentData(type)
  );

  const contentData = await Promise.all(contentDataPromises);

  return contentData;
}
