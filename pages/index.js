// ✅ getcaption/pages/index.js
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [tone, setTone] = useState('감성적인');
  const [purpose, setPurpose] = useState('유튜브 숏츠 제목');
  const [length, setLength] = useState('보통');
  const [captions, setCaptions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateCaptions = async () => {
    if (!keyword.trim()) return;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, tone, purpose, length }),
      });
      const data = await response.json();
      if (data.captions) setCaptions(data.captions);
    } catch (error) {
      console.error('문구 생성 실패:', error);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch(err => console.error('복사 실패:', err));
  };

  return (
    <main style={{
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
      <header style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', boxSizing: 'border-box'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white' }}>
          <Image src="/smallLogo.png" alt="Logo" width={40} height={40} priority />
          <span style={{ marginLeft: '10px', fontSize: '1.5rem', fontWeight: 700 }}>GetCaption</span>
        </Link>
        <nav style={{ display: 'flex', gap: '20px' }}>
          <Link href="/about" style={{ textDecoration: 'none', color: 'white', fontWeight: 500 }}>About</Link>
          <Link href="/contact" style={{ textDecoration: 'none', color: 'white', fontWeight: 500 }}>Contact</Link>
        </nav>
      </header>

      <section style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px'
      }}>
        <Image src="/gcWChar_White.svg" alt="GetCaption Logo" width={200} height={0} style={{ height: 'auto', marginBottom: '30px' }} priority />

        <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '10px' }}>당신의 창의성을 현실로,</h1>
        <h2 style={{ fontSize: '2rem', fontWeight: 400, marginBottom: '40px' }}>
          <span style={{ fontWeight: 700 }}>GetCaption</span>과 함께.
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="키워드를 입력하세요"
            style={{ padding: '12px 18px', borderRadius: '10px', border: '1px solid #ccc', backgroundColor: 'white', width: '250px', fontSize: '1rem', color: '#333', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
          />

          <select value={tone} onChange={(e) => setTone(e.target.value)} style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid #ccc', color: '#333', fontSize: '1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <option>감성적인</option>
            <option>명확한</option>
            <option>세련된</option>
            <option>발랄한</option>
            <option>강렬한</option>
            <option>부드러운</option>
          </select>

          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid #ccc', color: '#333', fontSize: '1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <option>유튜브 숏츠 제목</option>
            <option>유튜브 제목</option>
            <option>인스타그램 캡션</option>
            <option>쇼핑몰 광고</option>
            <option>자기소개 문구</option>
            <option>블로그 헤드라인</option>
            <option>제품 설명 문구</option>
            <option>브랜드 슬로건</option>
            <option>이메일 제목</option>
          </select>

          <select value={length} onChange={(e) => setLength(e.target.value)} style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid #ccc', color: '#333', fontSize: '1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <option>보통</option>
            <option>짧게</option>
          </select>

          <button onClick={generateCaptions} style={{ padding: '12px 20px', backgroundColor: '#6366F1', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 5px rgba(99,102,241,0.5)', transition: 'background-color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#818CF8'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366F1'}>
            문구 생성
          </button>
        </div>

        <div style={{ marginTop: '20px', width: '100%', maxWidth: '600px' }}>
          {captions.map((cap, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '15px 20px', borderRadius: '10px', marginBottom: '15px', backdropFilter: 'blur(4px)' }}>
              <span style={{ textAlign: 'left' }}>{cap}</span>
              <button onClick={() => copyToClipboard(cap, i)} style={{ padding: '8px 14px', backgroundColor: copiedIndex === i ? '#10B981' : '#6366F1', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'background-color 0.3s' }}>
                {copiedIndex === i ? '✅ 복사 완료' : '복사'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}