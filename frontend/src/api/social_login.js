// React용 소셜 로그인 함수

const API_BASE_URL = 'http://localhost:8000';

export function socialLogin(provider) {
  const urls = {
    google: `${API_BASE_URL}/auth/google`,
    kakao: `${API_BASE_URL}/auth/kakao`,
  };
  
  if (!urls[provider]) {
    console.error('지원하지 않는 소셜 로그인 제공자:', provider);
    return;
  }
  
  // 현재 페이지를 소셜 로그인 URL로 리디렉션
  window.location.href = urls[provider];
}