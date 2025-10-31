import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SpeakingTestPage.css';

/**
 * 말하기평가 메인 페이지
 */
const SpeakingTestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [metadata, setMetadata] = useState(null);
  const [participantId, setParticipantId] = useState(null);

  useEffect(() => {
    // 로그인 페이지에서 전달받은 메타데이터 확인
    if (!location.state?.metadata || !location.state?.participantId) {
      // 메타데이터가 없으면 로그인 페이지로 리다이렉트
      alert('먼저 참여자 ID를 입력해주세요.');
      navigate('/speaking-login');
      return;
    }

    setMetadata(location.state.metadata);
    setParticipantId(location.state.participantId);
  }, [location.state, navigate]);

  if (!metadata) {
    return (
      <div className="speaking-test-page">
        <div className="loading-container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="speaking-test-page">
      <div className="test-container">
        <div className="test-header">
          <h1 className="test-title">💬 말하기평가</h1>
          <div className="participant-info">
            <p className="participant-id">참여자 ID: <strong>{participantId}</strong></p>
            {metadata.name && <p className="participant-name">이름: <strong>{metadata.name}</strong></p>}
          </div>
        </div>

        <div className="metadata-summary">
          <h3>참여자 정보</h3>
          <div className="meta-grid">
            {metadata.participant_id && (
              <div className="meta-item">
                <span className="meta-label">ID:</span>
                <span className="meta-value">{metadata.participant_id}</span>
              </div>
            )}
            {metadata.name && (
              <div className="meta-item">
                <span className="meta-label">이름:</span>
                <span className="meta-value">{metadata.name}</span>
              </div>
            )}
            {metadata.birth_year && (
              <div className="meta-item">
                <span className="meta-label">출생연도:</span>
                <span className="meta-value">{metadata.birth_year}</span>
              </div>
            )}
            {metadata.native_language && (
              <div className="meta-item">
                <span className="meta-label">모국어:</span>
                <span className="meta-value">{metadata.native_language}</span>
              </div>
            )}
            {metadata.korean_acquisition_months !== null && metadata.korean_acquisition_months !== undefined && (
              <div className="meta-item">
                <span className="meta-label">한국어 습득 기간:</span>
                <span className="meta-value">{metadata.korean_acquisition_months}개월</span>
              </div>
            )}
          </div>
        </div>

        <div className="test-instructions">
          <h3>평가 안내</h3>
          <p>말하기평가는 다음 단계로 진행됩니다:</p>
          <ul>
            <li>💡 주제에 대한 자유 발화</li>
            <li>🗣️ 질문에 대한 응답</li>
            <li>📊 종합 평가</li>
          </ul>
          <p className="note">* 각 문항은 자동으로 녹음되며, 평가 후 피드백을 제공합니다.</p>
        </div>

        <div className="action-buttons">
          <button 
            className="back-button"
            onClick={() => navigate('/speaking-login')}
          >
            ← 뒤로가기
          </button>
          <button 
            className="start-button"
            onClick={() => {
              // TODO: 말하기평가 첫 번째 문항으로 이동
              alert('말하기평가 문항 구현 예정');
            }}
          >
            평가 시작하기 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeakingTestPage;
