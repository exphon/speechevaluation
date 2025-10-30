import React from 'react';
import { useNavigate } from 'react-router-dom';
import './IndexPage.css';

/**
 * 메인 페이지 - 환영 메시지와 참가 버튼
 */
const IndexPage = () => {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    navigate('/instructions');
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
            단어, 문장, 문단을 읽으면서 여러분의 발음을 녹음하고,
            AI가 자동으로 평가하여 피드백을 제공합니다.
          </p>
          
          <div className="info-box">
            <h3>평가 구성</h3>
            <ul>
              <li>📝 단어 읽기 (10개)</li>
              <li>📄 문장 읽기 (3개)</li>
              <li>📖 문단 읽기 (1개)</li>
              <li>🎯 적응형 문제</li>
            </ul>
          </div>

          <button 
            className="join-button"
            onClick={handleJoinClick}
          >
            참가하기
          </button>
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
