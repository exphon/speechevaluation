import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { transcribeRecording, getRecording } from '../services/api';
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

  const sessionId = location.state?.sessionId;
  const wordRecordings = location.state?.wordRecordings || [];
  const sentenceRecordings = location.state?.sentenceRecordings || [];
  const paragraphRecording = location.state?.paragraphRecording || null;
  const meta = location.state?.meta || null;

  const totalRecordings = wordRecordings.length + sentenceRecordings.length + (paragraphRecording ? 1 : 0);

  /**
   * 단일 녹음 전사
   */
  const handleTranscribe = async (recordingId) => {
    if (!recordingId) {
      alert('로컬 모드에서는 전사를 사용할 수 없습니다.');
      return;
    }

    try {
      setTranscribing(true);
      console.log(`🎤 전사 시작: Recording ID ${recordingId}`);
      
      const result = await transcribeRecording(recordingId);
      
      // 전사 텍스트 저장
      const transcriptionText = result.transcription || result.text;
      setTranscriptions(prev => ({
        ...prev,
        [recordingId]: transcriptionText
      }));
      
      // 추가 정보 저장 (confidence, language 등)
      if (result.confidence !== undefined || result.language) {
        setTranscriptionDetails(prev => ({
          ...prev,
          [recordingId]: {
            confidence: result.confidence,
            language: result.language
          }
        }));
      }
      
      console.log('✅ 전사 완료:', result);
      
    } catch (error) {
      console.error('❌ 전사 실패:', error);
      setTranscriptionErrors(prev => ({
        ...prev,
        [recordingId]: error.response?.data?.error || error.message
      }));
    } finally {
      setTranscribing(false);
    }
  };

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

    for (const recordingId of allRecordingIds) {
      try {
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
                    {rec.id && (
                      <div className="recording-actions">
                        <button 
                          className="transcribe-button"
                          onClick={() => handleTranscribe(rec.id)}
                          disabled={transcribing || transcriptions[rec.id]}
                        >
                          {transcriptions[rec.id] ? '✅' : '🎤 전사'}
                        </button>
                      </div>
                    )}
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
                    {rec.id && (
                      <div className="recording-actions">
                        <button 
                          className="transcribe-button"
                          onClick={() => handleTranscribe(rec.id)}
                          disabled={transcribing || transcriptions[rec.id]}
                        >
                          {transcriptions[rec.id] ? '✅' : '🎤 전사'}
                        </button>
                      </div>
                    )}
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
                  {paragraphRecording.id && (
                    <div className="recording-actions">
                      <button 
                        className="transcribe-button"
                        onClick={() => handleTranscribe(paragraphRecording.id)}
                        disabled={transcribing || transcriptions[paragraphRecording.id]}
                      >
                        {transcriptions[paragraphRecording.id] ? '✅' : '🎤 전사'}
                      </button>
                    </div>
                  )}
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
            <p>
              서버에서 Whisper를 통한 음성 전사와 OpenAI API를 통한 발음 평가가 진행됩니다.
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
        </div>

        <div className="next-steps">
          <h4>다음 단계</h4>
          <p>
            업로드된 녹음 파일은 서버에서 다음과 같이 처리됩니다:
          </p>
          <ul>
            <li>🎤 Whisper를 통한 음성-텍스트 전사</li>
            <li>🤖 OpenAI API를 통한 발음 평가 (accuracy, fluency, completeness)</li>
            <li>� Speaking 평가 (content, organization, grammar, vocabulary)</li>
            <li>💬 상세 피드백 및 개선 제안</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;
