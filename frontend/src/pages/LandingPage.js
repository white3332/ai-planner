/* frontend/src/Pages/LandingPage.js */

import React, { useEffect } from 'react';
import {
  NavbarSection,
  HeroSection,
  ProblemsSection,
  FeaturesSection,
  TechSection,
  CTASection,
  FooterSection
} from '../components/landing/LandingComponents';

function LandingPage() {
  // 페이지 로드 시 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <NavbarSection />
      <HeroSection />
      <ProblemsSection />
      <FeaturesSection />
      <TechSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}

export default LandingPage;