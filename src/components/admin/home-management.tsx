import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave } from 'react-icons/fa';
import { Button } from '@components/ui/button';
import { Accent } from '@components/ui/accent';
import { useNotification } from '@lib/hooks/use-notification';

type HomeContent = {
  title: string;
  subtitle: string;
  description: string;
  name: string;
  role: string;
  resumeLink: string;
  linkedinLink: string;
  githubLink: string;
};

export function HomeManagement(): React.JSX.Element {
  const { success, error, loading: loadingToast, dismiss } = useNotification();
  
  const [homeContent, setHomeContent] = useState<HomeContent>({
    title: 'Hi!',
    subtitle: "I'm Risal - Full Stack Developer",
    description: "I'm a self-taught Software Engineer turned Full Stack Developer. I enjoy working with TypeScript, React, and Node.js. I also love exploring new technologies and learning new things.",
    name: 'Risal',
    role: 'Full Stack Developer',
    resumeLink: '',
    linkedinLink: 'https://linkedin.com/in/risalamin',
    githubLink: 'https://github.com/risalamin'
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    try {
      const response = await fetch('/api/admin/pages/home');
      if (response.ok) {
        const data = await response.json();
        setHomeContent(data);
      }
    } catch (error) {
      console.error('Failed to fetch home content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof HomeContent, value: string) => {
    setHomeContent(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const toast = loadingToast('Updating home page content...');
    
    try {
      const response = await fetch('/api/admin/pages/home', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(homeContent),
      });

      if (response.ok) {
        dismiss(toast);
        success('Home page content updated successfully!');
      } else {
        dismiss(toast);
        throw new Error('Failed to update home content');
      }
    } catch (err) {
      dismiss(toast);
      console.error('Failed to save home content:', err);
      error('Failed to save home content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div>Loading home content...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">
          <Accent>Home Page Management</Accent>
        </h3>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <FaSave />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Content */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Main Content</h4>
          
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={homeContent.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Hi!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={homeContent.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Risal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <input
              type="text"
              value={homeContent.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Full Stack Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={homeContent.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description about yourself"
            />
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Social Links</h4>
          
          <div>
            <label className="block text-sm font-medium mb-2">Resume Link</label>
            <input
              type="url"
              value={homeContent.resumeLink}
              onChange={(e) => handleInputChange('resumeLink', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/resume.pdf"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
            <input
              type="url"
              value={homeContent.linkedinLink}
              onChange={(e) => handleInputChange('linkedinLink', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">GitHub Profile</label>
            <input
              type="url"
              value={homeContent.githubLink}
              onChange={(e) => handleInputChange('githubLink', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/username"
            />
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
            <h5 className="font-medium mb-3">Preview:</h5>
            <div className="space-y-2 text-sm">
              <div><strong>{homeContent.title}</strong></div>
              <div>I'm <span className="text-blue-500">{homeContent.name}</span> - {homeContent.role}</div>
              <div className="text-gray-600 dark:text-gray-400">{homeContent.description}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
