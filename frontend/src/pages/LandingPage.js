import React, { useEffect } from 'react';
import Navbar from '../components/landing/NavbarSection';
import Hero from '../components/landing/HeroSection';
import Problems from '../components/landing/ProblemsSection';
import Features from '../components/landing/FeatureSection';
import TechStack from '../components/landing/TechStackSection';
import CTA from '../components/landing/CTASection';
import Footer from '../components/landing/FooterSection';

// 랜딩 페이지: 앱의 기능을 소개하는 초기 페이지
function LandingPage() {
  // 스크롤에 따른 fade-in 애니메이션 효과 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1, // 요소가 10% 보일 때 애니메이션 실행
      }
    );

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el) => observer.observe(el));

    // 컴포넌트가 사라질 때 observer 정리
    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problems />
        <Features />
        <TechStack />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

export default LandingPage;