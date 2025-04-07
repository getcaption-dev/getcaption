// ✅ pages/_app.js
import '../styles/globals.css'
import { Poppins } from 'next/font/google'
import { SessionProvider } from 'next-auth/react';

const poppins = Poppins({
  weight: ['400', '700'],
  subsets: ['latin'],
});

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <main className={poppins.className} style={{
        minHeight: '100vh',
        backgroundColor: '#0A0A0A',
        backgroundImage: 'url("/background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        fontFamily: 'Pretendard, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}