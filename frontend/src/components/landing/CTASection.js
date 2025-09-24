import React from 'react';
import { Link } from 'react-router-dom';

const MainPageCTA = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <h2 className="fade-in">AI와 함께하는 스마트한 학습을 시작하세요</h2>
        <p className="fade-in">개인 맞춤형 AI 학습 플래너로 더 효율적이고 재미있는 학습 경험을 만나보세요.</p>
        <Link to="/login" className="cta-button fade-in">무료 체험 시작</Link>
      </div>
    </section>
  );
};

export default MainPageCTA;
