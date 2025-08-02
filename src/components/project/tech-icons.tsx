import { IoLogoVercel } from 'react-icons/io5';
import {
  SiGit,
  SiSass,
  SiReact,
  SiNotion,
  SiMongodb,
  SiFirebase,
  SiMarkdown,
  SiPrettier,
  SiNodedotjs,
  SiNextdotjs,
  SiJavascript,
  SiTypescript,
  SiTailwindcss,
  SiGoogleanalytics
} from 'react-icons/si';
import { Tooltip } from '../ui/tooltip';
import type { IconType } from 'react-icons';

export function TechIcons({ tags }: { tags: string | string[] }): React.JSX.Element {
  // Ensure tags is properly handled - be very defensive
  let techsArray: string[] = [];
  
  try {
    if (Array.isArray(tags)) {
      techsArray = tags;
    } else if (typeof tags === 'string' && tags.length > 0) {
      techsArray = tags.split(',').map(tag => tag.trim());
    }
  } catch (error) {
    console.warn('Error processing tags:', error, tags);
    return <ul className='mt-2 flex gap-2'></ul>;
  }

  // Filter for valid techs without using array methods that might fail
  const validTechs: string[] = [];
  for (const tech of techsArray) {
    if (tech && techList[tech]) {
      validTechs.push(tech);
    }
  }

  return (
    <ul className='mt-2 flex gap-2 [&>li:first-child>div]:-translate-x-1/3'>
      {validTechs.map((tech) => {
        const { name, Icon } = techList[tech];

        return (
          <Tooltip
            className='text-xl text-gray-700 dark:text-gray-200'
            tooltipClassName='group-hover:-translate-y-[3.75rem]'
            tag='li'
            tip={name}
            key={name}
          >
            <Icon />
          </Tooltip>
        );
      })}
    </ul>
  );
}

type TechList = Record<string, { name: string; Icon: IconType }>;

const techList: TechList = {
  react: {
    name: 'React',
    Icon: SiReact
  },
  nextjs: {
    name: 'Next.js',
    Icon: SiNextdotjs
  },
  tailwindcss: {
    name: 'Tailwind CSS',
    Icon: SiTailwindcss
  },
  scss: {
    name: 'SCSS',
    Icon: SiSass
  },
  javascript: {
    name: 'JavaScript',
    Icon: SiJavascript
  },
  typescript: {
    name: 'TypeScript',
    Icon: SiTypescript
  },
  nodejs: {
    name: 'Node.js',
    Icon: SiNodedotjs
  },
  firebase: {
    name: 'Firebase',
    Icon: SiFirebase
  },
  mongodb: {
    name: 'MongoDB',
    Icon: SiMongodb
  },
  swr: {
    name: 'SWR',
    Icon: IoLogoVercel
  },
  mdx: {
    name: 'MDX',
    Icon: SiMarkdown
  },
  prettier: {
    name: 'Prettier',
    Icon: SiPrettier
  },
  analytics: {
    name: 'Google Analytics',
    Icon: SiGoogleanalytics
  },
  git: {
    name: 'Git',
    Icon: SiGit
  },
  notion: {
    name: 'Notion API',
    Icon: SiNotion
  }
};
