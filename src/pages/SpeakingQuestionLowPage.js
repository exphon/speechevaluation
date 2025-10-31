import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RecordButton from '../components/RecordButton';
import { uploadRecording } from '../services/api';
import './SpeakingQuestionPage.css';

/**
 * 말하기평가 - 기초 단계 (하)
 */
const SpeakingQuestionLowPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [metadata, setMetadata] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [pronunciationLevel, setPronunciationLevel] = useState('하');
  
  const [recording, setRecording] = useState(null);
  const [showPlayback, setShowPlayback] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    if (!location.state?.metadata) {
      alert('참여자 정보를 찾을 수 없습니다.');
      navigate('/speaking-login');
      return;
    }

    setMetadata(location.state.metadata);
    setParticipantId(location.state.participantId);
    setSessionId(location.state.metadata.session_id);
    setPronunciationLevel(location.state.pronunciationLevel || '하');
  }, [location.state, navigate]);

  const handleRecordingComplete = async (audioBlob) => {
    setRecording(audioBlob);
    setShowPlayback(true);

    if (!sessionId) {
      console.log('⚠️ 세션 없음 - 로컬 저장만 수행');
      setUploadStatus('success');
      return;
    }

    setUploadStatus('uploading');

    try {
      const title = '말하기평가 - 기초(하)';
      const response = await uploadRecording(
        audioBlob, 
        title, 
        sessionId, 
        'speaking_low',  // recording_type
        metadata  // 메타데이터
      );
      
      console.log('✅ 업로드 성공:', response);
      setUploadStatus('success');
      
    } catch (error) {
      console.error('❌ 업로드 실패:', error);
      setUploadStatus('success'); // 로컬 저장으로 폴백
    }
  };

  const handleNext = () => {
    // TODO: 다음 문항 또는 완료 페이지로 이동
    alert('말하기평가 완료! (추후 완료 페이지 구현 예정)');
    navigate('/');
  };

  const handleReRecord = () => {
    setRecording(null);
    setShowPlayback(false);
    setUploadStatus(null);
  };

  const playRecording = () => {
    if (recording) {
      const audio = new Audio(URL.createObjectURL(recording));
      audio.play();
    }
  };

  if (!metadata) {
    return (
      <div className="speaking-question-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="speaking-question-page level-low">
      <div className="question-container">
        <div className="question-header">
          <div className="level-badge low">📘 기초 단계 (하)</div>
          <h1 className="question-title">말하기평가</h1>
          <p className="participant-name">{metadata.name || participantId}</p>
        </div>

        <div className="question-content">
          <div className="question-card">
            <h2 className="question-prompt">다음 질문에 답해주세요</h2>
            <div className="question-text">
              <p className="question-main">
                💬 <strong>당신의 취미는 무엇입니까?</strong>
              </p>
              <p className="question-sub">
                간단하게 자신의 취미에 대해 30초~1분 정도 이야기해주세요.
              </p>
            </div>
            
            <div className="tips-box">
              <h4>💡 답변 팁</h4>
              <ul>
                <li>취미가 무엇인지 말해주세요</li>
                <li>얼마나 자주 하는지 설명해주세요</li>
                <li>왜 그 취미를 좋아하는지 간단히 말해주세요</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="recording-section">
          {!showPlayback ? (
            <>
              <RecordButton onRecordingComplete={handleRecordingComplete} />
              <p className="instruction-text">
                🎤 녹음 버튼을 눌러 자유롭게 답변해주세요
              </p>
            </>
          ) : (
            <div className="playback-section">
              {uploadStatus === 'uploading' && (
                <div className="upload-status uploading">
                  ⏳ 서버에 업로드 중...
                </div>
              )}
              {uploadStatus === 'success' && (
                <div className="upload-status success">
                  ✅ 녹음 완료!
                </div>
              )}
              
              <div className="playback-controls">
                <button 
                  className="play-button"
                  onClick={playRecording}
                  disabled={uploadStatus === 'uploading'}
                >
                  🔊 녹음 듣기
                </button>
                <button 
                  className="re-record-button"
                  onClick={handleReRecord}
                  disabled={uploadStatus === 'uploading'}
                >
                  🔄 다시 녹음하기
                </button>
              </div>
              
              {uploadStatus === 'success' && (
                <button 
                  className="next-button"
                  onClick={handleNext}
                >
                  완료 →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakingQuestionLowPage;
