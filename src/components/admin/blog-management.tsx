import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { setTransition } from '@lib/transition';
import { Button } from '@components/ui/button';
import { Accent } from '@components/ui/accent';
import { BlogEditor } from '@components/admin/blog-editor';
import { ConfirmModal } from '@components/admin/confirm-modal';
import { useNotification } from '@lib/hooks/use-notification';
import type { Blog } from '@lib/types/contents';

type BlogPost = Blog & {
  id: string;
};

type EditorMode = 'create' | 'edit' | null;

export function BlogManagement(): React.JSX.Element {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogPost | null>(null);
  const { notifySuccess, notifyError } = useNotification();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = () => {
    setSelectedBlog(null);
    setEditorMode('create');
  };

  const handleEditBlog = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setEditorMode('edit');
  };

  const handleDeleteBlog = (blog: BlogPost) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      const response = await fetch(`/api/admin/blogs/${blogToDelete.slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog.slug !== blogToDelete.slug));
        setShowDeleteModal(false);
        setBlogToDelete(null);
        notifySuccess('Blog post deleted successfully!');
      } else {
        const errorData = await response.json();
        notifyError(errorData.message || 'Failed to delete blog post');
      }
    } catch (error) {
      console.error('Failed to delete blog:', error);
      notifyError('Failed to delete blog post. Please try again.');
    }
  };

  const handleEditorClose = () => {
    setEditorMode(null);
    setSelectedBlog(null);
    fetchBlogs(); // Refresh the list
  };

  if (loading) {
    return (
      <div className='flex justify-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-accent-start'></div>
      </div>
    );
  }

  return (
    <>
      <div className='space-y-6'>
        <motion.div
          className='flex justify-between items-center'
          {...setTransition({ delayIn: 0.1 })}
        >
          <div>
            <h2 className='text-2xl font-bold'>
              <Accent>Blog Posts</Accent>
            </h2>
            {process.env.NODE_ENV === 'production' && (
              <p className='text-sm text-yellow-600 dark:text-yellow-400 mt-1'>
                ⚠️ Delete operations are disabled in production environment
              </p>
            )}
          </div>
          <Button
            className='flex items-center gap-2'
            onClick={handleCreateBlog}
          >
            <FaPlus className='text-sm' />
            Create New Post
          </Button>
        </motion.div>

        <motion.div
          className='bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden'
          {...setTransition({ delayIn: 0.2 })}
        >
          {blogs.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-600 dark:text-gray-300'>
                No blog posts found. Create your first post!
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 dark:bg-gray-700'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Title
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Published
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Tags
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 dark:divide-gray-600'>
                  {blogs.map((blog) => (
                    <motion.tr
                      key={blog.slug}
                      className='hover:bg-gray-50 dark:hover:bg-gray-700'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td className='px-6 py-4'>
                        <div>
                          <div className='text-sm font-medium text-gray-900 dark:text-white'>
                            {blog.title}
                          </div>
                          <div className='text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs'>
                            {blog.description}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                        {new Date(blog.publishedAt).toLocaleDateString()}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-wrap gap-1'>
                          {(Array.isArray(blog.tags) 
                            ? blog.tags 
                            : typeof blog.tags === 'string' 
                              ? blog.tags.split(',').map(t => t.trim())
                              : []
                          ).map((tag, index) => (
                            <span
                              key={index}
                              className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div className='flex justify-end gap-2'>
                          <button
                            className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                            onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                            title='View Post'
                          >
                            <FaEye />
                          </button>
                          <button
                            className='text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                            onClick={() => handleEditBlog(blog)}
                            title='Edit Post'
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ${
                              process.env.NODE_ENV === 'production' 
                                ? 'opacity-50 cursor-not-allowed' 
                                : ''
                            }`}
                            onClick={() => {
                              if (process.env.NODE_ENV === 'production') {
                                notifyError('Delete operation is not available in production. Please remove files via git.');
                                return;
                              }
                              handleDeleteBlog(blog);
                            }}
                            title={
                              process.env.NODE_ENV === 'production' 
                                ? 'Delete not available in production' 
                                : 'Delete Post'
                            }
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {editorMode && (
          <BlogEditor
            mode={editorMode}
            blog={selectedBlog}
            onClose={handleEditorClose}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${blogToDelete?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setBlogToDelete(null);
        }}
      />
    </>
  );
}
