import { useRouter } from 'next/router';
import { frontendEnv } from '@lib/env';

interface StructuredDataProps {
  type?: 'website' | 'article' | 'person' | 'blog';
  title?: string;
  description?: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  tags?: string[];
}

export function StructuredData({
  type = 'website',
  title,
  description,
  image,
  author = 'Neezar',
  datePublished,
  dateModified,
  tags
}: StructuredDataProps): React.JSX.Element {
  const { asPath } = useRouter();
  const url = `${frontendEnv.NEXT_PUBLIC_URL}${asPath}`;

  let schema: any = {
    '@context': 'https://schema.org',
    '@type': type === 'website' ? 'WebSite' : type === 'article' ? 'Article' : type === 'blog' ? 'Blog' : 'Person',
    url,
    name: title,
    description,
    author: {
      '@type': 'Person',
      name: author,
      url: frontendEnv.NEXT_PUBLIC_URL
    }
  };

  if (type === 'article') {
    schema = {
      ...schema,
      '@type': 'Article',
      headline: title,
      image: image ? `${frontendEnv.NEXT_PUBLIC_URL}${image}` : undefined,
      datePublished,
      dateModified: dateModified || datePublished,
      keywords: tags ? (Array.isArray(tags) ? tags.join(', ') : 
        (typeof tags === 'string' ? tags : '')) : '',
      publisher: {
        '@type': 'Person',
        name: author,
        url: frontendEnv.NEXT_PUBLIC_URL
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url
      }
    };
  } else if (type === 'person') {
    schema = {
      ...schema,
      '@type': 'Person',
      jobTitle: 'Fullstack Developer',
      worksFor: {
        '@type': 'Organization',
        name: 'Freelancer'
      },
      knowsAbout: [
        'Web Development',
        'JavaScript',
        'TypeScript',
        'React',
        'Next.js',
        'Node.js',
        'Fullstack Development'
      ],
      sameAs: [
        'https://github.com/neezar-abd',
        'https://linkedin.com/in/neezar'
      ]
    };
  } else if (type === 'blog') {
    schema = {
      ...schema,
      '@type': 'Blog',
      blogPost: [], // This will be populated dynamically
      author: {
        '@type': 'Person',
        name: author,
        url: frontendEnv.NEXT_PUBLIC_URL
      }
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}
