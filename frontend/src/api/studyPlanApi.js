// API 호출 함수들
const API_BASE_URL = 'http://localhost:8000';

// 학습 계획 생성
export const createStudyPlan = async (planData, userEmail) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/study-plans?user_email=${userEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('학습 계획 생성 오류:', error);
    throw error;
  }
};

// 학습 계획 조회
export const getStudyPlans = async (userEmail) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/study-plans?user_email=${userEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
export const updateStudyPlan = async (planId, updateData, userEmail) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/study-plans/${planId}?user_email=${userEmail}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('학습 계획 수정 오류:', error);
    throw error;
  }
};

// 학습 계획 삭제
export const deleteStudyPlan = async (planId, userEmail) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/study-plans/${planId}?user_email=${userEmail}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('학습 계획 삭제 오료:', error);
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