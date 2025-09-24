import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogoHeader,
  TabSelector,
  MessageDisplay,
  LoginForm,
  SignupForm,
  SocialLoginButtons
} from '../components/login/LoginComponents';
import styles from '../components/login/LoginPage.module.css';
import { loginRequest, signupRequest } from '../api/request_login';

function LoginPage() {
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setError('');
    setNotification('');
  };

  const handleLoginSubmit = async (data) => {
    setError('');
    try {
      const result = await loginRequest(data.email, data.password);
      // (선택) 로그인 성공 메시지 표시
      setNotification(result.message);
      // 대시보드로 이동
      navigate('/dashboard', { replace: true, state: {} });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignupSubmit = async (data) => {
    setError('');
    if (data.password !== data.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const result = await signupRequest(data.name, data.email, data.password);
      setNotification(result.message + ' 로그인 탭에서 로그인해주세요.');
      setTab('login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <LogoHeader title="🤖 AI 학습 플래너" />
        <TabSelector currentTab={tab} onTabChange={handleTabChange} labels={{ login: '로그인', signup: '회원가입' }} />
        <MessageDisplay type="success" message={notification} />
        <MessageDisplay type="error" message={error} />
        {tab === 'login' && <LoginForm onSubmit={handleLoginSubmit} />}
        {tab === 'signup' && <SignupForm onSubmit={handleSignupSubmit} />}
        <SocialLoginButtons onSocialLogin={(provider) => window.location.href=`http://localhost:8000/auth/${provider}`} />
      </div>
    </div>
  );
}

export default LoginPage;
