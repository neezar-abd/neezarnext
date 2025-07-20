import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSave, FaEye } from 'react-icons/fa';
import { Button } from '@components/ui/button';
import { Accent } from '@components/ui/accent';
import type { Blog } from '@lib/types/contents';

type BlogPost = Blog & {
  id: string;
};

type BlogEditorProps = {
  mode: 'create' | 'edit';
  blog: BlogPost | null;
  onClose: () => void;
};

type BlogFormData = {
  title: string;
  description: string;
  tags: string;
  publishedAt: string;
  banner?: string;
  bannerAlt?: string;
  bannerLink?: string;
  content: string;
};

export function BlogEditor({ mode, blog, onClose }: BlogEditorProps): React.JSX.Element {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    description: '',
    tags: '',
    publishedAt: new Date().toISOString().split('T')[0],
    banner: '',
    bannerAlt: '',
    bannerLink: '',
    content: ''
  });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && blog) {
      setFormData({
        title: blog.title,
        description: blog.description,
        tags: blog.tags,
        publishedAt: blog.publishedAt,
        banner: blog.banner?.src || '',
        bannerAlt: blog.bannerAlt || '',
        bannerLink: blog.bannerLink || '',
        content: '' // We'll need to fetch this from the MDX file
      });
      
      // Fetch the actual MDX content
      fetchBlogContent(blog.slug);
    }
  }, [mode, blog]);

  const fetchBlogContent = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/blogs/${slug}/content`);
      if (response.ok) {
        const { content } = await response.json();
        setFormData(prev => ({ ...prev, content }));
      }
    } catch (error) {
      console.error('Failed to fetch blog content:', error);
    }
  };

  const handleInputChange = (field: keyof BlogFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const slug = mode === 'create' ? generateSlug(formData.title) : blog?.slug;
      const endpoint = mode === 'create' 
        ? '/api/admin/blogs'
        : `/api/admin/blogs/${slug}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slug
        }),
      });

      if (response.ok) {
        onClose();
      } else {
        const error = await response.json();
        console.error('Failed to save blog:', error);
        alert('Failed to save blog post. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save blog:', error);
      alert('Failed to save blog post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generateMDXContent = () => {
    const slug = mode === 'create' ? generateSlug(formData.title) : blog?.slug;
    
    return `import Banner from '../../../public/assets/blog/${slug}/banner.jpg';
import { ContentLayout } from '@components/layout/content-layout';
import { getContentSlug } from '@lib/mdx';

export const meta = {
  title: '${formData.title}',
  publishedAt: '${formData.publishedAt}',
  banner: Banner,
  bannerAlt: '${formData.bannerAlt}',
  bannerLink: '${formData.bannerLink}',
  description: '${formData.description}',
  tags: '${formData.tags}'
};

export const getStaticProps = getContentSlug('blog', '${slug}');

export default ({ children }) => (
  <ContentLayout meta={meta}>{children}</ContentLayout>
);

{/* content start */}

${formData.content}`;
  };

  if (preview) {
    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
            <h3 className="text-xl font-bold">
              <Accent>Preview: {formData.title}</Accent>
            </h3>
            <Button
              onClick={() => setPreview(false)}
              className="flex items-center gap-2"
            >
              Back to Editor
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
              {generateMDXContent()}
            </pre>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold">
            <Accent>{mode === 'create' ? 'Create New' : 'Edit'} Blog Post</Accent>
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setPreview(true)}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
            >
              <FaEye />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.title || !formData.content}
              className="flex items-center gap-2"
            >
              <FaSave />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meta Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Post Information</h4>
              
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter blog title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the blog post"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="nextjs, react, typescript (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Published Date</label>
                <input
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Banner Alt Text</label>
                <input
                  type="text"
                  value={formData.bannerAlt}
                  onChange={(e) => handleInputChange('bannerAlt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Alt text for banner image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Banner Link</label>
                <input
                  type="url"
                  value={formData.bannerLink}
                  onChange={(e) => handleInputChange('bannerLink', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://unsplash.com/photos/..."
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Content *</h4>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Write your blog content in Markdown format..."
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You can use Markdown syntax. The content will be rendered as MDX.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
