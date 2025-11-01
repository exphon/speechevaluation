import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RecordButton from '../components/RecordButton';
import { sentences } from '../data/pronData';
import { uploadRecording } from '../services/api';
import './SentenceReadingPage.css';

/**
 * 문장 읽기 페이지
 */
const SentenceReadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [currentRecording, setCurrentRecording] = useState(null);
  const [showPlayback, setShowPlayback] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const sessionId = location.state?.sessionId;
  const meta = location.state?.meta;
  const wordRecordings = location.state?.wordRecordings || (location.state?.wordRecording ? [{ id: null, title: '단어 읽기 (10개)' }] : []);
  
  const currentSentence = sentences[currentIndex];
  const isLastSentence = currentIndex === sentences.length - 1;
  const progress = ((currentIndex + 1) / sentences.length) * 100;

  const handleRecordingComplete = async (audioBlob) => {
    setCurrentRecording(audioBlob);
    setShowPlayback(true);

    // 세션이 없으면 로컬 저장만
    if (!sessionId) {
      console.log('⚠️ 세션 없음 - 로컬 저장만 수행');
      setUploadStatus('success');
      setRecordings([...recordings, {
        id: null,
        sentence: currentSentence,
        title: `문장 ${currentIndex + 1}: ${currentSentence}`,
        audio: audioBlob,
        recordingId: null
      }]);
      return;
    }

    setUploadStatus('uploading');

    try {
      const title = `문장 ${currentIndex + 1}: ${currentSentence}`;
      const response = await uploadRecording(audioBlob, title, sessionId, 'sentence', meta);
      
      console.log('✅ 업로드 성공:', response);
      setUploadStatus('success');
      
      setRecordings([...recordings, {
        id: response.id,
        sentence: currentSentence,
        title: title,
        recordingId: response.id
      }]);
      
    } catch (error) {
      console.error('❌ 업로드 실패:', error);
      console.error('오류 상세:', error.response?.data || error.message);
      
      // 서버 오류 시 로컬 저장으로 폴백
      console.log('⚠️ 서버 오류 - 로컬 저장으로 전환');
      setUploadStatus('success');
      
      // 로컬에 저장
      setRecordings([...recordings, {
        id: null,
        sentence: currentSentence,
        title: `문장 ${currentIndex + 1}: ${currentSentence}`,
        audio: audioBlob,
        recordingId: null,
        error: '서버 오류로 로컬 저장됨'
      }]);
    }
  };

  const handleNext = () => {
    if (currentRecording && uploadStatus === 'success') {
      if (isLastSentence) {
        // 모든 문장 녹음 완료 - 문단 읽기로 이동
        navigate('/paragraph-reading', { 
          state: { 
            wordRecordings: wordRecordings,
            sentenceRecordings: recordings,
            sessionId: sessionId,
            meta: meta,
          }
        });
      } else {
        // 다음 문장으로
        setCurrentIndex(currentIndex + 1);
        setCurrentRecording(null);
        setShowPlayback(false);
        setUploadStatus(null);
      }
    }
  };

  const handleReRecord = () => {
    setCurrentRecording(null);
    setShowPlayback(false);
    setUploadStatus(null);
  };

  const playRecording = () => {
    if (currentRecording) {
      const audio = new Audio(URL.createObjectURL(currentRecording));
      audio.play();
    }
  };

  return (
    <div className="sentence-reading-page">
      <div className="reading-container">
        <div className="header">
          <h1 className="page-title">문장 읽기</h1>
          <div className="progress-info">
            <span className="progress-text">
              {currentIndex + 1} / {sentences.length}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="sentence-display">
          <div className="sentence-card">
            <p className="sentence-label">다음 문장을 읽어주세요</p>
            <h2 className="sentence-text">{currentSentence}</h2>
          </div>
        </div>

        <div className="recording-section">
          {!showPlayback ? (
            <>
              <RecordButton 
                onRecordingComplete={handleRecordingComplete}
              />
              <p className="instruction-text">
                🎤 녹음 버튼을 눌러 문장을 자연스럽게 읽어주세요
              </p>
            </>
          ) : (
            <div className="playback-section">
              {uploadStatus === 'uploading' && (
                <div className="upload-status uploading">
                  ⏳ 서버에 업로드 중...
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
                  {isLastSentence ? '문단 읽기로 이동 →' : '다음 문장 →'}
                </button>
              )}

              {uploadStatus === 'success' && (
                <div className="upload-status success">
                  {sessionId ? '✅ 업로드 완료!' : '✅ 녹음 완료! (로컬 저장)'}
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="upload-status error">
                  ❌ 업로드 실패. 다시 녹음해주세요.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="recorded-count">
          녹음 완료: {recordings.length} / {sentences.length}
        </div>
      </div>
    </div>
  );
};

export default SentenceReadingPage;
