import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { transcribeRecording, getRecording, updateSessionPronunciationLevel } from '../services/api';
import { evaluatePronunciation } from '../utils/levenshtein';
import './CompletionPage.css';

/**
 * 평가 완료 페이지
 */
const CompletionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptions, setTranscriptions] = useState({});
  const [transcriptionErrors, setTranscriptionErrors] = useState({});
  const [transcriptionDetails, setTranscriptionDetails] = useState({}); // confidence, language 등
  const [overallEvaluation, setOverallEvaluation] = useState(null); // 전체 평가 결과

  const sessionId = location.state?.sessionId;
  const wordRecordings = location.state?.wordRecordings || [];
  const sentenceRecordings = location.state?.sentenceRecordings || [];
  const paragraphRecording = location.state?.paragraphRecording || null;
  const meta = location.state?.meta || null;

  const totalRecordings = wordRecordings.length + sentenceRecordings.length + (paragraphRecording ? 1 : 0);

  /**
   * 모든 녹음 전사
   */
  const handleTranscribeAll = async () => {
    if (!sessionId) {
      alert('로컬 모드에서는 전사를 사용할 수 없습니다.');
      return;
    }

    const allRecordingIds = [
      ...wordRecordings.map(r => r.id).filter(id => id),
      ...sentenceRecordings.map(r => r.id).filter(id => id),
      paragraphRecording?.id
    ].filter(Boolean);

    if (allRecordingIds.length === 0) {
      alert('전사할 녹음이 없습니다.');
      return;
    }

    setTranscribing(true);
    console.log(`🎤 전체 전사 시작: ${allRecordingIds.length}개 녹음`);

    let totalScore = 0;
    let evaluatedCount = 0;

    for (const recordingId of allRecordingIds) {
      try {
        // 전사 수행
        const result = await transcribeRecording(recordingId);
        
        // 전사 텍스트 저장
        const transcriptionText = result.transcription || result.text;
        setTranscriptions(prev => ({
          ...prev,
          [recordingId]: transcriptionText
        }));
        
        // 추가 정보 저장
        if (result.confidence !== undefined || result.language) {
          setTranscriptionDetails(prev => ({
            ...prev,
            [recordingId]: {
              confidence: result.confidence,
              language: result.language
            }
          }));
        }
        
        console.log(`✅ 전사 완료 (${recordingId}):`, result);

        // 녹음 정보 가져오기 (original_text 포함)
        try {
          const recordingData = await getRecording(recordingId);
          const originalText = recordingData.original_text;

          if (originalText && transcriptionText) {
            // Levenshtein Distance 평가 수행
            const evaluation = evaluatePronunciation(originalText, transcriptionText);
            totalScore += evaluation.score;
            evaluatedCount++;

            console.log(`📊 평가 완료 (${recordingId}):`, evaluation);
          }
        } catch (error) {
          console.error(`⚠️ 녹음 정보 가져오기 실패 (${recordingId}):`, error);
        }
        
        // 서버 부하를 줄이기 위해 약간의 딜레이
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ 전사 실패 (${recordingId}):`, error);
        setTranscriptionErrors(prev => ({
          ...prev,
          [recordingId]: error.response?.data?.error || error.message
        }));
      }
    }

    // 전체 평가 결과 계산
    if (evaluatedCount > 0) {
      const averageScore = totalScore / evaluatedCount;
      const overallGrade = averageScore >= 80 ? '상' : averageScore >= 60 ? '중' : '하';
      
      setOverallEvaluation({
        averageScore: Math.round(averageScore * 10) / 10,
        grade: overallGrade,
        totalCount: evaluatedCount,
      });

      console.log(`📊 전체 평가:`, {
        averageScore: Math.round(averageScore * 10) / 10,
        grade: overallGrade,
        totalCount: evaluatedCount,
      });

      // 서버에 발음 등급 저장
      if (sessionId) {
        try {
          await updateSessionPronunciationLevel(sessionId, overallGrade);
          console.log(`✅ 발음 등급 서버 저장 완료: ${overallGrade}`);
        } catch (error) {
          console.error('⚠️ 발음 등급 저장 실패:', error);
          // 저장 실패해도 계속 진행
        }
      }
      
      // 브라우저 sessionStorage에도 저장 (서버 API가 GET에서 pronunciation_level을 반환하지 않는 경우 대비)
      if (meta?.participant_id) {
        try {
          sessionStorage.setItem(`pronunciation_level_${meta.participant_id}`, overallGrade);
          console.log(`💾 발음 등급 로컬 저장 완료: ${meta.participant_id} -> ${overallGrade}`);
        } catch (error) {
          console.error('⚠️ 로컬 저장 실패:', error);
        }
      }
    }

    setTranscribing(false);
    console.log('✅ 전체 전사 완료');
  };



  return (
    <div className="completion-page">
      <div className="completion-container">
        <div className="success-icon">🎉</div>
        
        <h1 className="completion-title">
          발음 평가가 완료되었습니다!
        </h1>
        
        <p className="completion-message">
          수고하셨습니다. 총 {totalRecordings}개의 녹음이 {sessionId ? '서버에 업로드' : '로컬에 저장'}되었습니다.
        </p>

        {sessionId && meta?.participant_id && (
          <div className="participant-id-card">
            <div className="card-header">
              <span className="card-icon">🆔</span>
              <h3>참여자 ID</h3>
            </div>
            <div className="card-body">
              <div className="id-display">
                {meta.participant_id}
              </div>
              <div className="card-notice">
                <div className="notice-icon">⚠️</div>
                <div className="notice-content">
                  <strong>중요: 이 ID를 반드시 기억하세요!</strong>
                  <p>말하기 평가를 진행하려면 이 ID가 필요합니다.</p>
                </div>
              </div>
              <div className="card-instruction">
                <div className="instruction-title">💡 말하기 평가 시 입력 방법</div>
                <div className="instruction-example">
                  <div className="example-row">
                    <span className="label">참여자 ID:</span>
                    <span className="value">{meta.participant_id}</span>
                  </div>
                  <div className="example-arrow">↓</div>
                  <div className="example-row">
                    <span className="label">입력할 숫자:</span>
                    <span className="value highlight">{meta.participant_id.replace('P_', '')}</span>
                  </div>
                  <div className="example-note">
                    (P_ 제외하고 숫자만 입력)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {sessionId ? (
          <div className="session-info-box">
            <h4>세션 정보</h4>
            <p>세션 ID: <strong>{sessionId}</strong></p>
          </div>
        ) : (
          <div className="session-info-box" style={{background: '#fff3e0', borderLeftColor: '#ff9800'}}>
            <h4>⚠️ 로컬 모드</h4>
            <p>서버 연결 없이 로컬에서만 녹음되었습니다.</p>
            <p style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>
              서버가 준비되면 녹음 파일을 수동으로 업로드해야 합니다.
            </p>
          </div>
        )}

        {sessionId && (
          <div className="transcription-controls">
            <button 
              className="transcribe-all-button"
              onClick={handleTranscribeAll}
              disabled={transcribing}
            >
              {transcribing ? '🔄 전사 중...' : '🎤 모든 녹음 전사하기'}
            </button>
            <p className="transcription-note">
              Whisper AI를 사용하여 음성을 텍스트로 변환합니다 (시간이 걸릴 수 있습니다)
            </p>
          </div>
        )}

        {overallEvaluation && (
          <div className="overall-evaluation-card">
            <div className="evaluation-header">
              <span className="evaluation-icon">📊</span>
              <h3>발음 평가 결과</h3>
            </div>
            <div className="evaluation-body">
              <div className="score-display">
                <div className="score-label">평균 점수</div>
                <div className="score-value">{overallEvaluation.averageScore}점</div>
                <div className="score-max">/ 100점</div>
              </div>
              <div className="grade-display">
                <div className="grade-label">종합 등급</div>
                <div 
                  className={`grade-badge grade-${overallEvaluation.grade}`}
                  style={{
                    backgroundColor: overallEvaluation.grade === '상' ? '#4caf50' : 
                                   overallEvaluation.grade === '중' ? '#ff9800' : '#f44336'
                  }}
                >
                  {overallEvaluation.grade}
                </div>
              </div>
              <div className="evaluation-info">
                <p>✅ {overallEvaluation.totalCount}개 녹음 평가 완료</p>
                <p className="evaluation-note">
                  * Levenshtein Distance 알고리즘을 사용하여 원본 텍스트와 전사 결과의 유사도를 측정했습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="summary-box">
          <h3>업로드된 녹음</h3>
          
          {wordRecordings.length > 0 && (
            <div className="recording-category">
              <h4>📝 단어 ({wordRecordings.length}개)</h4>
              <ul className="recording-list">
                {wordRecordings.map((rec, idx) => (
                  <li key={idx} className="recording-item">
                    <div className="recording-header">
                      <span className="recording-title">{rec.title || rec.word}</span>
                      <span className="recording-id">{rec.id ? `ID: ${rec.id}` : '로컬 저장'}</span>
                    </div>
                    {transcriptions[rec.id] && (
                      <div className="transcription-result">
                        <strong>전사 결과:</strong> {transcriptions[rec.id]}
                        {transcriptionDetails[rec.id]?.confidence !== undefined && (
                          <div className="transcription-confidence">
                            신뢰도: {(transcriptionDetails[rec.id].confidence * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    )}
                    {transcriptionErrors[rec.id] && (
                      <div className="transcription-error">
                        ❌ 오류: {transcriptionErrors[rec.id]}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sentenceRecordings.length > 0 && (
            <div className="recording-category">
              <h4>📄 문장 ({sentenceRecordings.length}개)</h4>
              <ul className="recording-list">
                {sentenceRecordings.map((rec, idx) => (
                  <li key={idx} className="recording-item">
                    <div className="recording-header">
                      <span className="recording-title">{rec.title || rec.sentence}</span>
                      <span className="recording-id">{rec.id ? `ID: ${rec.id}` : '로컬 저장'}</span>
                    </div>
                    {transcriptions[rec.id] && (
                      <div className="transcription-result">
                        <strong>전사 결과:</strong> {transcriptions[rec.id]}
                        {transcriptionDetails[rec.id]?.confidence !== undefined && (
                          <div className="transcription-confidence">
                            신뢰도: {(transcriptionDetails[rec.id].confidence * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    )}
                    {transcriptionErrors[rec.id] && (
                      <div className="transcription-error">
                        ❌ 오류: {transcriptionErrors[rec.id]}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {paragraphRecording && (
            <div className="recording-category">
              <h4>📖 문단 (1개)</h4>
              <ul className="recording-list">
                <li className="recording-item">
                  <div className="recording-header">
                    <span className="recording-title">{paragraphRecording.title}</span>
                    <span className="recording-id">{paragraphRecording.id ? `ID: ${paragraphRecording.id}` : '로컬 저장'}</span>
                  </div>
                  {transcriptions[paragraphRecording.id] && (
                    <div className="transcription-result">
                      <strong>전사 결과:</strong> {transcriptions[paragraphRecording.id]}
                      {transcriptionDetails[paragraphRecording.id]?.confidence !== undefined && (
                        <div className="transcription-confidence">
                          신뢰도: {(transcriptionDetails[paragraphRecording.id].confidence * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  )}
                  {transcriptionErrors[paragraphRecording.id] && (
                    <div className="transcription-error">
                      ❌ 오류: {transcriptionErrors[paragraphRecording.id]}
                    </div>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>

        {sessionId ? (
          <div className="info-message">
            <p>
              ✅ 모든 녹음이 성공적으로 서버에 업로드되었습니다.
            </p>
          </div>
        ) : (
          <div className="info-message" style={{background: '#fff3e0', borderLeftColor: '#ff9800'}}>
            <p>
              ⚠️ 로컬 모드로 진행되었습니다.
            </p>
            <p>
              녹음 파일은 브라우저에만 저장되어 있으며, 서버 업로드가 필요합니다.
            </p>
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="home-button"
            onClick={() => navigate('/')}
          >
            처음으로 돌아가기
          </button>
          <button 
            className="speaking-button"
            onClick={() => {
              // P_123456에서 123456만 추출하여 전달
              const idNumber = meta?.participant_id ? meta.participant_id.replace('P_', '') : null;
              navigate('/speaking-login', {
                state: { prefilledId: idNumber }
              });
            }}
          >
            💬 말하기 평가 참가하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;
