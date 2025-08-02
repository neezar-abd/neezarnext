import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { frontendEnv } from '@lib/env';
import { StructuredData } from './structured-data';
import type { Content, ContentType } from '@lib/types/contents';

export type Article = Pick<
  Content,
  'tags' | 'banner' | 'publishedAt' | 'lastUpdatedAt'
> & {
  type: ContentType;
};

type MainLayoutProps = {
  tag?: string;
  title: string;
  image?: string;
  article?: Article;
  description: string;
};

export function SEO({
  title,
  article,
  description
}: MainLayoutProps): React.JSX.Element {
  const { theme } = useTheme();
  const { asPath } = useRouter();

  const ogImageQuery = new URLSearchParams();

  ogImageQuery.set('title', title);
  ogImageQuery.set('description', description ?? 'Description');

  const { type, tags, banner, publishedAt, lastUpdatedAt } = article ?? {};

  if (article) {
    ogImageQuery.set('type', type as string);
    ogImageQuery.set('article', 'true');
    ogImageQuery.set(
      'image',
      frontendEnv.NEXT_PUBLIC_URL + (banner?.src as string)
    );
  }

  const isHomepage = asPath === '/';
  const isDarkMode = theme === 'dark';

  const { colorScheme, themeColor } = systemTheme[+isDarkMode];

  const ogTitle = `${title} | ${
    isHomepage ? 'Neezar - Fullstack Developer' : 'Neezar'
  }`;

  const ogImageUrl = `${frontendEnv.NEXT_PUBLIC_BACKEND_URL}/og?${ogImageQuery.toString()}`;

  const ogUrl = `${frontendEnv.NEXT_PUBLIC_URL}${isHomepage ? '' : asPath}`;

  return (
    <>
      <Head>
        <title>{ogTitle}</title>
        <meta name='description' content={description} />
        <meta name='keywords' content={Array.isArray(tags) ? tags.join(', ') : tags} />
        <meta name='color-scheme' content={colorScheme} />
        <meta name='theme-color' content={themeColor} />
        <meta name='author' content='Neezar' />
        <meta name='generator' content='Next.js' />
        <meta name='robots' content='index, follow' />
        <meta name='googlebot' content='index, follow' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <link rel='canonical' href={ogUrl} />
        <meta name='twitter:title' content={ogTitle} />
        <meta name='twitter:description' content={description} />
        <meta name='twitter:image' content={ogImageUrl} />
        <meta name='twitter:image:alt' content={ogTitle} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@neezar_tech' />
        <meta name='twitter:creator' content='@neezar_tech' />
        <meta property='og:title' content={ogTitle} />
        <meta property='og:description' content={description} />
        <meta property='og:url' content={ogUrl} />
        <meta property='og:image' content={ogImageUrl} />
        <meta property='og:image:alt' content={ogTitle} />
        <meta property='og:image:type' content='image/png' />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='600' />
        <meta property='og:locale' content='en_US' />
        <meta property='og:site_name' content='neezar.tech' />
        <meta property='og:determiner' content='auto' />
        {article ? (
          <>
            <meta property='og:type' content='article' />
            <meta property='og:section' content='Programming' />
            <meta property='article:author' content='Neezar' />
            <meta property='article:published_time' content={publishedAt} />
            {Array.isArray(tags) 
              ? tags.map((tag) => (
                  <meta property='article:tag' content={tag} key={tag} />
                ))
              : (tags ? tags.split(',').map((tag) => (
                  <meta property='article:tag' content={tag.trim()} key={tag} />
                )) : [])
            }
            {lastUpdatedAt && (
              <meta property='article:modified_time' content={lastUpdatedAt} />
            )}
          </>
        ) : (
          <meta property='og:type' content='website' />
        )}
      </Head>
      <StructuredData
        type={article ? 'article' : isHomepage ? 'person' : 'website'}
        title={title}
        description={description}
        image={banner?.src}
        datePublished={publishedAt}
        dateModified={lastUpdatedAt}
        tags={(() => {
          if (Array.isArray(tags)) return tags;
          if (typeof tags === 'string' && tags.length > 0) {
            return tags.split(',').map(tag => tag.trim());
          }
          return [];
        })()}
      />
    </>
  );
}

type SystemTheme = {
  themeColor: string;
  colorScheme: 'dark' | 'light';
};

const systemTheme: SystemTheme[] = [
  {
    themeColor: '#FFFFFF',
    colorScheme: 'light'
  },
  {
    themeColor: '#222222',
    colorScheme: 'dark'
  }
];
