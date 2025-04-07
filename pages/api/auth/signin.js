// pages/auth/signin.js
import { getProviders, signIn } from "next-auth/react";

export default function SignIn({ providers }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #4C00FF, #6E38F7)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>GetCaption 로그인</h1>
        <p style={{ marginBottom: '30px' }}>Google 계정으로 로그인하세요.</p>

        {Object.values(providers).map((provider) => (
          <div key={provider.name}>
            <button
              onClick={() => signIn(provider.id)}
              style={{
                background: '#4285F4',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              🟦 Google로 로그인
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
