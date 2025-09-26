// frontend/src/components/planner/PlannerComponents.js

import React from 'react';
import styles from './Planner.module.css';

export const PlannerContainer = ({ children }) => {
  return <div className={styles.plannerContainer}>{children}</div>;
};

export const PlannerMainContent = ({ children }) => {
  return <div className={styles.plannerMainContent}>{children}</div>;
};

export const PlannerHeader = ({ onGenerateAI, onAddTask }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerTitle}>📅 학습 플래너</div>
      <div className={styles.headerActions}>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onGenerateAI}>
          🤖 AI 일정 생성
        </button>
        <button className={styles.btn} onClick={onAddTask}>
          + 학습 추가
        </button>
      </div>
    </div>
  );
};

export const Calendar = ({ 
  currentDate, 
  calendarDays, 
  selectedDate, 
  onPreviousMonth, 
  onNextMonth, 
  onSelectDate, 
  onStudyItemClick 
}) => {
  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <div className={styles.calendarNav}>
          <button onClick={onPreviousMonth}>‹ 이전</button>
          <div className={styles.currentMonth}>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </div>
          <button onClick={onNextMonth}>다음 ›</button>
        </div>
        <div className={styles.calendarSubtitle}>
          드래그&드롭으로 일정을 조정하세요
        </div>
      </div>

      <div className={styles.calendarGrid}>
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className={styles.calendarDayHeader}>{day}</div>
        ))}

        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`${styles.calendarDay} ${
              !day.isCurrentMonth ? styles.otherMonth : ''
            } ${selectedDate === day.dateString ? styles.selected : ''}`}
            onClick={() => onSelectDate(day.dateString)}
          >
            <div className={styles.dayNumber}>{day.date.getDate()}</div>
            <div className={styles.studyItems}>
              {day.studyItems.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`${styles.studyItem} ${
                    item.completed ? styles.completed : ''
                  } ${styles[item.type]}`}
                  title={`${item.title} (${item.time})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStudyItemClick(item, day.dateString);
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
  );
};

export const AISuggestions = ({ onApplySuggestion }) => {
  const suggestions = [
    {
      id: 1,
      title: 'React 심화 학습 집중 주간',
      description: '최근 학습 패턴을 분석한 결과, React 관련 학습이 부족합니다. 이번 주에 React 심화 과정을 집중적으로 학습하는 것을 추천합니다.'
    },
    {
      id: 2,
      title: '오후 3-5시 학습 효율 최대화',
      description: '당신의 학습 데이터에 따르면 오후 3-5시에 집중도가 가장 높습니다. 이 시간대에 어려운 개념 학습을 배치해보세요.'
    },
    {
      id: 3,
      title: '복습 주기 조정 필요',
      description: 'Node.js 관련 내용의 복습 주기를 단축하는 것이 좋겠습니다. 현재 기억 곡선 분석 결과 추가 복습이 필요한 상태입니다.'
    }
  ];

  return (
    <div className={styles.aiSuggestions}>
      <div className={styles.suggestionsTitle}>
        <span>🤖</span>
        AI 학습 추천
      </div>

      {suggestions.map((suggestion) => (
        <div 
          key={suggestion.id}
          className={styles.suggestionItem} 
          onClick={() => onApplySuggestion(suggestion.id)}
        >
          <div className={styles.suggestionTitle}>{suggestion.title}</div>
          <div className={styles.suggestionDesc}>{suggestion.description}</div>
        </div>
      ))}
    </div>
  );
};

export const StudyDetailModal = ({ 
  isOpen, 
  selectedStudyItem, 
  onClose, 
  onToggleCompletion, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !selectedStudyItem) return null;

  const getTypeLabel = (type) => {
    const typeLabels = {
      study: '📖 일반 학습',
      quiz: '❓ 퀴즈',
      project: '🛠️ 프로젝트',
      review: '🔄 복습'
    };
    return typeLabels[type] || type;
  };

  return (
    <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>📅 학습 계획 상세</div>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.studyDetail}>
          <div className={styles.detailSection}>
            <h3>📚 {selectedStudyItem.title}</h3>
            <div className={styles.detailBadges}>
              <span className={`${styles.badge} ${styles[`badge${selectedStudyItem.type.charAt(0).toUpperCase() + selectedStudyItem.type.slice(1)}`]}`}>
                {getTypeLabel(selectedStudyItem.type)}
              </span>
              <span className={`${styles.badge} ${selectedStudyItem.completed ? styles.badgeCompleted : styles.badgePending}`}>
                {selectedStudyItem.completed ? '✅ 완료' : '⏳ 진행중'}
              </span>
            </div>
          </div>

          <div className={styles.detailSection}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>📅 날짜:</span>
              <span className={styles.detailValue}>{selectedStudyItem.date}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>⏰ 시간:</span>
              <span className={styles.detailValue}>{selectedStudyItem.time}</span>
            </div>
            {selectedStudyItem.description && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>📝 설명:</span>
                <span className={styles.detailValue}>{selectedStudyItem.description}</span>
              </div>
            )}
          </div>

          <div className={styles.detailActions}>
            <button
              className={`${styles.btn} ${selectedStudyItem.completed ? styles.btnWarning : styles.btnSuccess}`}
              onClick={() => onToggleCompletion(selectedStudyItem)}
            >
              {selectedStudyItem.completed ? '↩️ 미완료로 변경' : '✅ 완료로 표시'}
            </button>
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => onEdit(selectedStudyItem)}
            >
              ✏️ 수정
            </button>
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => onDelete(selectedStudyItem)}
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AddTaskModal = ({ 
  isOpen, 
  taskForm, 
  editingItemId, 
  onClose, 
  onFormChange, 
  onFormSubmit 
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            {editingItemId ? '✏️ 학습 계획 수정' : '📝 새 학습 계획 추가'}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={onFormSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">학습 주제</label>
            <input
              type="text"
              name="title"
              value={taskForm.title}
              onChange={onFormChange}
              placeholder="예: React Hooks 심화"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">학습 유형</label>
            <select
              name="type"
              value={taskForm.type}
              onChange={onFormChange}
              required
            >
              <option value="">선택하세요</option>
              <option value="study">일반 학습</option>
              <option value="quiz">퀴즈</option>
              <option value="project">프로젝트</option>
              <option value="review">복습</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date">날짜</label>
            <input
              type="date"
              name="date"
              value={taskForm.date}
              onChange={onFormChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>시간</label>
            <div className={styles.timeGrid}>
              <input
                type="time"
                name="startTime"
                value={taskForm.startTime}
                onChange={onFormChange}
                placeholder="시작 시간"
              />
              <input
                type="time"
                name="endTime"
                value={taskForm.endTime}
                onChange={onFormChange}
                placeholder="종료 시간"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">상세 내용</label>
            <textarea
              name="description"
              value={taskForm.description}
              onChange={onFormChange}
              rows="3"
              placeholder="학습할 내용을 자세히 적어주세요"
            />
          </div>

          <button type="submit" className={`${styles.btn} ${styles.fullWidth}`}>
            {editingItemId ? '✏️ 학습 계획 수정' : '📝 학습 계획 추가'}
          </button>
        </form>
      </div>
    </div>
  );
};