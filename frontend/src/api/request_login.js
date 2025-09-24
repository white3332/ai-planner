// React용 로그인 및 회원가입 API 함수 - 수정된 버전

const API_BASE_URL = 'http://localhost:8000';

export async function loginRequest(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || '로그인에 실패했습니다.');
  }

  // 토큰 저장
  localStorage.setItem('auth_token', data.token);
  // 로그인 상태 플래그
  localStorage.setItem('login_status', 'true');
  // 사용자 정보 저장
  localStorage.setItem(
    'user_info',
    JSON.stringify({
      email: data.user.email,
      provider: data.user.provider || ''
    })
  );

  return data;
}

export async function signupRequest(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || '회원가입 중 문제가 발생했습니다.');
  }

  return data;
}