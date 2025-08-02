import { getServerSession, type AuthOptions } from 'next-auth';
import { readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { authOptions } from '../../auth/[...nextauth]';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CustomSession } from '@lib/types/api';
import type { APIResponse } from '@lib/types/helper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
): Promise<void> {
  try {
    // Temporary: Skip authentication for testing
    // TODO: Implement proper authentication check
    
    /*
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
    */

    const { slug } = req.query as { slug: string };
    const blogPath = join(process.cwd(), 'src', 'pages', 'blog', `${slug}.mdx`);

    if (req.method === 'GET') {
      // Get blog content for editing
      if (!existsSync(blogPath)) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      const content = await readFile(blogPath, 'utf8');
      
      // Extract the content after {/* content start */}
      const contentStart = content.indexOf('{/* content start */}');
      if (contentStart === -1) {
        return res.status(500).json({ message: 'Invalid blog format' });
      }

      const actualContent = content.substring(contentStart + 24).trim();
      
      return res.status(200).json({ content: actualContent });
    }

    if (req.method === 'PUT') {
      // Update blog post
      const {
        title,
        description,
        tags,
        publishedAt,
        bannerAlt,
        bannerLink,
        content
      } = req.body;

      if (!title || !description || !content) {
        return res.status(400).json({ 
          message: 'Title, description, and content are required' 
        });
      }

      // Create the updated MDX content
      const mdxContent = `import { ContentLayout } from '@components/layout/content-layout';
import { getContentSlug } from '@lib/mdx';

export const meta = {
  title: '${title}',
  publishedAt: '${publishedAt}',
  banner: {
    src: '${bannerLink || `/assets/blog/${slug}/banner.jpg`}',
    height: 400,
    width: 800
  },
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

      // Write the updated MDX file
      await writeFile(blogPath, mdxContent, 'utf8');

      return res.status(200).json({ message: 'Blog post updated successfully' });
    }

    if (req.method === 'DELETE') {
      // Delete blog post
      if (!existsSync(blogPath)) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      // Delete the MDX file
      await unlink(blogPath);

      return res.status(200).json({ message: 'Blog post deleted successfully' });
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
