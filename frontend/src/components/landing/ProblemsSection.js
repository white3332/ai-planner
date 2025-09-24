import React from 'react';

const MainPageProblems = () => {
  return (
    <section id="problems" className="section problems">
      <div className="container">
        <h2 className="section-title fade-in">해결하는 핵심 문제</h2>
        <div className="problems-grid">
          <div className="problem-card fade-in">
            <div className="problem-icon">😴</div>
            <h3>학습 동기 부족</h3>
            <p>지속적인 학습에 대한 동기부여와 흥미 유지의 어려움</p>
          </div>
          <div className="problem-card fade-in">
            <div className="problem-icon">⏰</div>
            <h3>시간 관리 미숙</h3>
            <p>효율적인 학습 시간 배분과 일정 관리의 부족</p>
          </div>
          <div className="problem-card fade-in">
            <div className="problem-icon">🎯</div>
            <h3>개인 맞춤형 학습 부족</h3>
            <p>개인의 학습 패턴과 수준에 맞는 맞춤형 콘텐츠 부재</p>
          </div>
          <div className="problem-card fade-in">
            <div className="problem-icon">📚</div>
            <h3>최신 자료 및 심화 학습 부족</h3>
            <p>최신 학습 자료와 심화 학습 기회의 제한적 접근</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainPageProblems;
