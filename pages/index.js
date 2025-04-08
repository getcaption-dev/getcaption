// ✅ getcaption/pages/index.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import Select from 'react-select';
import { signIn, signOut, useSession } from 'next-auth/react';

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

const saveCaption = async (text, index) => {
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    if (data.success) {
      setSavedIndex((prev) => [...prev, index]); // 저장 완료된 인덱스 추가
    } else {
      alert('❌ 저장 실패: ' + data.error);
    }
  } catch (error) {
    console.error('저장 중 오류:', error);
    alert('❌ 저장 중 오류가 발생했습니다.');
  }
};

export default function Home() {
  const { data: session } = useSession();
  const [keyword, setKeyword] = useState('');
  const [tone, setTone] = useState(toneOptions[0]);
  const [purpose, setPurpose] = useState(purposeOptions[0]);
  const [length, setLength] = useState(lengthOptions[0]);
  const [captions, setCaptions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const [loadingRephrase, setLoadingRephrase] = useState(false);
  const [savedIndex, setSavedIndex] = useState([]);
  const [savedCaptions, setSavedCaptions] = useState([]);
  const [downloadType, setDownloadType] = useState('txt'); // 'txt' or 'csv'
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isHoveringGoogle, setIsHoveringGoogle] = useState(false);
  const [profileBoxOpen, setProfileBoxOpen] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  

  useEffect(() => {
    if (captions.length > 0) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = ''; // 대부분의 브라우저는 이것만 있으면 경고 띄움
      };
  
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [captions]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = JSON.parse(localStorage.getItem('generationLimit') || '{}');
  
    if (stored.date !== today) {
      localStorage.setItem('generationLimit', JSON.stringify({ count: 0, date: today }));
      setGenerationCount(0);
      setIsLimitReached(false);
    } else {
      setGenerationCount(stored.count || 0);
      setIsLimitReached((stored.count || 0) >= 5);
    }
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
  
    const check = async () => {
      if (session) {
        const res = await fetch('/api/checkUsage');
        const data = await res.json();
        if (res.ok) {
          setGenerationCount(data.count);
          setIsLimitReached(data.count >= 5);
        }
      } else {
        const res = await fetch('/api/checkAnonUsage');
        const data = await res.json();
        if (res.ok) {
          setGenerationCount(data.count);
          setIsLimitReached(data.count >= 5);
        }
      }
    };
  
    check();
  }, [session]);

  const generateCaptions = async () => {
    if (isLimitReached) return;

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
      if (data.captions) {
        setCaptions(data.captions); 
        // ✅ 로그인 여부에 따라 분기 처리
        console.error('트랙시작');
        
        let track;
        if (session) {
          track = await fetch('/api/trackUsage', { method: 'POST' });
        } else {
          track = await fetch('/api/trackAnonUsage', { method: 'POST' });
        }

        if (track.ok) {
          setGenerationCount((prev) => prev + 1);
          if (generationCount + 1 >= 5) setIsLimitReached(true);
        } else {
          console.error('사용 기록 저장 실패');
        }
      }
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

  const handleBatchRephrase = async () => {
    setLoadingRephrase(true);
    try {
      const results = await Promise.all(
        captions.map(async (text) => {
          const res = await fetch('/api/rephrase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, tone: '부드럽게' }),
          });
          const data = await res.json();
          return data.rephrased || text;
        })
      );
      setCaptions(results); // 💥 기존 상태 자체를 덮어씀
    } catch (err) {
      console.error('리프레이징 실패:', err);
    }
    setLoadingRephrase(false);
  };
    
  const saveCaptionLocally = (text) => {
    if (!savedCaptions.includes(text)) {
      setSavedCaptions((prev) => [...prev, text]);
    }
  };
  
  const handleDownload = () => {
    const content = downloadType === 'csv'
      ? savedCaptions.map((c) => `"${c.replace(/"/g, '""')}"`).join(',\n')
      : savedCaptions.join('\n');
  
    // UTF-8 BOM 추가 (엑셀/메모장 한글 깨짐 방지용)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/plain;charset=utf-8' });
  
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saved_captions.${downloadType}`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleCopyAll = () => {
    if (savedCaptions.length === 0) return;
  
    const joined = savedCaptions.join('\n');
    navigator.clipboard.writeText(joined)
      .then(() => {
        alert('📋 저장된 문장들이 클립보드에 복사되었습니다!');
      })
      .catch((err) => {
        console.error('복사 실패:', err);
        alert('❌ 복사 실패!');
      });
  };

  const removeSavedCaption = (index) => {
    setSavedCaptions((prev) => prev.filter((_, i) => i !== index));
  };

  const clearSavedCaptions = () => {
    const confirmed = window.confirm('⚠ 정말 모든 문장을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (confirmed) {
      setSavedCaptions([]);
    }
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
      <main style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', backgroundImage: 'url("/background.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', color: 'white', fontFamily: 'Pretendard, sans-serif', display: 'flex', flexDirection: 'column' }}>
        <header style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', boxSizing: 'border-box' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white' }}>
            <Image src="/smallLogo.png" alt="Logo" width={40} height={40} priority />
            <span style={{ marginLeft: '10px', fontSize: '1.5rem', fontWeight: 700 }}>GetCaption</span>
          </Link>
          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/about" style={{ textDecoration: 'none', color: 'white', fontWeight: 500 }}>About</Link>
            <Link href="/contact" style={{ textDecoration: 'none', color: 'white', fontWeight: 500 }}>Contact</Link>
            {!session ? (
              <button
                onClick={() => setLoginModalOpen(true)}
                style={{
                  background: '#000',
                  color: '#1F2937',
                  backgroundColor: '#E5E7EB',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E5E7EB')}
              >
                로그인
              </button>
            ) : (
              <div
                onClick={() => setProfileBoxOpen(!profileBoxOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#E5E7EB',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  color: '#1F2937',
                  position: 'relative'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E5E7EB')}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#93C5FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600
                }}>
                  {session.user.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem' }}>{session.user.email}</span>
                <span>{profileBoxOpen ? '▲' : '▼'}</span>

                {profileBoxOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    padding: '12px',
                    minWidth: '160px',
                    zIndex: 1000
                  }}>
                    <div style={{
                      padding: '8px 12px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    onClick={() => alert('계정 설정 페이지로 이동 예정')}>
                      ⚙️ 계정 설정
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    onClick={() => alert('구독 관리 페이지로 이동 예정')}>
                      💳 구독 관리
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    onClick={() => signOut()}>
                      🚪 로그아웃
                    </div>
                  </div>
                )}
              </div>
            )}
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
              <button
                onClick={generateCaptions}
                disabled={isLimitReached}
                style={{
                  padding: '12px 20px',
                  backgroundColor: isLimitReached ? '#9CA3AF' : '#6366F1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: isLimitReached ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 5px rgba(99,102,241,0.5)',
                  transition: 'background-color 0.3s'
                }}>
                {isLimitReached ? '⛔ 오늘은 더 이상 생성할 수 없어요' : '문구 생성'}
              </button>
              </div>
              {generationCount < 5 && (
                  <p style={{
                    fontSize: '0.9rem',
                    color: generationCount >= 4 ? '#F59E0B' : '#D1D5DB',
                    marginTop: '8px',
                    textAlign: 'center'
                  }}>
                    오늘 {generationCount}/5회 사용하셨습니다
                  </p>
                )}

                {isLimitReached && (
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#F87171',
                    marginTop: '8px',
                    textAlign: 'center'
                  }}>
                    ⛔ 무료 플랜은 하루 5회까지만 생성할 수 있어요
                  </p>
                )}
            </div>
          </div>
          
          <div style={{ marginTop: '20px', width: '100%', maxWidth: '600px' }}>
            {captions.map((cap, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '15px 20px',
                  borderRadius: '10px',
                  marginBottom: '15px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ textAlign: 'left', flex: 1 }}>{cap}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => copyToClipboard(cap, i)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: copiedIndex === i ? '#10B981' : '#6366F1',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      {copiedIndex === i ? '✅ 복사 완료' : '복사'}
                    </button>
                    <button
                      onClick={() => saveCaptionLocally(cap)}
                      disabled={savedCaptions.includes(cap)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: savedCaptions.includes(cap) ? '#10B981' : '#F97316',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: savedCaptions.includes(cap) ? 'default' : 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      {savedCaptions.includes(cap) ? '✅ 완료' : '저장'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {captions.length > 0 && (
            <button
              onClick={handleBatchRephrase}
              style={{
                marginTop: '20px',
                padding: '12px 20px',
                backgroundColor: loadingRephrase ? '#9CA3AF' : '#9c990e',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: loadingRephrase ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              }}
              disabled={loadingRephrase}
            >
              {loadingRephrase ? '부드럽게 다시 쓰는 중...' : '생성된 문장 모두 부드럽게 다시 쓰기'}
            </button>
          )}
        </section>
        {savedCaptions.length > 0 && (
          <div style={{
            position: 'fixed',
            right: '20px',
            top: '100px',
            width: '300px',
            background: '#1F2937',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}>
            <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '10px' }}>📋 저장된 문장</h3>
            
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '15px' }}>
              {savedCaptions.map((txt, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                  fontSize: '0.95rem',
                  color: '#E5E7EB'
                }}>
                  <span style={{ flex: 1 }}>• {txt}</span>
                  <button
                    onClick={() => removeSavedCaption(idx)}
                    style={{
                      marginLeft: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#F87171',
                      cursor: 'pointer',
                      fontSize: '1rem',
                    }}
                  >
                    ✖
                  </button>
                </li>
              ))}
            </ul>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '10px',
              marginTop: '15px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <button
                  onClick={() => setDownloadType('txt')}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    backgroundColor: downloadType === 'txt' ? '#3B82F6' : '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  .txt
                </button>
                <button
                  onClick={() => setDownloadType('csv')}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    backgroundColor: downloadType === 'csv' ? '#3B82F6' : '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  .csv
                </button>
              </div>
              <button
                onClick={handleCopyAll}
                style={{
                  padding: '8px 12px',
                  background: '#4B5563',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                📋 전체 복사
              </button>
              <button onClick={handleDownload} style={{
                padding: '8px 12px',
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                📥 다운로드
              </button>

              <button
                onClick={clearSavedCaptions}
                style={{
                  padding: '8px 12px',
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🗑️ 전체 삭제
              </button>
            </div>
          </div>
        )}

        {loginModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px 30px',
              width: '360px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <img
                src="/gcWChar.svg"
                alt="GetCaption Logo"
                style={{
                  width: '75%', // ✅ 고정
                  height: '60px',
                  marginBottom: '20px'
                }}
              />

              <h2 style={{
                fontSize: '1.2rem',
                color: '#4B5563',
                fontWeight: 700,
                marginBottom: '30px'
              }}>
                로그인하여 혜택 늘리기
              </h2>

              <button
                onClick={() => signIn('google')}
                onMouseEnter={() => setIsHoveringGoogle(true)}
                onMouseLeave={() => setIsHoveringGoogle(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isHoveringGoogle ? '#f1f3f4' : '#fff',
                  color: '#3C4043',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: 'Roboto, sans-serif',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  width: '100%',
                  maxWidth: '280px',
                  transition: 'background-color 0.2s ease-in-out'
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  style={{ width: '20px', height: '20px', marginRight: '10px' }}
                >
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                Google 계정으로 로그인
              </button>

              <button
                onClick={() => setLoginModalOpen(false)}
                style={{
                  background: 'transparent',
                  color: '#6B7280',
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </main>

        
      <style jsx global>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(20px); }
        }
      `}</style>
    </>
  );
  
}

