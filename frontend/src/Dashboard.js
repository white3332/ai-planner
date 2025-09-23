import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState({ email: '', provider: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserInfo({
        email: parsed.email || '',
        provider: parsed.provider || ''    // 백엔드에서 저장한 provider ('google' 또는 'kakao')
      });
    }
  }, []);

  const getProviderText = (provider) => {
    if (provider === 'google') return 'Google 연동됨';
    if (provider === 'kakao') return 'Kakao 연동됨';
    return '연동되지 않음';
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    window.location.href = '/';
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>대시보드 페이지</h1>
      <div style={{ margin: '1rem 0' }}>
        <p><strong>아이디:</strong> {userInfo.email}</p>
        <p><strong>연동 정보:</strong> {getProviderText(userInfo.provider)}</p>
      </div>
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#e53e3e',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        로그아웃
      </button>
    </div>
  );
};

export default Dashboard;