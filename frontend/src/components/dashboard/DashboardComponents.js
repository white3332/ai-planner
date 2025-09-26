// frontend/src/components/dashboard/DashboardComponents.js

import React from 'react';
import styles from './Dashboard.module.css';

// 로딩 스피너 컴포넌트
export const LoadingSpinner = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}>🔄</div>
      <div className={styles.loadingText}>통계 정보를 불러오는 중...</div>
    </div>
  );
};

// 대시보드 헤더 컴포넌트
export const DashboardHeader = ({ userInfo, onLogout }) => {
  return (
    <div className={styles.dashboardHeader}>
      <div className={styles.headerContent}>
        <div>
          <h1 className={styles.welcomeTitle}>안녕하세요, {userInfo.email}님! 👋</h1>
          <p className={styles.welcomeSubtitle}>오늘도 열심히 학습해보세요</p>
        </div>
        <button onClick={onLogout} className={styles.logoutButton}>
          로그아웃
        </button>
      </div>
    </div>
  );
};

// 개별 통계 카드 컴포넌트
export const StatsCard = ({ icon, value, unit, label, color }) => {
  return (
    <div className={styles.statsCard}>
      <div className={styles.statsIcon}>{icon}</div>
      <div className={`${styles.statsValue} ${color ? styles[color] : ''}`}>
        {value}{unit}
      </div>
      <div className={styles.statsLabel}>{label}</div>
    </div>
  );
};

// 통계 카드 그리드 컴포넌트
export const StatsGrid = ({ stats }) => {
  const statsData = [
    {
      icon: "⏰",
      value: stats.today_hours,
      unit: "시간",
      label: "오늘 학습 시간",
      color: "primary"
    },
    {
      icon: "🎯",
      value: stats.weekly_progress,
      unit: "%",
      label: "주간 목표 달성",
      color: "primary"
    },
    {
      icon: "🔥",
      value: stats.streak_days,
      unit: "일",
      label: "연속 학습일",
      color: "primary"
    },
    {
      icon: "📈",
      value: stats.total_points,
      unit: "",
      label: "총 포인트",
      color: "primary"
    }
  ];

  return (
    <div className={styles.statsGrid}>
      {statsData.map((stat, index) => (
        <StatsCard
          key={index}
          icon={stat.icon}
          value={stat.value}
          unit={stat.unit}
          label={stat.label}
          color={stat.color}
        />
      ))}
    </div>
  );
};

// 빠른 실행 액션 버튼 컴포넌트
export const ActionButton = ({ icon, label, onClick, href }) => {
  const handleClick = (e) => {
    if (href) {
      window.location.href = href;
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <button onClick={handleClick} className={styles.actionButton}>
      <div className={styles.actionIcon}>{icon}</div>
      <div className={styles.actionLabel}>{label}</div>
    </button>
  );
};

// 빠른 실행 섹션 컴포넌트
export const QuickActions = () => {
  const actions = [
    {
      icon: "📅",
      label: "학습 플래너",
      href: "/planner"
    },
    {
      icon: "📝",
      label: "새 퀴즈 생성",
      onClick: () => alert('퀴즈 기능은 추후 구현 예정입니다.')
    },
    {
      icon: "💬",
      label: "질문하기",
      onClick: () => alert('질문하기 기능은 추후 구현 예정입니다.')
    },
    {
      icon: "📊",
      label: "진도 보고서",
      onClick: () => alert('진도 보고서 기능은 추후 구현 예정입니다.')
    }
  ];

  return (
    <div className={styles.quickActionsSection}>
      <h2 className={styles.quickActionsTitle}>
        <span className={styles.quickActionsIcon}>⚡</span>
        빠른 실행
      </h2>
      <div className={styles.quickActionsGrid}>
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
            href={action.href}
          />
        ))}
      </div>
    </div>
  );
};