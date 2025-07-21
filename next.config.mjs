// @ts-check

/* eslint-disable @typescript-eslint/explicit-function-return-type */

import nextMDX from '@next/mdx';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

/** @type {import('rehype-autolink-headings').Options} */
const rehypeAutolinkHeadingsOptions = {
  behavior: 'wrap'
};

/** @type {import('rehype-pretty-code').Options} */
const rehypePrettyCodeOptions = {
  // Use one of Shiki's packaged themes
  theme: {
    light: 'light-plus',
    dark: 'dark-plus'
  },

  // Keep the background or use a custom background color?
  keepBackground: false,

  onVisitLine(element) {
    // Add a custom class to each line
    element.properties.className = ['line'];
  },

  onVisitHighlightedLine(element) {
    // Add a custom class to each highlighted line
    element.properties.className?.push('highlighted');
  },

  onVisitHighlightedChars(element) {
    // Add a custom class to each highlighted character
    element.properties.className = ['word'];
  }
};

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    // If you use remark-gfm, you'll need to use next.config.mjs
    // as the package is ESM only
    // https://github.com/remarkjs/remark-gfm#install
    remarkPlugins: [],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, rehypeAutolinkHeadingsOptions],
      [rehypePrettyCode, rehypePrettyCodeOptions]
    ],
    // If you use `MDXProvider`, uncomment the following line.
    providerImportSource: '@mdx-js/react'
  }
});

export default withMDX({
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during builds for Vercel deployment
    ignoreDuringBuilds: true
  },
  typescript: {
    // Allow production builds to successfully complete even if your project has type errors
    ignoreBuildErrors: true
  },
  env: {
    // Provide default values for required environment variables
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || 'https://localhost:3000',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3000',
    NEXT_PUBLIC_OWNER_BEARER_TOKEN: process.env.NEXT_PUBLIC_OWNER_BEARER_TOKEN || 'UMdqTUGrYRmItmGPvEx7GK1okH6zdr0n'
  },
  images: {
    remotePatterns: [
      new URL('https://i.scdn.co/image/**'),
      new URL('https://avatars.githubusercontent.com/u/**?v=4')
    ]
  },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx']
});
