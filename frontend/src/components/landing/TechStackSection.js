import React from 'react';

const MainPageTechStack = () => {
  return (
    <section id="tech" className="section tech-stack">
      <div className="container">
        <h2 className="section-title fade-in">기술 스택</h2>
        <div className="tech-grid">
          <div className="tech-category fade-in">
            <h3>🗄️ 백엔드</h3>
            <ul className="tech-list">
              <li>PostgreSQL</li>
              <li>MongoDB</li>
              <li>FastAPI</li>
              <li>Node.js + Express.js</li>
            </ul>
          </div>
          <div className="tech-category fade-in">
            <h3>🎨 프론트엔드</h3>
            <ul className="tech-list">
              <li>React</li>
              <li>Redux Toolkit</li>
            </ul>
          </div>
          <div className="tech-category fade-in">
            <h3>🧠 AI 및 분석</h3>
            <ul className="tech-list">
              <li>GPT-4 API</li>
              <li>TensorFlow</li>
              <li>PyTorch</li>
            </ul>
          </div>
          <div className="tech-category fade-in">
            <h3>📱 알림 시스템</h3>
            <ul className="tech-list">
              <li>Firebase Cloud Messaging</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainPageTechStack;
