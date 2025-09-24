import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { loginRequest, signupRequest } from './request_login';
import { socialLogin } from './social_login';
import AuthCallback from './AuthCallback';
import Dashboard from './Dashboard';
import PlannerPage from './components/PlannerPage';

// 로그인 확인 함수
const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  const userInfo = localStorage.getItem('user_info');

  // 더미 토큰이나 사용자 정보가 있으면 인증된 것으로 간주
  return token && userInfo;
};

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" />;
};

// 로그인 페이지 컴포넌트
function LoginPage() {
  const [tab, setTab] = useState('login');

  // 이미 로그인된 사용자는 플래너로 바로 리디렉션
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" />;
  }

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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/planner" element={
            <ProtectedRoute>
              <PlannerPage
                onLogout={() => {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user_info');
                  window.location.href = '/';
                }}
                userEmail={JSON.parse(localStorage.getItem('user_info') || '{}').email || ''}
              />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;