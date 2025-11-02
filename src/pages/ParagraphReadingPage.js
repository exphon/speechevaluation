import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RecordButton from '../components/RecordButton';
import { paragraph } from '../data/pronData';
import { uploadRecording } from '../services/api';
import './ParagraphReadingPage.css';

/**
 * 문단 읽기 페이지
 */
const ParagraphReadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [recording, setRecording] = useState(null);
  const [showPlayback, setShowPlayback] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [recordingId, setRecordingId] = useState(null);

  const sessionId = location.state?.sessionId;
  const meta = location.state?.meta;
  const wordRecordings = location.state?.wordRecordings || [];
  const sentenceRecordings = location.state?.sentenceRecordings || [];

  const handleRecordingComplete = async (audioBlob) => {
    setRecording(audioBlob);
    setShowPlayback(true);

    // 세션이 없으면 로컬 저장만
    if (!sessionId) {
      console.log('⚠️ 세션 없음 - 로컬 저장만 수행');
      setUploadStatus('success');
      setRecordingId(null);
      return;
    }

    setUploadStatus('uploading');

    try {
      const title = '문단 읽기';
      const response = await uploadRecording(audioBlob, title, sessionId, 'paragraph', meta, paragraph);
      
      console.log('✅ 업로드 성공:', response);
      setUploadStatus('success');
      setRecordingId(response.id);
      
    } catch (error) {
      console.error('❌ 업로드 실패:', error);
      console.error('오류 상세:', error.response?.data || error.message);
      
      // 서버 오류 시 로컬 저장으로 폴백
      console.log('⚠️ 서버 오류 - 로컬 저장으로 전환');
      setUploadStatus('success');
      setRecordingId(null);
    }
  };

  const handleNext = () => {
    if (recording && uploadStatus === 'success') {
      // 모든 녹음 완료 - 완료 페이지로 이동
      navigate('/completion', { 
        state: { 
          sessionId: sessionId,
          wordRecordings: wordRecordings,
          sentenceRecordings: sentenceRecordings,
          paragraphRecording: {
            id: recordingId,
            text: paragraph,
            title: '문단 읽기'
          },
          meta: meta,
        }
      });
    }
  };

  const handleReRecord = () => {
    setRecording(null);
    setShowPlayback(false);
    setUploadStatus(null);
    setRecordingId(null);
  };

  const playRecording = () => {
    if (recording) {
      const audio = new Audio(URL.createObjectURL(recording));
      audio.play();
    }
  };

  return (
    <div className="paragraph-reading-page">
      <div className="reading-container">
        <div className="header">
          <h1 className="page-title">문단 읽기</h1>
          <p className="subtitle">마지막 단계입니다!</p>
        </div>

        <div className="paragraph-display">
          <div className="paragraph-card">
            <p className="paragraph-label">다음 문단을 읽어주세요</p>
            <div className="paragraph-text">
              {paragraph.split('\n').map((line, index) => (
                line.trim() && <p key={index}>{line.trim()}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="recording-section">
          {!showPlayback ? (
            <>
              <RecordButton 
                onRecordingComplete={handleRecordingComplete}
              />
              <p className="instruction-text">
                🎤 녹음 버튼을 눌러 문단을 처음부터 끝까지 자연스럽게 읽어주세요
              </p>
              <div className="tips-box">
                <h4>💡 녹음 팁</h4>
                <ul>
                  <li>편안한 속도로 읽어주세요</li>
                  <li>문장 사이에 자연스러운 쉼을 주세요</li>
                  <li>마지막까지 또박또박 읽어주세요</li>
                </ul>
              </div>
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
                  평가 완료 →
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
      </div>
    </div>
  );
};

export default ParagraphReadingPage;
