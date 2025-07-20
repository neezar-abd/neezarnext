import { useState, useEffect } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { setTransition } from '@lib/transition';
import { SEO } from '@components/common/seo';
import { Accent } from '@components/ui/accent';
import { Button } from '@components/ui/button';
import { BlogManagement } from '@components/admin/blog-management';
import { DesignManagement } from '@components/admin/design-management';
import { StatisticsManagement } from '@components/admin/statistics-management';
import type { GetServerSidePropsResult, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import type { CustomSession } from '@lib/types/api';

export default function AdminDashboard({
  session
}: InferGetServerSidePropsType<typeof getServerSideProps>): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'blogs' | 'design' | 'stats'>('blogs');

  if (!session) {
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
              onClick={() => signIn('github')}
            >
              Sign in with GitHub
            </Button>
          </motion.div>
        </section>
      </main>
    );
  }

  if (!session.user.admin) {
    return (
      <main className='main-container'>
        <SEO title='Admin Dashboard - Unauthorized' description='Admin privileges required to access this dashboard' />
        <section className='flex min-h-screen flex-col items-center justify-center'>
          <motion.div
            className='text-center'
            {...setTransition({ delayIn: 0.1 })}
          >
            <h1 className='text-3xl font-bold'>
              <Accent>Unauthorized</Accent>
            </h1>
            <p className='mt-4 text-gray-600 dark:text-gray-300'>
              You don't have admin privileges to access this dashboard.
            </p>
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
          <h1 className='text-3xl font-bold'>
            Welcome back, <Accent>{session.user.username}</Accent>
          </h1>
          <p className='mt-2 text-gray-600 dark:text-gray-300'>
            Manage your content from this dashboard
          </p>
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
          {activeTab === 'design' && <DesignManagement />}
          {activeTab === 'stats' && <StatisticsManagement />}
        </motion.div>
      </section>
    </main>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ session: CustomSession | null }>> {
  const session = (await getSession(context)) as CustomSession | null;

  return {
    props: {
      session
    }
  };
}
