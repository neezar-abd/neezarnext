import { getServerSession, type AuthOptions } from 'next-auth';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { authOptions } from '../../../auth/[...nextauth]';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CustomSession } from '@lib/types/api';
import type { APIResponse } from '@lib/types/helper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<{ content: string }>>
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

    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { slug } = req.query as { slug: string };
    const blogPath = join(process.cwd(), 'src', 'pages', 'blog', `${slug}.mdx`);

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
  } catch (error) {
    console.error('Blog content API error:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}
