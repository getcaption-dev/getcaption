// ✅ getcaption/pages/index.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import Select from 'react-select';

const purposeOptions = [
  { value: '유튜브 쇼츠 제목', label: '유튜브 쇼츠 제목 🔥' },
  { value: '유튜브 롱폼 제목', label: '유튜브 롱폼 제목 🔥' },
  { value: '인스타그램 캡션', label: '인스타그램 캡션' },
  { value: '쇼핑몰 광고', label: '쇼핑몰 광고' },
  { value: '자기소개 문구', label: '자기소개 문구' },
  { value: '블로그 헤드라인', label: '블로그 헤드라인' },
  { value: '제품 설명 문구', label: '제품 설명 문구' },
  { value: '브랜드 슬로건', label: '브랜드 슬로건' },
  { value: '이메일 제목', label: '이메일 제목' },
];

const toneOptions = [
  { value: '직관적인', label: '직관적인 🔥' },
  { value: '자극적인', label: '자극적인 ⭐' },
  { value: '감성적인', label: '감성적인' },
  { value: '세련된', label: '세련된' },
  { value: '발랄한', label: '발랄한' },
  { value: '부드러운', label: '부드러운' },
];

const lengthOptions = [
  { value: '보통', label: '보통 🔥' },
  { value: '짧게', label: '짧게' },
];

const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: 'white',
    borderRadius: '10px',
    borderColor: '#ccc',
    fontSize: '1rem',
    minWidth: '180px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
    color: 'black',
    fontWeight: state.isSelected ? 600 : 400,
    fontSize: '0.95rem',
    cursor: 'pointer',
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  singleValue: (base) => ({
    ...base,
    color: '#333',
  }),
};

const LabeledSelect = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
    <label style={{ fontSize: '0.9rem', marginBottom: '4px', marginLeft: '4px' }}>{label}</label>
    <Select {...props} />
  </div>
);

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [tone, setTone] = useState(toneOptions[0]);
  const [purpose, setPurpose] = useState(purposeOptions[0]);
  const [length, setLength] = useState(lengthOptions[0]);
  const [captions, setCaptions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [invalid, setInvalid] = useState(false);


  const generateCaptions = async () => {
    if (!keyword.trim()) {
      setInvalid(true);
      setTimeout(() => setInvalid(false), 500);
      return;
    }
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, tone: tone.value, purpose: purpose.value, length: length.value }),
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
    <>
      <Head>
        <title>GetCaption – 유튜브 제목, 인스타 캡션, 쇼핑몰 문구 AI</title>
        <meta name="description" content="유튜브 제목, 쇼츠 제목, 인스타그램 캡션, 쇼핑몰 문구까지. GetCaption은 상황에 맞는 문구를 AI가 자동으로 추천해줍니다." />
        <meta property="og:title" content="GetCaption – 유튜브 제목, 인스타 캡션, 쇼핑몰 문구 AI" />
        <meta property="og:description" content="유튜브, 인스타, 쇼핑몰에서 바로 사용할 수 있는 고급 문구를 AI로 추천받아보세요." />
        <meta property="og:url" content="https://getcaption.ai" />
        <meta property="og:image" content="/og-image.png" />
      </Head>
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

          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '10px' }}>당신의 창의성을 빠르게 현실로,</h1>
          <h2 style={{ fontSize: '2rem', fontWeight: 400, marginBottom: '40px' }}>
            <span style={{ fontWeight: 700 }}>GetCaption</span>과 함께.
          </h2>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 400, marginBottom: '40px' }}>
            유튜브 제목, 쇼핑몰 문구, 인스타 캡션 전문 AI 생성기
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '30px', width: '90%', maxWidth: '600px' }}>
            <LabeledSelect label="문장 톤" options={toneOptions} value={tone} onChange={setTone} styles={customSelectStyles} />
            <LabeledSelect label="문장 목적" options={purposeOptions} value={purpose} onChange={setPurpose} styles={customSelectStyles} />
            <LabeledSelect label="문장 길이" options={lengthOptions} value={length} onChange={setLength} styles={customSelectStyles} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', width: '100%' }}>
              <label style={{ fontSize: '0.9rem', marginBottom: '4px', marginLeft: '4px' }}>키워드 입력</label>
              <textarea
                rows={3}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="예: 고양이 장난감, 여름 여행"
                style={{
                  width: '560px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  backgroundColor: invalid ? '#fff5f5' : 'white', // 살짝 붉은 배경
                  fontSize: '1rem',
                  color: '#333',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  resize: 'none',
                  marginBottom: '10px',
                  transition: 'all 0.4s ease', // 부드럽게 복원
                  animation: invalid ? 'shake 0.3s ease' : 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <button onClick={generateCaptions} style={{ padding: '12px 20px', backgroundColor: '#6366F1', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 5px rgba(99,102,241,0.5)', transition: 'background-color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#818CF8'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366F1'}>
                  문구 생성
                </button>
              </div>
            </div>
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

        
      <style jsx global>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </>
  );
  
}

