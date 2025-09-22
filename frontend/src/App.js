import React, { useState } from 'react';
import './App.css';
import { loginRequest, signupRequest } from './request_login';
import { socialLogin } from './social_login';

function App() {
  const [tab, setTab] = useState('login');

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
        <form onSubmit={loginRequest} className={`login-form ${tab==='login'?'active':''}`}>
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
        <form onSubmit={signupRequest} className={`signup-form ${tab==='signup'?'active':''}`}>
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

export default App;
