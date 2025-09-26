// frontend/src/pages/DashboardPage.js

import React, { useEffect, useState } from 'react';
import {
  LoadingSpinner,
  DashboardHeader,
  StatsGrid,
  QuickActions
} from '../components/dashboard/DashboardComponents';
import styles from '../components/dashboard/Dashboard.module.css';
import Sidebar from '../components/sidebar/SidebarComponents';

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState({ email: '', provider: '' });
  const [stats, setStats] = useState({
    today_hours: 0,
    weekly_progress: 0,
    streak_days: 0,
    total_points: 0
  });
  const [loading, setLoading] = useState(true);

  // 사용자 정보 로드
  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserInfo({
        email: parsed.email || '',
        provider: parsed.provider || ''
      });
    }
  }, []);

  // 통계 데이터 로드
  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!userInfo.email) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/dashboard/stats?user_email=${userInfo.email}`);

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error('통계 로드 실패');
        }
      } catch (error) {
        console.error('통계 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, [userInfo.email]);

  // 로그아웃 핸들러
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    window.location.href = '/';
  };

  // 로딩 중일 때
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* 사이드바 */}
      <Sidebar activeItem="dashboard" onLogout={handleLogout} />

      {/* 메인 컨텐츠 */}
      <div className={styles.dashboardMainContent}>
        {/* 헤더 */}
        <DashboardHeader userInfo={userInfo} onLogout={handleLogout} />

        {/* 통계 카드들 */}
        <StatsGrid stats={stats} />

        {/* 빠른 실행 */}
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;