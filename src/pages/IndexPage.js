import React from 'react';
import { useNavigate } from 'react-router-dom';
import './IndexPage.css';

/**
 * 메인 페이지 - 환영 메시지와 발음평가/말하기평가 선택
 */
const IndexPage = () => {
  const navigate = useNavigate();

  const handlePronunciationClick = () => {
    // 발음평가 참가 (기존 플로우)
    navigate('/instructions');
  };

  const handleSpeakingClick = () => {
    // 말하기평가 참가 (새 플로우)
    navigate('/speaking-login');
  };

  return (
    <div className="index-page">
      <div className="welcome-container">
        <h1 className="welcome-title">
          말하기 평가 시스템에 오신 것을 환영합니다
        </h1>
        
        <div className="welcome-content">
          <p className="welcome-description">
            이 시스템은 여러분의 발음과 말하기 능력을 평가하는 도구입니다.
          </p>
          <p className="welcome-description">
            발음평가와 말하기평가 중 선택하여 참가할 수 있습니다.
          </p>
          
          <div className="evaluation-types">
            <div className="eval-card">
              <h3>🎤 발음평가</h3>
              <div className="info-box">
                <h4>평가 구성</h4>
                <ul>
                  <li>📝 단어 읽기 (10개)</li>
                  <li>📄 문장 읽기 (3개)</li>
                  <li>📖 문단 읽기 (1개)</li>
                </ul>
              </div>
              <button 
                className="join-button pronunciation"
                onClick={handlePronunciationClick}
              >
                발음평가 참가하기
              </button>
            </div>

            <div className="eval-card">
              <h3>💬 말하기평가</h3>
              <div className="info-box">
                <h4>평가 구성</h4>
                <ul>
                  <li>💡 주제별 말하기</li>
                  <li>🗣️ 자유 발화</li>
                  <li>📊 종합 평가</li>
                </ul>
              </div>
              <button 
                className="join-button speaking"
                onClick={handleSpeakingClick}
              >
                말하기평가 참가하기
              </button>
              <p className="note">* 발음평가를 먼저 완료해야 합니다</p>
            </div>
          </div>
        </div>

        <div className="system-info">
          <p>🎤 이 시스템은 마이크 권한이 필요합니다</p>
          <p>🔊 조용한 환경에서 진행해주세요</p>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
