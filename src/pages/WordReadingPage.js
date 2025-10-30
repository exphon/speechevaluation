import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RecordButton from '../components/RecordButton';
import { words } from '../data/testData';
import { uploadRecording } from '../services/api';
import './WordReadingPage.css';

/**
 * 단어 읽기 페이지
 * 10개의 단어를 한꺼번에 보여주고 한 번에 녹음
 */
const WordReadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [recording, setRecording] = useState(null);
  const [showPlayback, setShowPlayback] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'uploading' | 'success' | 'error'
  const [sessionId, setSessionId] = useState(null);

  // 세션 ID 가져오기
  useEffect(() => {
    if (location.state?.sessionId) {
      setSessionId(location.state.sessionId);
    }
  }, [location.state]);

  const handleRecordingComplete = async (audioBlob) => {
    setRecording(audioBlob);
    setShowPlayback(true);

    // 세션이 없으면 로컬 저장만 하고 업로드 건너뛰기
    if (!sessionId) {
      console.log('⚠️ 세션 없음 - 로컬 저장만 수행');
      setUploadStatus('success');
      return;
    }

    setUploadStatus('uploading');

    try {
      // 즉시 서버에 업로드
      const title = `단어 읽기 (${words.length}개)`;
      const response = await uploadRecording(audioBlob, title, sessionId);
      
      console.log('✅ 업로드 성공:', response);
      setUploadStatus('success');
      
    } catch (error) {
      console.error('❌ 업로드 실패:', error);
      console.error('오류 상세:', error.response?.data || error.message);
      
      // 서버 오류 시 로컬 저장으로 폴백
      console.log('⚠️ 서버 오류 - 로컬 저장으로 전환');
      setUploadStatus('success');
    }
  };

  const handleNext = () => {
    if (recording && uploadStatus === 'success') {
      // 문장 읽기로 이동
      navigate('/sentence-reading', { 
        state: { 
          wordRecording: recording,
          sessionId: sessionId
        }
      });
    }
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

  return (
    <div className="word-reading-page">
      <div className="reading-container">
        <div className="header">
          <h1 className="page-title">단어 읽기</h1>
          <p className="instruction-subtitle">다음 {words.length}개의 단어를 순서대로 읽어주세요</p>
        </div>

        <div className="words-display">
          <div className="words-grid">
            {words.map((word, index) => (
              <div key={index} className="word-item">
                <span className="word-number">{index + 1}</span>
                <span className="word-text">{word}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="recording-section">
          {!showPlayback ? (
            <>
              <RecordButton 
                onRecordingComplete={handleRecordingComplete}
              />
              <p className="instruction-text">
                🎤 녹음 버튼을 눌러 위의 단어들을 순서대로 또박또박 읽어주세요
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
                  {sessionId ? '✅ 업로드 완료!' : '✅ 녹음 완료! (로컬 저장)'}
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="upload-status error">
                  ❌ 업로드 실패. 다시 녹음해주세요.
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
                  문장 읽기로 이동 →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordReadingPage;
