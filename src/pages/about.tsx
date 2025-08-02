import { motion } from 'framer-motion';
import {
  SiFirebase,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss
} from 'react-icons/si';
import { setTransition } from '@lib/transition';
import { getAboutContent } from '@lib/page-content';
import { SEO } from '@components/common/seo';
import { Accent } from '@components/ui/accent';
import { Tooltip } from '@components/ui/tooltip';
import { CustomLink } from '@components/link/custom-link';
import type { GetStaticPropsResult, InferGetStaticPropsType } from 'next';
import type { IconType } from 'react-icons';
import type { AboutContent, Certification } from '@lib/page-content';

export default function About({
  aboutContent
}: InferGetStaticPropsType<typeof getStaticProps>): React.JSX.Element {
  return (
    <main className='layout min-h-screen'>
      <SEO title={aboutContent.title} description={`About ${aboutContent.name}`} />
      <section className='grid gap-2'>
        <motion.h2
          className='text-xl font-bold md:text-3xl'
          {...setTransition()}
        >
          {aboutContent.title}
        </motion.h2>
        <motion.h1
          className='text-2xl font-bold md:text-4xl'
          {...setTransition({ delayIn: 0.1 })}
        >
          <Accent>{aboutContent.name}</Accent>
        </motion.h1>
      </section>
      <section className='mt-4'>
        <motion.article
          className='prose dark:prose-invert'
          {...setTransition({ delayIn: 0.2 })}
        >
          <div className="whitespace-pre-wrap">
            {aboutContent.content}
          </div>
        </motion.article>
      </section>
      <section className='mt-12 grid gap-4'>
                <motion.h2
          className='mt-8 text-2xl font-bold md:text-4xl'
          {...setTransition({ delayIn: 0.3 })}
        >
          <Accent>Favorite Tech Stack</Accent>
        </motion.h2>
        <motion.ul
          className='mt-4 grid gap-4 md:grid-cols-2'
          {...setTransition({ delayIn: 0.4 })}
        >
          {aboutContent.techStack.map((tech, index) => {
            const techInfo = getTechStackInfo(tech);
            return (
              <Tooltip
                key={index}
                tip={techInfo.tip}
              >
                <li className='group grid place-items-center gap-2 rounded-md p-6 transition group-hover:bg-gray-100 dark:group-hover:bg-gray-800 sm:p-10'>
                  <a href={techInfo.href} target="_blank" rel="noopener noreferrer" className="grid place-items-center gap-2">
                    <techInfo.Icon className='text-6xl group-hover:text-accent-start' />
                    <span className='font-medium'>{tech}</span>
                  </a>
                </li>
              </Tooltip>
            );
          })}
        </motion.ul>
      </section>

      {/* Certifications Section */}
      <section className='mt-12'>
        <motion.h2
          className='text-2xl font-bold md:text-4xl'
          {...setTransition({ delayIn: 0.5 })}
        >
          <Accent>Certifications</Accent>
        </motion.h2>
        <motion.div
          className='mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3'
          {...setTransition({ delayIn: 0.6 })}
        >
          {aboutContent.certifications.map((cert, index) => (
            <div
              key={cert.id}
              className='group rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-lg hover:border-accent-main'
            >
              <div className='aspect-video w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800'>
                <img
                  src={cert.imageUrl}
                  alt={cert.title}
                  className='h-full w-full object-cover transition-transform group-hover:scale-105'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/placeholder-cert.png';
                  }}
                />
              </div>
              <div className='mt-3'>
                <h3 className='font-semibold text-lg line-clamp-2'>{cert.title}</h3>
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{cert.issuer}</p>
                <p className='text-xs text-gray-500 dark:text-gray-500 mt-1'>{cert.date}</p>
                {cert.description && (
                  <p className='text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2'>
                    {cert.description}
                  </p>
                )}
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-block mt-3 text-sm text-accent-main hover:text-accent-start transition-colors'
                  >
                    View Credential →
                  </a>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}

export async function getStaticProps(): Promise<
  GetStaticPropsResult<{
    aboutContent: AboutContent;
  }>
> {
  const aboutContent = getAboutContent();

  return {
    props: {
      aboutContent
    }
  };
}

type FavoriteTechStack = {
  tip: string;
  name: string;
  href: string;
  Icon: IconType;
};

const defaultTechStack: FavoriteTechStack[] = [
  {
    tip: 'a React framework that makes it easy to build static and server-side rendered applications.',
    name: 'Next.js',
    href: 'https://nextjs.org',
    Icon: SiNextdotjs
  },
  {
    tip: 'a strongly typed language that builds on JavaScript, giving you better tooling at any scale.',
    name: 'TypeScript',
    href: 'https://www.typescriptlang.org',
    Icon: SiTypescript
  },
  {
    tip: 'an app development platform that helps you build and grow apps and games users love.',
    name: 'Firebase',
    href: 'https://firebase.google.com',
    Icon: SiFirebase
  },
  {
    tip: 'a utility-first CSS framework that helps you build custom designs without ever leaving your JSX.',
    name: 'Tailwind CSS',
    href: 'https://tailwindcss.com',
    Icon: SiTailwindcss
  }
];

function getTechStackInfo(techName: string): FavoriteTechStack {
  const found = defaultTechStack.find(tech => 
    tech.name.toLowerCase() === techName.toLowerCase()
  );
  
  return found || {
    tip: `${techName} - a technology I love working with.`,
    name: techName,
    href: '#',
    Icon: SiNextdotjs // default icon
  };
}
