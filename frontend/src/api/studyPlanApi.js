// 학습 계획 관련 API 호출 함수

const API_BASE_URL = 'http://localhost:8000';

// localStorage에서 토큰을 가져옵니다.
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// 학습 계획 생성
export const createStudyPlan = async (planData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/study-plans`, { 
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: planData.title,
        type: planData.type,
        date: planData.date,
        start_time: planData.startTime || null,
        end_time: planData.endTime || null,
        description: planData.description || null,
        completed: false
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('학습 계획 생성 오류:', error);
    throw error;
  }
};

// 학습 계획 조회
export const getStudyPlans = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/study-plans`, { 
      method: 'GET',
      headers: getAuthHeaders(), 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.plans;
  } catch (error) {
    console.error('학습 계획 조회 오류:', error);
    throw error;
  }
};

// 학습 계획 수정
export const updateStudyPlan = async (planId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/study-plans/${planId}`, { 
      method: 'PUT',
      headers: getAuthHeaders(), 
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('학습 계획 수정 오류:', error);
    throw error;
  }
};

// 학습 계획 삭제
export const deleteStudyPlan = async (planId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/study-plans/${planId}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('학습 계획 삭제 오류:', error);
    throw error;
  }
};

// 날짜별로 학습 계획을 그룹화하는 유틸리티 함수
export const groupPlansByDate = (plans) => {
  const grouped = {};

  plans.forEach(plan => {
    const date = plan.date;
    if (!grouped[date]) {
      grouped[date] = [];
    }

    // API에서 받은 데이터를 프론트엔드 형식으로 변환
    grouped[date].push({
      id: plan._id,
      title: plan.title,
      type: plan.type,
      time: plan.start_time && plan.end_time ? `${plan.start_time}-${plan.end_time}` : '시간 미정',
      completed: plan.completed,
      description: plan.description
    });
  });

  return grouped;
};