import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMetadataByParticipantId } from '../services/api';
import './SpeakingLoginPage.css';

/**
 * 말하기평가 로그인 페이지 - 6자리 ID로 메타데이터 조회
 */
const SpeakingLoginPage = () => {
  const navigate = useNavigate();
  const [participantId, setParticipantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setParticipantId(value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (participantId.length !== 6) {
      setError('6자리 ID를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 서버에서 메타데이터 조회
      const metadata = await getMetadataByParticipantId(participantId);
      
      console.log('✅ 메타데이터 조회 성공:', metadata);
      
      // 말하기평가 페이지로 이동 (메타데이터와 함께)
      navigate('/speaking-test', {
        state: {
          metadata: metadata,
          participantId: participantId,
        }
      });
      
    } catch (error) {
      console.error('❌ 메타데이터 조회 실패:', error);
      
      // 404 또는 찾을 수 없는 경우
      if (error.response?.status === 404 || error.message.includes('not found')) {
        setError(
          '해당 ID를 찾을 수 없습니다.\n발음평가를 먼저 완료해주세요.'
        );
      } else {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      
      setLoading(false);
    }
  };

  const handleBackToPronunciation = () => {
    navigate('/');
  };

  return (
    <div className="speaking-login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">💬 말하기평가</h1>
          <p className="login-subtitle">참여자 ID를 입력하여 시작하세요</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="participantId">참여자 ID (6자리)</label>
            <input
              id="participantId"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={participantId}
              onChange={handleIdChange}
              placeholder="예: 123456"
              className={error ? 'error' : ''}
              disabled={loading}
              autoFocus
            />
            <p className="hint">발음평가 시 받은 6자리 ID를 입력하세요</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <div className="error-text">
                {error.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              <button 
                type="button"
                className="back-to-pronunciation-btn"
                onClick={handleBackToPronunciation}
              >
                발음평가 참가하기
              </button>
            </div>
          )}

          <div className="button-group">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              ← 뒤로가기
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading || participantId.length !== 6}
            >
              {loading ? '조회 중...' : '시작하기 →'}
            </button>
          </div>
        </form>

        <div className="info-note">
          <p>💡 발음평가를 완료한 참여자만 말하기평가에 참가할 수 있습니다.</p>
          <p>🔒 입력하신 ID로 이전에 저장된 정보를 불러옵니다.</p>
        </div>
      </div>
    </div>
  );
};

export default SpeakingLoginPage;
