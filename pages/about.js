import Head from 'next/head';
import Link from 'next/link';

export default function About() {
  return (
    <div>
      <Head>
        <title>About - GetCaption</title>
      </Head>

      <main style={{ textAlign: 'center', padding: '50px' }}>
        <h1>About GetCaption</h1>
        <p>
          GetCaption은 누구나 쉽고 빠르게, 당신만의 이야기를 담은 한 줄을 만들어드립니다.  
          짧지만 강력한 문장으로, 당신의 콘텐츠를 더욱 빛나게 하세요.
        </p>
        <nav style={{ marginTop: '30px' }}>
          <Link href="/">Home</Link> | <Link href="/contact">Contact</Link>
        </nav>
      </main>
    </div>
  );
}
