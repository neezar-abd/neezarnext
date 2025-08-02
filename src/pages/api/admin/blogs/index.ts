import { getServerSession, type AuthOptions } from 'next-auth';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { authOptions } from '../../auth/[...nextauth]';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CustomSession } from '@lib/types/api';
import type { APIResponse } from '@lib/types/helper';
import type { Blog } from '@lib/types/contents';

type BlogPost = Blog & {
  id: string;
};

// Helper function to read MDX files directly
async function getBlogPostsFromFiles(): Promise<BlogPost[]> {
  try {
    const blogDir = join(process.cwd(), 'src', 'pages', 'blog');
    
    if (!existsSync(blogDir)) {
      console.log('Blog directory does not exist:', blogDir);
      return [];
    }

    const files = await readdir(blogDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    
    console.log('Found MDX files:', mdxFiles);

    const blogs: BlogPost[] = [];

    for (const file of mdxFiles) {
      try {
        const filePath = join(blogDir, file);
        const content = await readFile(filePath, 'utf8');
        
        // Extract meta information from the file
        const metaMatch = content.match(/export const meta = \{([\s\S]*?)\};/);
        if (metaMatch) {
          const metaContent = metaMatch[1];
          
          // Extract individual fields
          const titleMatch = metaContent.match(/title:\s*['"`](.*?)['"`]/);
          const publishedAtMatch = metaContent.match(/publishedAt:\s*['"`](.*?)['"`]/);
          const descriptionMatch = metaContent.match(/description:\s*['"`]([\s\S]*?)['"`]/);
          const tagsMatch = metaContent.match(/tags:\s*\[(.*?)\]/);
          const bannerAltMatch = metaContent.match(/bannerAlt:\s*['"`](.*?)['"`]/);
          
          const slug = file.replace('.mdx', '');
          
          // Parse tags properly (handle both array and string formats)
          let tags: string[] = [];
          if (tagsMatch) {
            try {
              // Parse array format: ['tag1', 'tag2']
              const tagsString = `[${tagsMatch[1]}]`;
              tags = JSON.parse(tagsString);
            } catch {
              // Fallback to string format
              const tagsString = tagsMatch[1].replace(/['"]/g, '');
              tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
            }
          }
          
          const blog: BlogPost = {
            title: titleMatch ? titleMatch[1] : 'Untitled',
            description: descriptionMatch ? descriptionMatch[1] : '',
            publishedAt: publishedAtMatch ? publishedAtMatch[1] : '',
            tags: tags, // Use parsed array
            slug,
            readTime: '5 min read', // Default value
            banner: {
              src: `/assets/blog/${slug}/banner.jpg`,
              height: 400,
              width: 800
            },
            bannerAlt: bannerAltMatch ? bannerAltMatch[1] : '',
            bannerLink: '',
            id: slug
          };
          
          blogs.push(blog);
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }
    
    // Sort by published date (newest first)
    blogs.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    return blogs;
  } catch (error) {
    console.error('Error getting blog posts:', error);
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<BlogPost | BlogPost[]>>
): Promise<void> {
  try {
    // Temporary: Skip authentication for testing
    console.log('API called, skipping auth...');
    
    if (req.method === 'GET') {
      // Get all blog posts using direct file reading
      console.log('Fetching blogs from files...');
      const blogs = await getBlogPostsFromFiles();
      console.log('Found blogs:', blogs.length);
      console.log('Blog data:', blogs);
      
      return res.status(200).json(blogs);
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
      const tagsString = Array.isArray(tags) ? JSON.stringify(tags) : `['${tags}']`;
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
  tags: ${tagsString}
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
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
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
