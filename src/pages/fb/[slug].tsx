import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import Link from 'next/link';
import type { FirestoreBlog } from '@lib/types/firestore-blog';

export default function FirestoreBlogPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<FirestoreBlog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug || typeof slug !== 'string' || !db) {
        setError('Blog not found');
        setLoading(false);
        return;
      }

      try {
        const blogRef = doc(db, 'blogs', slug);
        const blogDoc = await getDoc(blogRef);
        
        if (blogDoc.exists()) {
          const blogData = { id: blogDoc.id, ...blogDoc.data() } as FirestoreBlog;
          setBlog(blogData);
        } else {
          setError('Blog not found');
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Blog Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The blog post you\'re looking for doesn\'t exist.'}</p>
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
            {blog.title}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {blog.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={blog.publishedAt}>{blog.publishedAt}</time>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </header>
        
        {/* Banner Image */}
        {blog.bannerLink && (
          <div className="mb-8">
            <img
              src={blog.bannerLink}
              alt={blog.bannerAlt || blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ 
              __html: blog.content
                // Split into paragraphs and process
                .split('\n\n')
                .map(paragraph => {
                  paragraph = paragraph.trim();
                  if (!paragraph) return '';
                  
                  // Handle headers
                  if (paragraph.startsWith('### ')) {
                    return `<h3>${paragraph.substring(4)}</h3>`;
                  }
                  if (paragraph.startsWith('## ')) {
                    return `<h2>${paragraph.substring(3)}</h2>`;
                  }
                  if (paragraph.startsWith('# ')) {
                    return `<h1>${paragraph.substring(2)}</h1>`;
                  }
                  
                  // Handle regular paragraphs
                  return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
                })
                .join('')
                // Handle inline formatting
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
            }} 
          />
        </article>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ← Back to Blog
            </Link>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Published on {blog.publishedAt}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
