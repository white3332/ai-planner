// 로그인 및 회원가입 요청 처리

export async function loginRequest(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (response.ok) {
      // JWT 토큰과 사용자 정보를 localStorage에 저장
      localStorage.setItem('auth_token', 'dummy_token_for_now'); // 백엔드에서 토큰을 반환하도록 수정 필요
      localStorage.setItem('user_info', JSON.stringify({
        email: email,
        name: data.message.split('님')[0] || 'User'
      }));

      alert('로그인 성공! 대시보드로 이동합니다.');
      // 페이지 새로고침으로 인증 상태 업데이트
      window.location.reload();
    } else {
      alert(data.detail || '이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('로그인 요청 오류:', error);
    alert('로그인 중 문제가 발생했습니다. 서버 상태를 확인해주세요.');
  }
}

export async function signupRequest(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();

    if (response.ok) {
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      window.location.reload();
    } else {
      alert(data.detail || '회원가입 중 문제가 발생했습니다.');
    }
  } catch (error) {
    console.error('회원가입 요청 오류:', error);
    alert('회원가입 중 서버에 문제가 발생했습니다.');
  }
}
