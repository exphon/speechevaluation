import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { updateSessionEmail } from '../services/api';
import './SpeakingCompletionPage.css';

const SpeakingCompletionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const sessionId = location.state?.sessionId;
  const participantId = location.state?.participantId;
  const metadata = location.state?.metadata;
  
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    // 간단한 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (sessionId) {
        await updateSessionEmail(sessionId, email);
        console.log('✅ 이메일 저장 성공:', email);
      }
      setEmailSubmitted(true);
    } catch (err) {
      console.error('❌ 이메일 저장 실패:', err);
      setError('이메일 저장에 실패했습니다. 나중에 점수 조회 페이지에서 다시 시도해주세요.');
      setEmailSubmitted(true); // 실패해도 진행 가능하도록
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleCheckScore = () => {
    navigate('/score-lookup');
  };

  return (
    <div className="speaking-completion-page">
      <div className="completion-container">
        <div className="completion-header">
          <div className="success-icon">✅</div>
          <h1 className="completion-title">말하기 평가 완료!</h1>
          <p className="completion-message">
            평가에 참여해 주셔서 감사합니다.
          </p>
        </div>

        {!emailSubmitted ? (
          <div className="email-section">
            <div className="info-box">
              <h3>📧 결과 알림 받기</h3>
              <p>
                이메일을 등록하시면 평가 결과가 나왔을 때<br />
                알림을 받으실 수 있습니다.
              </p>
              <p className="optional-text">(선택사항)</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="email-form">
              <div className="form-group">
                <label htmlFor="email">이메일 주소</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  disabled={submitting}
                />
                {error && <p className="error-message">{error}</p>}
              </div>

              <div className="button-group">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={submitting}
                >
                  {submitting ? '저장 중...' : '등록하기'}
                </button>
                <button 
                  type="button" 
                  className="skip-button"
                  onClick={() => setEmailSubmitted(true)}
                  disabled={submitting}
                >
                  건너뛰기
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="result-info-section">
            <div className="info-card">
              <h3>📊 결과 안내</h3>
              <p className="info-text">
                평가 결과는 채점 후 공지됩니다.<br />
                아래 정보로 결과를 조회하실 수 있습니다.
              </p>
              
              <div className="session-info">
                <div className="info-item">
                  <span className="label">참여자 ID:</span>
                  <span className="value">{participantId || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">세션 ID:</span>
                  <span className="value">{sessionId || 'N/A'}</span>
                </div>
                {email && (
                  <div className="info-item">
                    <span className="label">등록된 이메일:</span>
                    <span className="value">{email}</span>
                  </div>
                )}
              </div>

              <div className="notice-box">
                <p>💡 위 정보를 메모해두시면 나중에 점수 조회가 편리합니다.</p>
              </div>
            </div>

            <div className="action-buttons">
              <button className="secondary-button" onClick={handleCheckScore}>
                점수 조회하기
              </button>
              <button className="primary-button" onClick={handleGoHome}>
                홈으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakingCompletionPage;
