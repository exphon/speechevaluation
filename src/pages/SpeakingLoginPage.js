import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMetadataByParticipantId, createSession } from '../services/api';
import './SpeakingLoginPage.css';

// 말하기평가용 ID 생성 (S_ 접두어)
const generateSpeakingId = (baseNumber) => `S_${baseNumber}`;

/**
 * 말하기평가 로그인 페이지 - 6자리 ID로 메타데이터 조회
 */
const SpeakingLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // CompletionPage에서 전달받은 prefilledId가 있으면 사용, 없으면 빈 문자열
  const prefilledId = location.state?.prefilledId || '';
  const [participantId, setParticipantId] = useState(prefilledId);
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
      // P_ 접두어를 붙여 발음평가 메타데이터 조회
      const pronunciationId = `P_${participantId}`;
      const metadata = await getMetadataByParticipantId(pronunciationId);
      
      console.log('✅ 발음평가 메타데이터 조회 성공:', metadata);
      console.log('📊 발음 평가 등급 (서버):', metadata.pronunciation_level);
      
      // sessionStorage에서 발음 등급 확인 (서버보다 우선)
      let pronunciationLevel = metadata.pronunciation_level;
      try {
        const storedLevel = sessionStorage.getItem(`pronunciation_level_${pronunciationId}`);
        if (storedLevel) {
          console.log(`💾 로컬 저장된 발음 등급 발견: ${storedLevel}`);
          pronunciationLevel = storedLevel;
        }
      } catch (error) {
        console.warn('⚠️ sessionStorage 읽기 실패:', error);
      }
      
      // 최종 발음 등급 (로컬 > 서버 > 기본값 '하')
      pronunciationLevel = pronunciationLevel || '하';
      console.log('📊 최종 발음 평가 등급:', pronunciationLevel);
      
      // 말하기평가용 ID 생성
      const speakingId = generateSpeakingId(participantId);
      
      // 말하기평가 세션 생성
      const speakingMetadata = {
        ...metadata,
        participant_id: speakingId, // S_ 접두어 ID로 변경
        base_pronunciation_id: pronunciationId, // 원본 발음평가 ID 참조
        pronunciation_level: pronunciationLevel, // 최종 발음 등급 반영
        evaluation_type: 'speaking',
        created_at: new Date().toISOString(),
      };
      
      console.log('📝 말하기평가 메타데이터:', speakingMetadata);
      console.log('📊 전달될 발음 평가 등급:', speakingMetadata.pronunciation_level);

      try {
        const sessionName = speakingId; // S_123456 형태로 저장
        const description = '말하기평가 (발음평가 메타정보 기반)';
        const session = await createSession(sessionName, description, speakingMetadata);
        
        speakingMetadata.session_id = session.id;
        console.log('✅ 말하기평가 세션 생성 성공:', session.id);
      } catch (sessionError) {
        console.warn('⚠️ 세션 생성 실패, 로컬 모드로 진행:', sessionError);
      }
      
      // 말하기평가 페이지로 이동
      navigate('/speaking-test', {
        state: {
          metadata: speakingMetadata,
          participantId: speakingId,
        }
      });
      
    } catch (error) {
      console.error('❌ 메타데이터 조회 실패:', error);
      
      // 404 또는 찾을 수 없는 경우
      if (error.response?.status === 404 || error.message.includes('not found')) {
        setError(
          `ID "${participantId}"를 찾을 수 없습니다.\n발음평가를 먼저 완료해주세요.`
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
            <label htmlFor="participantId">참여자 ID (6자리 숫자만)</label>
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
            <p className="hint">
              발음평가 ID의 숫자 부분만 입력하세요 (P_ 제외)<br/>
              <small>예: 발음평가 ID가 P_123456이면 → 123456만 입력</small>
            </p>
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
