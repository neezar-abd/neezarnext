import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(): React.JSX.Element {
  return (
    <Html lang='en'>
      <Head>
        {/* DNS Prefetch untuk performa lebih baik */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Preconnect untuk resource penting */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon dan App Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="192x192" href="/logo192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/logo512.png" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Microsoft specific */}
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Schema.org markup untuk website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Neezar",
              "url": "https://neezar.tech",
              "jobTitle": "Fullstack Developer",
              "description": "Passionate fullstack developer specializing in modern web technologies",
              "sameAs": [
                "https://github.com/neezar-abd",
                "https://linkedin.com/in/neezar"
              ]
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
