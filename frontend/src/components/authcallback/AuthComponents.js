import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AuthPage.module.css';

const AuthCallbackContainer = ({ children }) => (
  <div className={styles.authCallbackContainer}>
    {children}
  </div>
);

export const LoadingSpinner = () => (
  <AuthCallbackContainer>
    <div className={styles.loadingSpinner}>
      <div className={styles.spinner}></div>
      <p>로그인 처리 중...</p>
    </div>
  </AuthCallbackContainer>
);

export const ErrorMessage = ({ message }) => {
  const navigate = useNavigate();
  return (
    <AuthCallbackContainer>
      <div className={styles.errorMessage}>
        <h2>로그인 실패</h2>
        <p>{message}</p>
        <button onClick={() => navigate('/')}>메인으로 돌아가기</button>
      </div>
    </AuthCallbackContainer>
  );
};

export const SuccessMessage = () => (
  <AuthCallbackContainer>
    <div className={styles.successMessage}>
      <h2>로그인 성공!</h2>
      <p>잠시 후 메인 페이지로 이동합니다...</p>
    </div>
  </AuthCallbackContainer>
);