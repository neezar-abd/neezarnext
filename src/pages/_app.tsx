import '@styles/globals.scss';

import { configure, start, done } from 'nprogress';
import { AnimatePresence } from 'framer-motion';
import { Router, useRouter } from 'next/router';
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { Layout } from '@components/layout/layout';
import { AppHead } from '@components/common/app-head';
import type { AppProps } from 'next/app';

configure({ showSpinner: false });

Router.events.on('routeChangeStart', start);
Router.events.on('routeChangeError', done);
Router.events.on('routeChangeComplete', done);

// Audio notification with better error handling
let popAudio: HTMLAudioElement | null = null;

if (typeof window !== 'undefined') {
  popAudio = new Audio('/assets/pop.mp3');
  popAudio.volume = 0.3; // Set volume to 30%
  popAudio.preload = 'auto';
}

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps): React.JSX.Element {
  const { pathname } = useRouter();

  useEffect(() => {
    // Play notification sound on route change
    const playNotification = async () => {
      try {
        if (popAudio) {
          // Reset audio to start
          popAudio.currentTime = 0;
          await popAudio.play();
        }
      } catch (error) {
        // Many browsers block autoplay, this is expected
        console.log('Audio notification blocked by browser policy');
      }
    };

    playNotification();
  }, [pathname]);

  return (
    <>
      <AppHead />
      <SessionProvider session={session}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem={false}>
          <Layout>
            <AnimatePresence mode='wait'>
              <Component {...pageProps} key={pathname} />
            </AnimatePresence>
          </Layout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--tw-color-gray-800)',
                color: 'var(--tw-color-white)',
                borderRadius: '8px',
                border: '1px solid var(--tw-color-gray-700)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--tw-color-green-400)',
                  secondary: 'var(--tw-color-white)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--tw-color-red-400)',
                  secondary: 'var(--tw-color-white)',
                },
              },
            }}
          />
        </ThemeProvider>
      </SessionProvider>
      <Analytics />
    </>
  );
}
