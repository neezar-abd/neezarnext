import Link from 'next/link';
import { useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useInView } from 'framer-motion';
import { clsx } from 'clsx';
import { ThemeSwitch } from '@components/common/theme-switch';
import type { CustomSession } from '@lib/types/api';

export function Header(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '40px 0px 0px', amount: 'all' });

  const { pathname } = useRouter();
  const { data: session } = useSession() as { data: CustomSession | null };

  const baseRoute = '/' + pathname.split('/')[1];

  // Always show admin link, but check auth in the admin page itself
  const navLinksWithAdmin = [...navLinks, { name: 'Admin', href: '/admin' }];

  return (
    <>
      <div ref={ref} />
      <header
        className={clsx(
          'sticky top-0 z-20 w-full bg-white/60 backdrop-blur-md transition dark:bg-black/60',
          !inView && 'shadow-sm dark:shadow-gray-900'
        )}
      >
        <div className='gradient-background h-2' />
        <div className='layout flex items-center justify-between py-4'>
          <nav className='flex gap-4 font-medium'>
            {navLinksWithAdmin.map(({ name, href }) => (
              <Link
                className={clsx(
                  'smooth-tab text-xs hover:text-accent-main hover:transition-colors md:text-base',
                  baseRoute === href && 'gradient-title !text-transparent',
                  name === 'Admin' && 'text-red-500 hover:text-red-400 font-semibold'
                )}
                href={href}
                key={name}
              >
                {name}
              </Link>
            ))}
          </nav>
          <ThemeSwitch />
        </div>
      </header>
    </>
  );
}

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: 'Projects', href: '/projects' },
  { name: 'Guestbook', href: '/guestbook' },
  { name: 'About', href: '/about' }
] as const;
