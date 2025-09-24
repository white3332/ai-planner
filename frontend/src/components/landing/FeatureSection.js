import React from 'react';

const MainPageFeatures = () => {
  return (
    <section id="features" className="section features">
      <div className="container">
        <h2 className="section-title fade-in">핵심 기능</h2>
        <div className="features-grid">
          <div className="feature-card fade-in">
            <div className="feature-title">🏆 동기 부여 시스템</div>
            <p>배지 수집, 출석 도장, 도전 과제 등 게임화 요소를 도입하고, AI가 학습 데이터 기반으로 응원 메시지를 제공합니다.</p>
          </div>
          <div className="feature-card fade-in">
            <div className="feature-title">🤝 협력 학습 시스템</div>
            <p>질문-답변 기반의 협력 학습을 지원하고, 보상 포인트를 통해 사용자의 참여를 유도합니다.</p>
          </div>
          <div className="feature-card fade-in">
            <div className="feature-title">📊 실시간 학습 관리</div>
            <p>주간/월간 보고서와 시각화된 대시보드를 통해 학습 진도와 성취도를 실시간으로 확인할 수 있습니다.</p>
          </div>
          <div className="feature-card fade-in">
            <div className="feature-title">🤖 AI 기반 일정 관리</div>
            <p>사용자의 학습 패턴을 분석하여 최적의 학습 일정을 추천하며, 개인화된 포모도로 타이머를 제공합니다.</p>
          </div>
          <div className="feature-card fade-in">
            <div className="feature-title">📝 맞춤형 퀴즈</div>
            <p>사용자의 학습 내용을 기반으로 맞춤형 퀴즈를 자동으로 생성하고, 즉각적인 피드백과 보완 학습을 추천합니다.</p>
          </div>
           <div className="feature-card fade-in">
            <div className="feature-title">🌐 심화 및 최신 자료</div>
            <p>AI가 사용자의 관심사와 학습 수준에 맞춰 최신 아티클, 논문, 강의 등을 추천하여 심화 학습을 돕습니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainPageFeatures;
