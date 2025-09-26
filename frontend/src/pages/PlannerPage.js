// frontend/src/pages/PlannerPage.js

import React, { useState, useEffect } from 'react';
import { 
  PlannerContainer,
  PlannerMainContent,
  PlannerHeader, 
  Calendar, 
  AISuggestions, 
  StudyDetailModal, 
  AddTaskModal 
} from '../components/planner/PlannerComponents';
import { createStudyPlan, getStudyPlans, updateStudyPlan, deleteStudyPlan, groupPlansByDate } from '../api/studyPlanApi';
import Sidebar from '../components/sidebar/SidebarComponents';

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
    setSelectedDate(dateString);
  };

  const openAddTaskModal = () => {
    setIsModalOpen(true);
    if (selectedDate) {
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
      if (editingItemId) {
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
        await createStudyPlan(taskForm, userEmail);
        alert('✅ 새로운 학습 계획이 추가되었습니다!');
      }

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

  const handleStudyItemClick = (item, date) => {
    setSelectedStudyItem({ ...item, date });
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedStudyItem(null);
  };

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

  const editStudyItem = (item) => {
    setTaskForm({
      title: item.title,
      type: item.type,
      date: item.date,
      startTime: item.time.includes('-') ? item.time.split('-')[0] : '',
      endTime: item.time.includes('-') ? item.time.split('-')[1] : '',
      description: item.description || ''
    });
    setEditingItemId(item.id);
    closeDetailModal();
    setIsModalOpen(true);
  };

  const calendarDays = generateCalendar();

  if (loading) {
    return (
      <PlannerContainer>
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
      </PlannerContainer>
    );
  }

  return (
    <PlannerContainer>
      {/* 사이드바 */}
      <Sidebar activeItem="planner" onLogout={onLogout} />
      
      {/* 메인 컨텐츠 */}
      <PlannerMainContent>
        {/* 헤더 */}
        <PlannerHeader 
          onGenerateAI={generateAISchedule}
          onAddTask={openAddTaskModal}
        />

        {/* 캘린더 */}
        <Calendar
          currentDate={currentDate}
          calendarDays={calendarDays}
          selectedDate={selectedDate}
          onPreviousMonth={previousMonth}
          onNextMonth={nextMonth}
          onSelectDate={selectDate}
          onStudyItemClick={handleStudyItemClick}
        />

        {/* AI 추천 */}
        <AISuggestions onApplySuggestion={applySuggestion} />
      </PlannerMainContent>

      {/* 상세보기 모달 */}
      <StudyDetailModal
        isOpen={isDetailModalOpen}
        selectedStudyItem={selectedStudyItem}
        onClose={closeDetailModal}
        onToggleCompletion={toggleStudyItemCompletion}
        onEdit={editStudyItem}
        onDelete={deleteStudyItem}
      />

      {/* 학습 추가 모달 */}
      <AddTaskModal
        isOpen={isModalOpen}
        taskForm={taskForm}
        editingItemId={editingItemId}
        onClose={closeAddTaskModal}
        onFormChange={handleFormChange}
        onFormSubmit={handleFormSubmit}
      />
    </PlannerContainer>
  );
};

export default PlannerPage;