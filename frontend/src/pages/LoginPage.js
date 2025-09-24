import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginRequest, signupRequest } from '../api/request_login';
import { socialLogin } from '../api/social_login';

// 로그인 및 회원가입 페이지
function LoginPage() {
  const [tab, setTab] = useState('login'); // 'login' 또는 'signup' 탭 상태
  const [error, setError] = useState(''); // 에러 메시지 상태
  const [notification, setNotification] = useState(''); // 알림 메시지 상태 (예: 회원가입 성공)
  const navigate = useNavigate();
  const location = useLocation();

  // 다른 페이지에서 리디렉션된 경우 메시지 표시
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
    }
  }, [location]);

  // 로그인 폼 제출 핸들러
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    try {
      await loginRequest(email, password);
      navigate('/dashboard'); // 로그인 성공 시 대시보드로 이동
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    }
  };

  // 회원가입 폼 제출 핸들러
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const name = e.target.elements.signupName.value;
    const email = e.target.elements.signupEmail.value;
    const password = e.target.elements.signupPassword.value;
    const confirmPassword = e.target.elements.confirmPassword.value;
  
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
  
    try {
      await signupRequest(name, email, password);
      setNotification('회원가입 성공! 로그인 탭에서 로그인해주세요.');
      setTab('login'); // 로그인 탭으로 전환
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    }
  };

  return (

    <div className="login-container">
      <div className="logo">🤖 AI 학습 플래너</div>

      <div className="tab-container">
        <div className={tab === 'login' ? 'tab active' : 'tab'} onClick={() => setTab('login')}>
          로그인
        </div>
        <div className={tab === 'signup' ? 'tab active' : 'tab'} onClick={() => setTab('signup')}>
          회원가입
        </div>
      </div>

      {tab === 'login' ? (
        <form onSubmit={handleLoginSubmit} className={`login-form ${tab==='login'?'active':''}`}>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input type="email" id="email" placeholder="이메일을 입력하세요" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input type="password" id="password" placeholder="비밀번호를 입력하세요" required />
          </div>
          <button type="submit" className="btn">로그인</button>
          <a href="#" className="forgot-password">비밀번호를 잊으셨나요?</a>
        </form>
      ) : (
        <form onSubmit={handleSignupSubmit} className={`signup-form ${tab==='signup'?'active':''}`}>
          <div className="form-group">
            <label htmlFor="signupName">이름</label>
            <input type="text" id="signupName" placeholder="이름을 입력하세요" required />
          </div>
          <div className="form-group">
            <label htmlFor="signupEmail">이메일</label>
            <input type="email" id="signupEmail" placeholder="이메일을 입력하세요" required />
          </div>
          <div className="form-group">
            <label htmlFor="signupPassword">비밀번호</label>
            <input type="password" id="signupPassword" placeholder="비밀번호를 입력하세요" required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input type="password" id="confirmPassword" placeholder="비밀번호를 다시 입력하세요" required />
          </div>
          <button type="submit" className="btn">회원가입</button>
          <div className="terms">
            회원가입 시 <a href="#">이용약관</a> 및 <a href="#">개인정보처리방침</a>에 동의합니다.
          </div>
        </form>
      )}

      <div className="social-login">
        <button className="social-btn" onClick={() => socialLogin('google')}>
          <span>🔍</span> Google로 계속하기
        </button>
        <button className="social-btn" onClick={() => socialLogin('kakao')}>
          <span>💬</span> 카카오로 계속하기
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
