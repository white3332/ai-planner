// 소셜 로그인 처리 함수
export function socialLogin(provider) {
    const urls = {
        google: 'http://localhost:8000/auth/google',
        kakao: 'http://localhost:8000/auth/kakao',
    };
    
    // 현재 페이지를 소셜 로그인 URL로 리디렉션
    window.location.href = urls[provider];
}