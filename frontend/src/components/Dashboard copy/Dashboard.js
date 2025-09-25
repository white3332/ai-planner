import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar/Sidebar';

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState({ email: '', provider: '' });
  const [stats, setStats] = useState({
    today_hours: 0,
    weekly_progress: 0,
    streak_days: 0,
    total_points: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserInfo({
        email: parsed.email || '',
        provider: parsed.provider || ''    // 백엔드에서 저장한 provider ('google' 또는 'kakao')
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

  const getProviderText = (provider) => {
    if (provider === 'google') return 'Google 연동됨';
    if (provider === 'kakao') return 'Kakao 연동됨';
    return '연동되지 않음';
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#667eea'
      }}>
        🔄 통계 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: '#f8f9fa',
      minHeight: '100vh',
      display: 'flex',
      margin: 0,
      padding: 0,
      width: '100vw'
    }}>
      {/* 사이드바 */}
      <Sidebar activeItem="dashboard" onLogout={handleLogout} />

      {/* 메인 컨텐츠 */}
      <div style={{ flex: 1, padding: 0, height: '100vh', overflowY: 'auto' }}>
      {/* 헤더 */}
      <div style={{
        background: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>안녕하세요, {userInfo.email}님! 👋</h1>
          <p style={{ color: '#666', margin: 0 }}>오늘도 열심히 학습해보세요</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 통계 카드들 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* 오늘 학습 시간 */}
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          transition: 'transform 0.3s ease'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#667eea',
            marginBottom: '0.5rem'
          }}>
            {stats.today_hours}시간
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>오늘 학습 시간</div>
        </div>

        {/* 주간 목표 달성률 */}
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#667eea',
            marginBottom: '0.5rem'
          }}>
            {stats.weekly_progress}%
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>주간 목표 달성</div>
        </div>

        {/* 연속 학습일 */}
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔥</div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#667eea',
            marginBottom: '0.5rem'
          }}>
            {stats.streak_days}일
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>연속 학습일</div>
        </div>

        {/* 총 포인트 */}
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#667eea',
            marginBottom: '0.5rem'
          }}>
            {stats.total_points}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>총 포인트</div>
        </div>
      </div>

      {/* 빠른 실행 */}
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '1.3rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>⚡</span>
          빠른 실행
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          <button
            onClick={() => window.location.href = '/planner'}
            style={{
              padding: '2.5rem',
              background: 'white',
              border: '2px solid #e9ecef',
              borderRadius: '15px',
              textDecoration: 'none',
              color: '#333',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e9ecef';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '2rem' }}>📅</div>
            <div>학습 플래너</div>
          </button>

          <button
            onClick={() => alert('퀴즈 기능은 추후 구현 예정입니다.')}
            style={{
              padding: '2.5rem',
              background: 'white',
              border: '2px solid #e9ecef',
              borderRadius: '15px',
              color: '#333',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '2rem' }}>📝</div>
            <div>새 퀴즈 생성</div>
          </button>

          <button
            onClick={() => alert('질문하기 기능은 추후 구현 예정입니다.')}
            style={{
              padding: '2.5rem',
              background: 'white',
              border: '2px solid #e9ecef',
              borderRadius: '15px',
              color: '#333',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '2rem' }}>💬</div>
            <div>질문하기</div>
          </button>

          <button
            onClick={() => alert('진도 보고서 기능은 추후 구현 예정입니다.')}
            style={{
              padding: '2.5rem',
              background: 'white',
              border: '2px solid #e9ecef',
              borderRadius: '15px',
              color: '#333',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '2rem' }}>📊</div>
            <div>진도 보고서</div>
          </button>

        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;