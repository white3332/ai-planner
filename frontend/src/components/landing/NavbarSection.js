import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const handleSmoothScroll = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a href="#home" onClick={handleSmoothScroll} className="logo-link">
          <div className="logo">🤖 AI 학습 플래너</div>
        </a>
        <ul className="nav-links">
          <li><a href="#home" onClick={handleSmoothScroll}>홈</a></li>
          <li><a href="#problems" onClick={handleSmoothScroll}>문제점</a></li>
          <li><a href="#features" onClick={handleSmoothScroll}>기능</a></li>
          <li><a href="#tech" onClick={handleSmoothScroll}>기술</a></li>
          <li><Link to="/login" className="login-btn">로그인</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
