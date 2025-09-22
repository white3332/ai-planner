// 소셜 로그인 처리 함수

export function socialLogin(provider) {
  const urls = {
    google: 'http://localhost:8000/auth/google',
    kakao:  'http://localhost:8000/auth/kakao',
  };
  window.location.href = urls[provider];
}
