import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaEye, FaPlus, FaTrash } from 'react-icons/fa';
import { Button } from '@components/ui/button';
import { Accent } from '@components/ui/accent';
import { useNotification } from '@lib/hooks/use-notification';
import type { AboutContent, Certification } from '@lib/page-content';

export function AboutManagement(): React.JSX.Element {
  const { success, error, loading: loadingToast, dismiss } = useNotification();
  
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    title: 'About',
    name: 'Risal Amin',
    content: `Hi, I'm Risal. I started learning web development in November 2021, after building my first web app with Python and the Streamlit module. Since then, I've been dedicated to learning as much as I can about web development.

I began my journey by completing the front-end course on FreeCodeCamp and then moved on to The Odin Project to learn fullstack development. I'm always motivated to learn new technologies and techniques, and I enjoy getting feedback to help me improve.

On this website, I'll be sharing my projects and writing about what I've learned. I believe that writing helps me better understand and retain new information, and I'm always happy to share my knowledge with others. If you have any questions or want to connect, don't hesitate to reach out!`,
    techStack: ['Next.js', 'TypeScript', 'Firebase', 'TailwindCSS'],
    certifications: []
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const response = await fetch('/api/admin/pages/about');
      if (response.ok) {
        const data = await response.json();
        setAboutContent(data);
      }
    } catch (error) {
      console.error('Failed to fetch about content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AboutContent, value: string | string[]) => {
    setAboutContent(prev => ({ ...prev, [field]: value }));
  };

  const handleTechStackChange = (value: string) => {
    const techArray = value.split(',').map(tech => tech.trim()).filter(tech => tech);
    setAboutContent(prev => ({ ...prev, techStack: techArray }));
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      title: '',
      issuer: '',
      date: new Date().toISOString().split('T')[0],
      imageUrl: '',
      credentialUrl: '',
      description: ''
    };
    setAboutContent(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setAboutContent(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (id: string) => {
    setAboutContent(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const toast = loadingToast('Updating about page content...');
    
    try {
      const response = await fetch('/api/admin/pages/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aboutContent),
      });

      if (response.ok) {
        dismiss(toast);
        success('About page content updated successfully!');
      } else {
        dismiss(toast);
        throw new Error('Failed to update about content');
      }
    } catch (err) {
      dismiss(toast);
      console.error('Failed to save about content:', err);
      error('Failed to save about content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div>Loading about content...</div>
      </div>
    );
  }

  if (preview) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">
            <Accent>About Page Preview</Accent>
          </h3>
          <Button
            onClick={() => setPreview(false)}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Back to Edit
          </Button>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h2>{aboutContent.title}</h2>
          <h1><span className="text-blue-500">{aboutContent.name}</span></h1>
          <div className="whitespace-pre-wrap">
            {aboutContent.content}
          </div>
          
          <h3>Favorite Tech Stack</h3>
          <div className="flex gap-2 flex-wrap">
            {aboutContent.techStack.map((tech, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
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
          <Accent>About Page Management</Accent>
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
            disabled={saving}
            className="flex items-center gap-2"
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Content */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Basic Information</h4>
          
          <div>
            <label className="block text-sm font-medium mb-2">Page Title</label>
            <input
              type="text"
              value={aboutContent.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="About"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={aboutContent.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Your Full Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tech Stack</label>
            <input
              type="text"
              value={aboutContent.techStack.join(', ')}
              onChange={(e) => handleTechStackChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Next.js, TypeScript, Firebase (comma separated)"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Separate technologies with commas
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">About Content</h4>
          <div>
            <label className="block text-sm font-medium mb-2">About Text</label>
            <textarea
              value={aboutContent.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Write about yourself, your journey, experience, etc..."
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              You can use line breaks. The content will be displayed as formatted text.
            </p>
          </div>
        </div>
      </div>

      {/* Certifications Management */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-lg">Certifications</h4>
          <Button
            onClick={addCertification}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <FaPlus />
            Add Certification
          </Button>
        </div>

        {aboutContent.certifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No certifications added yet. Click "Add Certification" to add one.
          </div>
        ) : (
          <div className="space-y-4">
            {aboutContent.certifications.map((cert, index) => (
              <div key={cert.id} className="border border-gray-300 dark:border-gray-600 rounded-md p-4">
                <div className="flex justify-between items-start mb-4">
                  <h5 className="font-medium">Certification #{index + 1}</h5>
                  <Button
                    onClick={() => removeCertification(cert.id)}
                    className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1"
                  >
                    <FaTrash />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      value={cert.title}
                      onChange={(e) => updateCertification(cert.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Certification Title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Issuer *</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Issuing Organization"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Date *</label>
                    <input
                      type="date"
                      value={cert.date}
                      onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL *</label>
                    <input
                      type="url"
                      value={cert.imageUrl}
                      onChange={(e) => updateCertification(cert.id, 'imageUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="https://example.com/cert-image.jpg"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Credential URL</label>
                    <input
                      type="url"
                      value={cert.credentialUrl || ''}
                      onChange={(e) => updateCertification(cert.id, 'credentialUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="https://example.com/verify-credential"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={cert.description || ''}
                      onChange={(e) => updateCertification(cert.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Brief description of the certification"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Preview */}
      <div className="mt-6 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
        <h5 className="font-medium mb-3">Quick Preview:</h5>
        <div className="space-y-3 text-sm">
          <div>
            <strong>{aboutContent.title}</strong>
          </div>
          <div>
            <span className="text-blue-500">{aboutContent.name}</span>
          </div>
          <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
            {aboutContent.content.slice(0, 200)}...
          </div>
          <div className="flex gap-1 flex-wrap">
            {aboutContent.techStack.slice(0, 4).map((tech, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
              >
                {tech}
              </span>
            ))}
            {aboutContent.techStack.length > 4 && (
              <span className="text-xs text-gray-500">+{aboutContent.techStack.length - 4} more</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
