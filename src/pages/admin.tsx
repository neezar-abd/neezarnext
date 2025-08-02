import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { setTransition } from '@lib/transition';
import { SEO } from '@components/common/seo';
import { Accent } from '@components/ui/accent';
import { Button } from '@components/ui/button';
import { BlogManagement } from '@components/admin/blog-management';
import { DesignManagement } from '@components/admin/design-management';
import { StatisticsManagement } from '@components/admin/statistics-management';
import { HomeManagement } from '@components/admin/home-management';
import { AboutManagement } from '@components/admin/about-management';

export default function AdminDashboard(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'blogs' | 'design' | 'stats' | 'home' | 'about'>('blogs');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check simple auth from localStorage
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin-login');
  };

  if (loading) {
    return (
      <main className='main-container'>
        <div className='flex min-h-screen items-center justify-center'>
          <div>Loading...</div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className='main-container'>
        <SEO title='Admin Dashboard - Access Denied' description='Admin access required to view this page' />
        <section className='flex min-h-screen flex-col items-center justify-center'>
          <motion.div
            className='text-center'
            {...setTransition({ delayIn: 0.1 })}
          >
            <h1 className='text-3xl font-bold'>
              <Accent>Access Denied</Accent>
            </h1>
            <p className='mt-4 text-gray-600 dark:text-gray-300'>
              You need to be signed in as an admin to access this page.
            </p>
            <Button
              className='mt-6'
              onClick={() => router.push('/admin-login')}
            >
              Go to Admin Login
            </Button>
          </motion.div>
        </section>
      </main>
    );
  }

  return (
    <main className='main-container'>
      <SEO title='Admin Dashboard' description='Content management dashboard for blog posts and projects' />
      
      <section className='py-8'>
        <motion.div {...setTransition({ delayIn: 0.1 })}>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold'>
                Welcome to <Accent>Admin Dashboard</Accent>
              </h1>
              <p className='mt-2 text-gray-600 dark:text-gray-300'>
                Manage your content from this dashboard
              </p>
            </div>
            <Button
              className='bg-red-600 hover:bg-red-700'
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </motion.div>

        <motion.div
          className='mt-8 flex gap-4 border-b dark:border-gray-700'
          {...setTransition({ delayIn: 0.2 })}
        >
          <button
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'blogs'
                ? 'border-b-2 border-accent-start text-accent-start'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
            onClick={() => setActiveTab('blogs')}
          >
            Blog Management
          </button>
          <button
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'home'
                ? 'border-b-2 border-accent-start text-accent-start'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
            onClick={() => setActiveTab('home')}
          >
            Home Page
          </button>
          <button
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'about'
                ? 'border-b-2 border-accent-start text-accent-start'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
            onClick={() => setActiveTab('about')}
          >
            About Page
          </button>
          <button
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'design'
                ? 'border-b-2 border-accent-start text-accent-start'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
            onClick={() => setActiveTab('design')}
          >
            Design
          </button>
          <button
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'stats'
                ? 'border-b-2 border-accent-start text-accent-start'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </motion.div>

        <motion.div
          className='mt-8'
          {...setTransition({ delayIn: 0.3 })}
        >
          {activeTab === 'blogs' && <BlogManagement />}
          {activeTab === 'home' && <HomeManagement />}
          {activeTab === 'about' && <AboutManagement />}
          {activeTab === 'design' && <DesignManagement />}
          {activeTab === 'stats' && <StatisticsManagement />}
        </motion.div>
      </section>
    </main>
  );
}
