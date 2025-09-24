import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // react-router-dom의 Link를 사용

const MainPageNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 부드러운 스크롤 핸들러 (같은 페이지 내에서 이동)
  const handleSmoothScroll = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navStyle = {
    background: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
    boxShadow: isScrolled ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
    transition: 'all 0.3s ease-in-out'
  };

  return (
    <nav className="navbar" style={navStyle}>
      <div className="nav-container">
        <div className="logo">
          <a href="#home" onClick={handleSmoothScroll}>🤖 AI 학습 플래너</a>
        </div>
        <ul className="nav-links">
          <li><a href="#home" onClick={handleSmoothScroll}>홈</a></li>
          <li><a href="#problems" onClick={handleSmoothScroll}>문제점</a></li>
          <li><a href="#features" onClick={handleSmoothScroll}>기능</a></li>
          <li><a href="#tech" onClick={handleSmoothScroll}>기술</a></li>
          {/* 로그인 버튼 추가 */}
          <li>
            <Link to="/login" className="login-btn">로그인</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default MainPageNavbar;
