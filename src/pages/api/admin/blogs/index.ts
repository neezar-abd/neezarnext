import { getServerSession, type AuthOptions } from 'next-auth';
import { readdir, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getAllContents } from '@lib/mdx';
import { authOptions } from '../../auth/[...nextauth]';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CustomSession } from '@lib/types/api';
import type { APIResponse } from '@lib/types/helper';
import type { Blog } from '@lib/types/contents';

type BlogPost = Blog & {
  id: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<BlogPost | BlogPost[]>>
): Promise<void> {
  try {
    // Check authentication
    const session = await getServerSession<AuthOptions, CustomSession>(
      req,
      res,
      authOptions
    );

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!session.user.admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (req.method === 'GET') {
      // Get all blog posts
      const blogs = await getAllContents('blog');
      const blogsWithId = blogs.map(blog => ({
        ...blog,
        id: blog.slug
      }));
      
      return res.status(200).json(blogsWithId);
    }

    if (req.method === 'POST') {
      // Create new blog post
      const {
        title,
        description,
        tags,
        publishedAt,
        bannerAlt,
        bannerLink,
        content,
        slug
      } = req.body;

      if (!title || !description || !content || !slug) {
        return res.status(400).json({ 
          message: 'Title, description, content, and slug are required' 
        });
      }

      // Create the MDX content
      const mdxContent = `import Banner from '../../../public/assets/blog/${slug}/banner.jpg';
import { ContentLayout } from '@components/layout/content-layout';
import { getContentSlug } from '@lib/mdx';

export const meta = {
  title: '${title}',
  publishedAt: '${publishedAt}',
  banner: Banner,
  bannerAlt: '${bannerAlt || ''}',
  bannerLink: '${bannerLink || ''}',
  description: '${description}',
  tags: '${tags || ''}'
};

export const getStaticProps = getContentSlug('blog', '${slug}');

export default ({ children }) => (
  <ContentLayout meta={meta}>{children}</ContentLayout>
);

{/* content start */}

${content}`;

      // Write the MDX file
      const blogPath = join(process.cwd(), 'src', 'pages', 'blog', `${slug}.mdx`);
      await writeFile(blogPath, mdxContent, 'utf8');

      // Create assets directory for banner
      const assetsPath = join(process.cwd(), 'public', 'assets', 'blog', slug);
      if (!existsSync(assetsPath)) {
        await mkdir(assetsPath, { recursive: true });
      }

      const newBlog: BlogPost = {
        title,
        description,
        tags: tags || '',
        publishedAt,
        banner: {
          src: `/assets/blog/${slug}/banner.jpg`,
          height: 400,
          width: 800
        },
        bannerAlt: bannerAlt || '',
        bannerLink: bannerLink || '',
        slug,
        readTime: '5 min read', // This would be calculated in real implementation
        id: slug
      };

      return res.status(201).json(newBlog);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Blog API error:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}
