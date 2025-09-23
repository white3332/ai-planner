import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // URL에서 token 파라미터 추출
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        
        if (!token) {
          setError('토큰을 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        // JWT 토큰을 localStorage에 저장
        localStorage.setItem('auth_token', token);
        
        // 토큰에서 사용자 정보 디코딩 (선택적)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          localStorage.setItem('user_info', JSON.stringify({
            name: payload.name,
            email: payload.email,
            user_id: payload.user_id
          }));
        } catch (decodeError) {
          console.warn('토큰 디코딩 실패:', decodeError);
        }

        // 성공 메시지 표시 후 메인 페이지로 리디렉션
        setLoading(false);
        setTimeout(() => {
          navigate('/dashboard'); // 또는 원하는 페이지로 리디렉션
        }, 2000);

      } catch (err) {
        console.error('로그인 처리 중 오류:', err);
        setError('로그인 처리 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    processCallback();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="auth-callback-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-callback-container">
        <div className="error-message">
          <h2>로그인 실패</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-container">
      <div className="success-message">
        <h2>로그인 성공!</h2>
        <p>잠시 후 메인 페이지로 이동합니다...</p>
      </div>
    </div>
  );
};

export default AuthCallback;