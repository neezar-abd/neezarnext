import { motion } from 'framer-motion';
import { formatNumber } from '@lib/format';
import { setTransition } from '@lib/transition';
import { Accent } from '@components/ui/accent';
import { Table } from '@components/statistics/table';
import { useState, useEffect } from 'react';
import type { ContentData, ContentStatistics } from '@lib/types/statistics';

export function StatisticsManagement(): React.JSX.Element {
  const [contentsData, setContentsData] = useState<ContentData[]>([]);
  const [contentsStatistics, setContentsStatistics] = useState<ContentStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatistics() {
      try {
        // For now, we'll use placeholder data since we need to implement the API endpoints
        const placeholderStatistics: ContentStatistics[] = [
          {
            type: 'blog',
            totalPosts: 3,
            totalViews: 1250,
            totalLikes: 89
          },
          {
            type: 'projects',
            totalPosts: 1,
            totalViews: 567,
            totalLikes: 23
          }
        ];

        const placeholderData: ContentData[] = [
          {
            type: 'blog',
            data: [
              {
                slug: 'hello-world',
                views: 456,
                likes: 12
              },
              {
                slug: 'data-fetching-in-nextjs',
                views: 789,
                likes: 34
              },
              {
                slug: 'custom-layout-in-nextjs',
                views: 321,
                likes: 18
              }
            ]
          },
          {
            type: 'projects',
            data: [
              {
                slug: 'twitter-clone',
                views: 567,
                likes: 23
              }
            ]
          }
        ];

        setContentsStatistics(placeholderStatistics);
        setContentsData(placeholderData);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center py-12'>
        <div className='text-gray-600 dark:text-gray-300'>Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className='grid gap-6'>
      <motion.section
        className='grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4'
        {...setTransition({ delayIn: 0.1 })}
      >
        {contentsStatistics.map(
          ({ type, totalPosts, totalViews, totalLikes }) => (
            <article
              className='main-border grid gap-2 rounded-md p-4 text-center'
              key={type}
            >
              <h2 className='text-2xl font-bold capitalize'>{type}</h2>
              <div className='grid gap-1 [&>p>span]:text-lg [&>p>span]:font-semibold'>
                <p>
                  <span>{formatNumber(totalPosts)}</span> Posts
                </p>
                <p>
                  <span>{formatNumber(totalViews)}</span> views
                </p>
                <p>
                  <span>{formatNumber(totalLikes)}</span> likes
                </p>
              </div>
            </article>
          )
        )}
      </motion.section>
      {contentsData.map(({ type, data }, index) => (
        <motion.section className='grid gap-4' key={type}>
          <motion.h2
            className='text-2xl font-bold capitalize'
            {...setTransition({ delayIn: 0.2 + index / 10 })}
          >
            {type}
          </motion.h2>
          <motion.section {...setTransition({ delayIn: 0.3 + index / 10 })}>
            <Table data={data} />
          </motion.section>
        </motion.section>
      ))}
    </div>
  );
}
