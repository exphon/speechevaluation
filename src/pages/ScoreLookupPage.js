import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionById, getSessionScore } from '../services/api';
import './ScoreLookupPage.css';

const ScoreLookupPage = () => {
  const navigate = useNavigate();
  
  const [sessionId, setSessionId] = useState('');
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sessionId) {
      setError('세션 ID를 입력해주세요.');
      return;
    }

    setSearching(true);
    setError('');
    setResult(null);

    try {
      // 세션 정보 조회
      const session = await getSessionById(sessionId);
      
      if (!session) {
        setError('해당 세션을 찾을 수 없습니다.');
        setSearching(false);
        return;
      }

      // 이메일 검증 (이메일이 등록된 경우)
      if (session.email && email) {
        if (session.email !== email) {
          setError('등록된 이메일과 일치하지 않습니다.');
          setSearching(false);
          return;
        }
      }

      // 점수 조회
      const scoreData = await getSessionScore(sessionId);
      
      setResult({
        session,
        score: scoreData
      });

    } catch (err) {
      console.error('❌ 점수 조회 실패:', err);
      setError('점수를 조회하는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setSearching(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="score-lookup-page">
      <div className="lookup-container">
        <div className="lookup-header">
          <h1 className="lookup-title">📊 점수 조회</h1>
          <p className="lookup-subtitle">
            평가 완료 후 받으신 정보로 점수를 확인하세요
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="lookup-form">
            <div className="form-group">
              <label htmlFor="sessionId">세션 ID *</label>
              <input
                type="text"
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="예: 12356"
                disabled={searching}
                required
              />
              <p className="hint">평가 완료 시 안내받은 세션 ID를 입력하세요</p>
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일 (선택)</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                disabled={searching}
              />
              <p className="hint">이메일을 등록하신 경우 입력하세요</p>
            </div>

            {error && (
              <div className="error-box">
                <p>{error}</p>
              </div>
            )}

            <div className="button-group">
              <button 
                type="button" 
                className="back-button"
                onClick={handleGoHome}
                disabled={searching}
              >
                ← 홈으로
              </button>
              <button 
                type="submit" 
                className="search-button"
                disabled={searching}
              >
                {searching ? '조회 중...' : '점수 조회하기'}
              </button>
            </div>
          </form>
        ) : (
          <div className="result-section">
            <div className="result-card">
              <h2>평가 결과</h2>
              
              <div className="session-details">
                <div className="detail-item">
                  <span className="label">참여자 ID:</span>
                  <span className="value">{result.session.metadata?.participant_id || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">이름:</span>
                  <span className="value">{result.session.metadata?.name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">평가 일시:</span>
                  <span className="value">
                    {result.session.created_at 
                      ? new Date(result.session.created_at).toLocaleString('ko-KR')
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {result.score ? (
                <div className="score-section">
                  <div className="score-box">
                    <h3>종합 점수</h3>
                    <div className="total-score">
                      {result.score.total_score || 'N/A'}
                    </div>
                    <p className="score-grade">등급: {result.score.grade || '미산정'}</p>
                  </div>

                  {result.score.details && (
                    <div className="score-details">
                      <h4>세부 항목</h4>
                      <div className="detail-scores">
                        {Object.entries(result.score.details).map(([key, value]) => (
                          <div key={key} className="score-item">
                            <span className="item-label">{key}:</span>
                            <span className="item-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-score-box">
                  <p>⏳ 채점이 아직 완료되지 않았습니다.</p>
                  <p className="sub-text">
                    채점이 완료되면 이메일로 알림을 받으실 수 있습니다.<br />
                    나중에 다시 조회해주세요.
                  </p>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button className="reset-button" onClick={() => {
                setResult(null);
                setSessionId('');
                setEmail('');
                setError('');
              }}>
                다시 조회하기
              </button>
              <button className="home-button" onClick={handleGoHome}>
                홈으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreLookupPage;
