import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page Components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashboardPage'; 
import AuthCallback from './pages/AuthCallbackPage'; 

// 로그인 상태를 확인하는 헬퍼 함수
const isAuthenticated = () => {
  const loginStatus = localStorage.getItem('login_status');
  if (loginStatus === 'true') {
    return true;
  }

  const token = localStorage.getItem('auth_token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem('auth_token');
    return false;
  }
};

// 로그인된 사용자만 접근할 수 있는 보호된 라우트
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // 로그인되어 있지 않으면 로그인 페이지로 리디렉션
    // state를 통해 리디렉션된 이유를 전달할 수 있습니다.
    return <Navigate to="/login" replace state={{ message: '로그인이 필요합니다.' }} />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* '/' 경로: 초기 랜딩 페이지 */}
          <Route path="/" element={<LandingPage />} />
          
          {/* '/login' 경로: 로그인 및 회원가입 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* '/dashboard' 경로: 로그인 후 보이는 대시보드 (보호된 경로) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* '/auth/callback' 경로: 소셜 로그인 후 리디렉션되는 콜백 페이지 */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* 일치하는 경로가 없을 경우 랜딩 페이지로 리디렉션 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;