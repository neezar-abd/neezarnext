import { GetStaticPaths, GetStaticProps } from 'next';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { getAllContents } from '@lib/mdx';
import { useState } from 'react';
import type { Blog } from '@lib/types/contents';
import type { FirestoreBlog } from '@lib/types/firestore-blog';

type BlogPageProps = {
  blog: Blog;
  content?: string;
  isFirestoreBlog: boolean;
};

export default function BlogPage({ blog, content, isFirestoreBlog }: BlogPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.isArray(blog.tags) ? blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {tag}
              </span>
            )) : (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                {blog.tags}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {blog.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            {blog.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{blog.publishedAt}</span>
            <span>•</span>
            <span>{blog.readTime}</span>
          </div>
        </div>
        
        {/* Banner Image */}
        {blog.banner && (
          <div className="mb-8">
            <img
              src={typeof blog.banner === 'object' && 'src' in blog.banner ? blog.banner.src : blog.banner}
              alt={blog.bannerAlt || blog.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {isFirestoreBlog && content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <div>
            <p>This blog post is from an MDX file. Please check the source file.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Get paths from MDX files
  const mdxBlogs = await getAllContents('blog');
  const mdxPaths = mdxBlogs.map((blog) => ({
    params: { slug: blog.slug }
  }));

  // Get paths from Firestore
  let firestorePaths: { params: { slug: string } }[] = [];
  if (db) {
    try {
      const blogsRef = collection(db, 'blogs');
      const querySnapshot = await getDocs(blogsRef);
      firestorePaths = querySnapshot.docs.map((doc) => ({
        params: { slug: doc.id }
      }));
    } catch (error) {
      console.error('Error fetching Firestore blog paths:', error);
    }
  }

  const paths = [...mdxPaths, ...firestorePaths];

  return {
    paths,
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  if (!slug) {
    return { notFound: true };
  }

  // First try to get from Firestore
  if (db) {
    try {
      const blogRef = doc(db, 'blogs', slug);
      const blogDoc = await getDoc(blogRef);
      
      if (blogDoc.exists()) {
        const firestoreBlog = { id: blogDoc.id, ...blogDoc.data() } as FirestoreBlog;
        
        // Convert Firestore blog to Blog format
        const blog: Blog = {
          tags: firestoreBlog.tags,
          slug: firestoreBlog.slug,
          title: firestoreBlog.title,
          banner: firestoreBlog.bannerLink 
            ? { src: firestoreBlog.bannerLink, height: 400, width: 800 }
            : { src: '/assets/placeholder-cert.png', height: 400, width: 800 },
          readTime: '5 min read',
          description: firestoreBlog.description,
          publishedAt: firestoreBlog.publishedAt,
          bannerAlt: firestoreBlog.bannerAlt,
          bannerLink: firestoreBlog.bannerLink
        };

        // Convert markdown to HTML (simple approach)
        const content = firestoreBlog.content
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/# (.*)/g, '<h1>$1</h1>')
          .replace(/## (.*)/g, '<h2>$1</h2>')
          .replace(/### (.*)/g, '<h3>$1</h3>');

        return {
          props: {
            blog,
            content,
            isFirestoreBlog: true
          },
          revalidate: 60
        };
      }
    } catch (error) {
      console.error('Error fetching Firestore blog:', error);
    }
  }

  // Fallback: blog not found
  return { notFound: true };
};
