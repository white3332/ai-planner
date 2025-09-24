// frontend/src/components/login/LoginComponents.js

import React from 'react';
import styles from './LoginPage.module.css';

// 로고 헤더
export const LogoHeader = ({ title }) => (
  <div className={styles.logo}>{title}</div>
);

// 탭 선택
export const TabSelector = ({ currentTab, onTabChange, labels }) => (
  <div className={styles.tabContainer}>
    {['login', 'signup'].map((key) => (
      <button
        key={key}
        className={`${styles.tab} ${currentTab === key ? styles.active : ''}`}
        onClick={() => onTabChange(key)}
      >
        {labels[key]}
      </button>
    ))}
  </div>
);

// 메시지 출력
export const MessageDisplay = ({ type, message }) => {
  if (!message) return null;
  const cls = type === 'error' ? styles.errorMessage : styles.successMessage;
  return <div className={cls}>{message}</div>;
};

// 로그인 폼
export const LoginForm = ({ onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = e.target.elements;
    onSubmit({ email: email.value, password: password.value });
  };

  return (
    <form className={`${styles.loginForm} ${styles.active}`} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" required placeholder="이메일을 입력하세요" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="password">비밀번호</label>
        <input id="password" name="password" type="password" required placeholder="비밀번호를 입력하세요" />
      </div>
      <button type="submit" className={styles.btn}>로그인</button>
      <a href="#" className={styles.forgotPassword}>비밀번호를 잊으셨나요?</a>
    </form>
  );
};

// 회원가입 폼
export const SignupForm = ({ onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const { signupName, signupEmail, signupPassword, confirmPassword } = e.target.elements;
    onSubmit({
      name: signupName.value,
      email: signupEmail.value,
      password: signupPassword.value,
      confirmPassword: confirmPassword.value
    });
  };

  return (
    <form className={`${styles.signupForm} ${styles.active}`} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="signupName">이름</label>
        <input id="signupName" name="signupName" type="text" required placeholder="이름을 입력하세요" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="signupEmail">이메일</label>
        <input id="signupEmail" name="signupEmail" type="email" required placeholder="이메일을 입력하세요" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="signupPassword">비밀번호</label>
        <input id="signupPassword" name="signupPassword" type="password" required placeholder="비밀번호를 입력하세요" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword">비밀번호 확인</label>
        <input id="confirmPassword" name="confirmPassword" type="password" required placeholder="비밀번호를 다시 입력하세요" />
      </div>
      <button type="submit" className={styles.btn}>회원가입</button>
      <div className={styles.terms}>
        회원가입 시 <a href="#">이용약관</a> 및 <a href="#">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
      </div>
    </form>
  );
};

// 소셜 로그인 버튼
export const SocialLoginButtons = ({ onSocialLogin }) => (
  <div className={styles.socialLogin}>
    <button className={styles.socialBtn} onClick={() => onSocialLogin('google')}>
      <span>🔍</span> <span>Google로 계속하기</span>
    </button>
    <button className={styles.socialBtn} onClick={() => onSocialLogin('kakao')}>
      <span>💬</span> <span>카카오로 계속하기</span>
    </button>
  </div>
);
