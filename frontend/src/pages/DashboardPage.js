// frontend/src/pages/DashboardPage.js

import React, { useEffect, useState } from 'react';

const DashboardPage = () => {
  const [userInfo, setUserInfo] = useState({ email: '', provider: '' });

  useEffect(() => {
    const stored = localStorage.getItem('user_info');
    if (stored) {
      setUserInfo(JSON.parse(stored));
    }
  }, []);

  const getProviderText = (p) => {
    if (p === 'google') return 'Google 연동됨';
    if (p === 'kakao') return 'Kakao 연동됨';
    return '연동되지 않음';
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('login_status');
    localStorage.removeItem('user_info');
    window.location.href = '/';
  };

  return (
    <div style={{ padding:'2rem', textAlign:'center' }}>
      <h1>대시보드</h1>
      <p><strong>이메일:</strong> {userInfo.email}</p>
      <p><strong>연동 정보:</strong> {getProviderText(userInfo.provider)}</p>
      <button onClick={handleLogout}>로그아웃</button>
    </div>
  );
};

export default DashboardPage;
