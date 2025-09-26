// frontend/src/components/sidebar/SidebarComponents.js

import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ activeItem = 'dashboard', onLogout }) => {
  const handleNavClick = (item) => {
    if (item === 'dashboard') {
      window.location.href = '/dashboard';
    } else if (item === 'planner') {
      window.location.href = '/planner';
    } else if (item === 'quiz') {
      alert('퀴즈 기능은 추후 구현 예정입니다.');
    } else if (item === 'community') {
      alert('커뮤니티 기능은 추후 구현 예정입니다.');
    } else if (item === 'achievement') {
      alert('성취도 기능은 추후 구현 예정입니다.');
    } else if (item === 'settings') {
      alert('설정 기능은 추후 구현 예정입니다.');
    }
  };

  return (
    <div className={styles.sidebar}>  {/* ✅ styles 사용 */}
      <div className={styles.logo}>🤖 AI 학습 플래너</div>
      <ul className={styles.navMenu}>  {/* ✅ kebab-case를 camelCase로 */}
        <li className={styles.navItem}>
          <div
            className={`${styles.navLink} ${activeItem === 'dashboard' ? styles.active : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <span>📊</span>
            <span>대시보드</span>
          </div>
        </li>
        <li className={styles.navItem}>
          <div
            className={`${styles.navLink} ${activeItem === 'planner' ? styles.active : ''}`}
            onClick={() => handleNavClick('planner')}
          >
            <span>📅</span>
            <span>학습 플래너</span>
          </div>
        </li>
        <li className={styles.navItem}>
          <div
            className={styles.navLink}
            onClick={() => handleNavClick('quiz')}
          >
            <span>❓</span>
            <span>퀴즈</span>
          </div>
        </li>
        <li className={styles.navItem}>
          <div
            className={styles.navLink}
            onClick={() => handleNavClick('community')}
          >
            <span>👥</span>
            <span>커뮤니티</span>
          </div>
        </li>
        <li className={styles.navItem}>
          <div
            className={styles.navLink}
            onClick={() => handleNavClick('achievement')}
          >
            <span>🏆</span>
            <span>성취도</span>
          </div>
        </li>
        <li className={styles.navItem}>
          <div
            className={styles.navLink}
            onClick={() => handleNavClick('settings')}
          >
            <span>⚙️</span>
            <span>설정</span>
          </div>
        </li>
        <li className={styles.navItem}>
          <button
            className={styles.navLink}
            onClick={onLogout}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <span>🚪</span>
            <span>로그아웃</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;