/* frontend/src/components/landing/LandingComponents.js */
import React, { useEffect } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import styles from './LandingPage.module.css';



// 스크롤 애니메이션을 위한 훅
const useScrollAnimation = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
        }
      });
    }, observerOptions);

    const fadeElements = document.querySelectorAll(`.${CSS.escape(styles.fadeIn)}`);
    fadeElements.forEach(el => observer.observe(el));

    return () => {
      fadeElements.forEach(el => observer.unobserve(el));
    };
  }, []);
};

// 네비게이션 컴포넌트
export const NavbarSection = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>🤖 AI 학습 플래너</Link>
        <ul className={styles.navLinks}>
          <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>홈</a></li>
          <li><a href="#problems" onClick={(e) => { e.preventDefault(); scrollToSection('problems'); }}>문제점</a></li>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>기능</a></li>
          <li><a href="#tech" onClick={(e) => { e.preventDefault(); scrollToSection('tech'); }}>기술</a></li>
          <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>문의</a></li>
        </ul>
      </div>
    </nav>
  );
};

// 히어로 섹션 컴포넌트
export const HeroSection = () => {
  const navigate = useNavigate();

  const handleStartClick = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <section id="home" className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>AI 학습 플래너</h1>
        <p>챗봇 AI를 활용한 학습 효율성 및 동기 부여 증진 솔루션</p>
        <a
          href="/login"
          className={styles.ctaButton}
          onClick={handleStartClick}
        >
          지금 시작하기
        </a>
      </div>
    </section>
  );
};

// 문제점 섹션 컴포넌트
export const ProblemsSection = () => {
  useScrollAnimation();
  
  const problems = [
    {
      icon: "😴",
      title: "학습 동기 부족",
      description: "지속적인 학습에 대한 동기부여와 흥미 유지의 어려움"
    },
    {
      icon: "⏰",
      title: "시간 관리 미숙",
      description: "효율적인 학습 시간 배분과 일정 관리의 부족"
    },
    {
      icon: "🎯",
      title: "개인 맞춤형 학습 부족",
      description: "개인의 학습 패턴과 수준에 맞는 맞춤형 콘텐츠 부재"
    },
    {
      icon: "📚",
      title: "최신 자료 및 심화 학습 부족",
      description: "최신 학습 자료와 심화 학습 기회의 제한적 접근"
    }
  ];

  return (
    <section id="problems" className={`${styles.section} ${styles.problems}`}>
      <div className={styles.container}>
        <h2 className={`${styles.sectionTitle} ${styles.fadeIn}`}>해결하는 핵심 문제</h2>
        <div className={styles.problemsGrid}>
          {problems.map((problem, index) => (
            <div key={index} className={`${styles.problemCard} ${styles.fadeIn}`}>
              <div className={styles.problemIcon}>{problem.icon}</div>
              <h3>{problem.title}</h3>
              <p>{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 기능 섹션 컴포넌트
export const FeaturesSection = () => {
  useScrollAnimation();
  
  const features = [
    {
      title: "🏆 동기 부여 시스템",
      description: "배지 수집, 출석 도장, 도전 과제 등 게임화 요소를 도입하고, AI가 학습 데이터 기반으로 응원 메시지를 제공합니다."
    },
    {
      title: "🤝 협력 학습 시스템",
      description: "질문-답변 기반의 협력 학습을 지원하고, 보상 포인트를 통해 사용자의 참여를 유도합니다."
    },
    {
      title: "📊 실시간 학습 관리",
      description: "주간/월간 보고서와 시각화된 대시보드를 통해 학습 진도와 성취도를 실시간으로 확인할 수 있습니다."
    },
    {
      title: "🤖 AI 기반 일정 관리",
      description: "사용자의 학습 패턴을 분석하여 최적의 학습 일정을 추천하며, 개인화된 포모도로 타이머를 제공합니다."
    },
    {
      title: "📝 맞춤형 퀴즈",
      description: "사용자의 학습 내용을 기반으로 맞춤형 퀴즈를 자동으로 생성하고, 즉각적인 피드백과 보완 학습을 추천합니다."
    }
  ];

  return (
    <section id="features" className={`${styles.section} ${styles.features}`}>
      <div className={styles.container}>
        <h2 className={`${styles.sectionTitle} ${styles.fadeIn}`}>핵심 기능</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={`${styles.featureCard} ${styles.fadeIn}`}>
              <div className={styles.featureTitle}>{feature.title}</div>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 기술 스택 섹션 컴포넌트
export const TechSection = () => {
  useScrollAnimation();
  
  const techCategories = [
    {
      title: "🗄️ 백엔드",
      technologies: ["PostgreSQL", "MongoDB", "FastAPI", "Node.js + Express.js"]
    },
    {
      title: "🎨 프론트엔드",
      technologies: ["React", "Redux Toolkit"]
    },
    {
      title: "🧠 AI 및 분석",
      technologies: ["GPT-4 API", "TensorFlow", "PyTorch"]
    },
    {
      title: "📱 알림 시스템",
      technologies: ["Firebase Cloud Messaging"]
    }
  ];

  return (
    <section id="tech" className={`${styles.section} ${styles.techStack}`}>
      <div className={styles.container}>
        <h2 className={`${styles.sectionTitle} ${styles.fadeIn}`}>기술 스택</h2>
        <div className={styles.techGrid}>
          {techCategories.map((category, index) => (
            <div key={index} className={`${styles.techCategory} ${styles.fadeIn}`}>
              <h3>{category.title}</h3>
              <ul className={styles.techList}>
                {category.technologies.map((tech, techIndex) => (
                  <li key={techIndex}>{tech}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA 섹션 컴포넌트
export const CTASection = () => {
  useScrollAnimation();
  
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <h2 className={styles.fadeIn}>AI와 함께하는 스마트한 학습을 시작하세요</h2>
        <p className={styles.fadeIn}>개인 맞춤형 AI 학습 플래너로 더 효율적이고 재미있는 학습 경험을 만나보세요.</p>
        <a 
          href="#contact" 
          className={`${styles.ctaButton} ${styles.fadeIn}`}
          onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
        >
          무료 체험 시작
        </a>
      </div>
    </section>
  );
};

// 푸터 섹션 컴포넌트
export const FooterSection = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p>&copy; 2025 AI 학습 플래너. 에듀테크의 새로운 패러다임.</p>
      </div>
    </footer>
  );
};