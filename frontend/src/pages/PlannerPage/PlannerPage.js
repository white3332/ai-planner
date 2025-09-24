import React, { useState, useEffect } from 'react';
import './PlannerPage.css';
import { createStudyPlan, getStudyPlans, updateStudyPlan, deleteStudyPlan, groupPlansByDate } from '../../api/studyPlanApi';
import Sidebar from '../../components/common/Sidebar/Sidebar';

const PlannerPage = ({ onLogout, userEmail }) => {
  // 날짜를 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudyItem, setSelectedStudyItem] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [studyData, setStudyData] = useState({});
  const [loading, setLoading] = useState(true);

  const [taskForm, setTaskForm] = useState({
    title: '',
    type: '',
    date: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  // 컴포넌트 마운트시 학습 계획 로드
  useEffect(() => {
    loadStudyPlans();
  }, [userEmail]);

  // 학습 계획 로드 함수
  const loadStudyPlans = async () => {
    if (!userEmail) return;

    try {
      setLoading(true);
      const plans = await getStudyPlans(userEmail);
      const groupedPlans = groupPlansByDate(plans);
      setStudyData(groupedPlans);
    } catch (error) {
      console.error('학습 계획 로드 실패:', error);
      alert('학습 계획을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      // 시간대 문제 해결: 로컬 날짜를 YYYY-MM-DD 형식으로 변환
      const dateString = formatDateToString(date);

      days.push({
        date: date,
        dateString: dateString,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        studyItems: studyData[dateString] || []
      });
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectDate = (dateString) => {
    console.log('선택된 날짜:', dateString); // 디버깅
    setSelectedDate(dateString);
  };

  const openAddTaskModal = () => {
    setIsModalOpen(true);
    if (selectedDate) {
      console.log('모달에 설정되는 날짜:', selectedDate); // 디버깅
      setTaskForm(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const closeAddTaskModal = () => {
    setIsModalOpen(false);
    setSelectedStudyItem(null);
    setEditingItemId(null);
    setTaskForm({
      title: '',
      type: '',
      date: '',
      startTime: '',
      endTime: '',
      description: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      alert('사용자 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    try {
      console.log('폼 제출 데이터:', taskForm); // 디버깅
      console.log('editingItemId:', editingItemId); // 디버깅

      if (editingItemId) {
        // 수정 모드
        console.log('수정 모드 - ID:', editingItemId); // 디버깅
        await updateStudyPlan(editingItemId, {
          title: taskForm.title,
          type: taskForm.type,
          date: taskForm.date,
          start_time: taskForm.startTime || null,
          end_time: taskForm.endTime || null,
          description: taskForm.description || null
        }, userEmail);
        alert('✅ 학습 계획이 수정되었습니다!');
      } else {
        // 생성 모드
        console.log('생성 모드 - 저장될 날짜:', taskForm.date); // 디버깅
        await createStudyPlan(taskForm, userEmail);
        alert('✅ 새로운 학습 계획이 추가되었습니다!');
      }

      // 성공시 데이터 다시 로드
      await loadStudyPlans();
      closeAddTaskModal();
    } catch (error) {
      console.error('학습 계획 처리 실패:', error);
      alert('학습 계획 처리 중 오류가 발생했습니다.');
    }
  };

  const generateAISchedule = () => {
    alert('🤖 AI가 당신의 학습 패턴을 분석하여 최적의 일정을 생성중입니다...\n\n✅ 개인 맞춤형 학습 계획이 생성되었습니다!');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    const tomorrowStr = formatDateToString(tomorrow);
    const dayAfterStr = formatDateToString(dayAfter);

    setStudyData(prev => ({
      ...prev,
      [tomorrowStr]: [
        ...(prev[tomorrowStr] || []),
        { title: 'AI 추천: React 심화', type: 'study', time: '15:00-17:00', completed: false },
        { title: 'AI 추천: 복습 퀴즈', type: 'quiz', time: '17:15-17:45', completed: false }
      ],
      [dayAfterStr]: [
        ...(prev[dayAfterStr] || []),
        { title: 'AI 추천: Node.js 실습', type: 'project', time: '10:00-12:00', completed: false }
      ]
    }));
  };

  const applySuggestion = (suggestionId) => {
    const suggestions = [
      'React 심화 학습 일정이 추가되었습니다.',
      '오후 3-5시 시간대에 우선순위 학습이 배치되었습니다.',
      'Node.js 복습 일정이 조정되었습니다.'
    ];

    alert(`✅ ${suggestions[suggestionId - 1]}`);
  };

  // 일정 클릭 핸들러
  const handleStudyItemClick = (item, date) => {
    setSelectedStudyItem({ ...item, date });
    setIsDetailModalOpen(true);
  };

  // 상세보기 모달 닫기
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedStudyItem(null);
  };

  // 일정 완료 상태 토글
  const toggleStudyItemCompletion = async (item) => {
    if (!userEmail || !item.id) return;

    try {
      await updateStudyPlan(item.id, { completed: !item.completed }, userEmail);
      await loadStudyPlans();
      setSelectedStudyItem(prev => ({ ...prev, completed: !prev.completed }));
      alert(item.completed ? '일정이 미완료로 변경되었습니다.' : '✅ 일정이 완료되었습니다!');
    } catch (error) {
      console.error('일정 상태 변경 실패:', error);
      alert('일정 상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 일정 삭제
  const deleteStudyItem = async (item) => {
    if (!userEmail || !item.id) return;

    if (!confirm('정말로 이 일정을 삭제하시겠습니까?')) return;

    try {
      await deleteStudyPlan(item.id, userEmail);
      await loadStudyPlans();
      closeDetailModal();
      alert('일정이 삭제되었습니다.');
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      alert('일정 삭제 중 오류가 발생했습니다.');
    }
  };

  // 일정 수정 모드로 전환
  const editStudyItem = (item) => {
    setTaskForm({
      title: item.title,
      type: item.type,
      date: item.date,
      startTime: item.time.includes('-') ? item.time.split('-')[0] : '',
      endTime: item.time.includes('-') ? item.time.split('-')[1] : '',
      description: item.description || ''
    });
    // 수정할 아이템의 ID를 별도로 저장
    setEditingItemId(item.id);
    closeDetailModal();
    setIsModalOpen(true);
  };

  const calendarDays = generateCalendar();

  if (loading) {
    return (
      <div className="planner-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#667eea'
        }}>
          🔄 학습 계획을 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="planner-container">
      {/* 사이드바 */}
      <Sidebar activeItem="planner" onLogout={onLogout} />

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 헤더 */}
        <div className="header">
          <div className="header-title">📅 학습 플래너</div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={generateAISchedule}>
              🤖 AI 일정 생성
            </button>
            <button className="btn" onClick={openAddTaskModal}>
              + 학습 추가
            </button>
          </div>
        </div>

        {/* 캘린더 */}
        <div className="calendar-container">
          <div className="calendar-header">
            <div className="calendar-nav">
              <button onClick={previousMonth}>‹ 이전</button>
              <div className="current-month">
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              </div>
              <button onClick={nextMonth}>다음 ›</button>
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>
              드래그&드롭으로 일정을 조정하세요
            </div>
          </div>

          <div className="calendar-grid">
            {/* 요일 헤더 */}
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}

            {/* 날짜들 */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${
                  selectedDate === day.dateString ? 'selected' : ''
                }`}
                onClick={() => selectDate(day.dateString)}
              >
                <div className="day-number">{day.date.getDate()}</div>
                <div className="study-items">
                  {day.studyItems.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`study-item ${item.completed ? 'completed' : ''} ${item.type}`}
                      title={`${item.title} (${item.time})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStudyItemClick(item, day.dateString);
                      }}
                    >
                      {item.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI 추천 */}
        <div className="ai-suggestions">
          <div className="suggestions-title">
            <span>🤖</span>
            AI 학습 추천
          </div>

          <div className="suggestion-item" onClick={() => applySuggestion(1)}>
            <div className="suggestion-title">React 심화 학습 집중 주간</div>
            <div className="suggestion-desc">
              최근 학습 패턴을 분석한 결과, React 관련 학습이 부족합니다.
              이번 주에 React 심화 과정을 집중적으로 학습하는 것을 추천합니다.
            </div>
          </div>

          <div className="suggestion-item" onClick={() => applySuggestion(2)}>
            <div className="suggestion-title">오후 3-5시 학습 효율 최대화</div>
            <div className="suggestion-desc">
              당신의 학습 데이터에 따르면 오후 3-5시에 집중도가 가장 높습니다.
              이 시간대에 어려운 개념 학습을 배치해보세요.
            </div>
          </div>

          <div className="suggestion-item" onClick={() => applySuggestion(3)}>
            <div className="suggestion-title">복습 주기 조정 필요</div>
            <div className="suggestion-desc">
              Node.js 관련 내용의 복습 주기를 단축하는 것이 좋겠습니다.
              현재 기억 곡선 분석 결과 추가 복습이 필요한 상태입니다.
            </div>
          </div>
        </div>
      </div>

      {/* 일정 상세보기 모달 */}
      {isDetailModalOpen && selectedStudyItem && (
        <div className="add-task-modal" onClick={(e) => e.target.className === 'add-task-modal' && closeDetailModal()}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">📅 학습 계획 상세</div>
              <button className="close-btn" onClick={closeDetailModal}>&times;</button>
            </div>

            <div className="study-detail">
              <div className="detail-section">
                <h3>📚 {selectedStudyItem.title}</h3>
                <div className="detail-badges">
                  <span className={`badge badge-${selectedStudyItem.type}`}>
                    {selectedStudyItem.type === 'study' ? '📖 일반 학습' :
                     selectedStudyItem.type === 'quiz' ? '❓ 퀴즈' :
                     selectedStudyItem.type === 'project' ? '🛠️ 프로젝트' : '🔄 복습'}
                  </span>
                  <span className={`badge ${selectedStudyItem.completed ? 'badge-completed' : 'badge-pending'}`}>
                    {selectedStudyItem.completed ? '✅ 완료' : '⏳ 진행중'}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-item">
                  <span className="detail-label">📅 날짜:</span>
                  <span className="detail-value">{selectedStudyItem.date}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">⏰ 시간:</span>
                  <span className="detail-value">{selectedStudyItem.time}</span>
                </div>
                {selectedStudyItem.description && (
                  <div className="detail-item">
                    <span className="detail-label">📝 설명:</span>
                    <span className="detail-value">{selectedStudyItem.description}</span>
                  </div>
                )}
              </div>

              <div className="detail-actions">
                <button
                  className={`btn ${selectedStudyItem.completed ? 'btn-warning' : 'btn-success'}`}
                  onClick={() => toggleStudyItemCompletion(selectedStudyItem)}
                >
                  {selectedStudyItem.completed ? '↩️ 미완료로 변경' : '✅ 완료로 표시'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => editStudyItem(selectedStudyItem)}
                >
                  ✏️ 수정
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteStudyItem(selectedStudyItem)}
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 학습 추가 모달 */}
      {isModalOpen && (
        <div className="add-task-modal" onClick={(e) => e.target.className === 'add-task-modal' && closeAddTaskModal()}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                {editingItemId ? '✏️ 학습 계획 수정' : '📝 새 학습 계획 추가'}
              </div>
              <button className="close-btn" onClick={closeAddTaskModal}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="title">학습 주제</label>
                <input
                  type="text"
                  name="title"
                  value={taskForm.title}
                  onChange={handleFormChange}
                  placeholder="예: React Hooks 심화"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">학습 유형</label>
                <select
                  name="type"
                  value={taskForm.type}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="study">일반 학습</option>
                  <option value="quiz">퀴즈</option>
                  <option value="project">프로젝트</option>
                  <option value="review">복습</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">날짜</label>
                <input
                  type="date"
                  name="date"
                  value={taskForm.date}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>시간</label>
                <div className="time-grid">
                  <input
                    type="time"
                    name="startTime"
                    value={taskForm.startTime}
                    onChange={handleFormChange}
                    placeholder="시작 시간"
                  />
                  <input
                    type="time"
                    name="endTime"
                    value={taskForm.endTime}
                    onChange={handleFormChange}
                    placeholder="종료 시간"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">상세 내용</label>
                <textarea
                  name="description"
                  value={taskForm.description}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="학습할 내용을 자세히 적어주세요"
                />
              </div>

              <button type="submit" className="btn" style={{ width: '100%' }}>
                {editingItemId ? '✏️ 학습 계획 수정' : '📝 학습 계획 추가'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;