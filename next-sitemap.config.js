/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://neezar.tech',
  generateRobotsxt: false, // We already have robots.txt
  generateIndexSitemap: false,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin*', '/api/*', '/404'],
  
  // Custom transformation for dynamic routes
  transform: async (config, path) => {
    // Custom priority for different pages
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.includes('/blog/')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.includes('/projects/')) {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path === '/about' || path === '/projects' || path === '/blog') {
      priority = 0.9;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/_next/', '/404'],
      },
    ],
    additionalSitemaps: [
      'https://neezar.tech/sitemap.xml',
    ],
  },
};
