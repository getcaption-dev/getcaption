import Head from 'next/head';
import Link from 'next/link';

export default function Contact() {
  return (
    <div>
      <Head>
        <title>Contact - GetCaption</title>
      </Head>

      <main style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Contact Us</h1>
        <p>Email: getcaption.service@gmail.com</p>
        <nav style={{ marginTop: '30px' }}>
          <Link href="/">Home</Link> | <Link href="/about">About</Link>
        </nav>
      </main>
    </div>
  );
}
