import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../components/authcallback/AuthComponents';

function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const process = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (!token) {
          throw new Error('토큰을 찾을 수 없습니다.');
        }

        // 저장
        localStorage.setItem('auth_token', token);
        localStorage.setItem('login_status', 'true');

        // 디코딩하여 user_info 저장
        try {
          const user = JSON.parse(atob(token.split('.')[1]));
          localStorage.setItem(
            'user_info',
            JSON.stringify({
              email: user.email || '',
              provider: user.provider || ''
            })
          );
        } catch {
          localStorage.setItem('user_info', JSON.stringify({ email: '', provider: '' }));
        }

        setLoading(false);
        navigate('/dashboard', { replace: true, state: {} });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    process();
  }, [location, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  return <SuccessMessage message="로그인 성공! 대시보드로 이동합니다." />;
}

export default AuthCallbackPage;
