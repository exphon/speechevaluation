import React, { useState, useEffect } from 'react';
import AudioRecorder from '../utils/audioRecorder';
import './RecordButton.css';

/**
 * 녹음 버튼 컴포넌트
 * @param {Function} onRecordingComplete - 녹음 완료 시 호출되는 콜백 (audioBlob)
 * @param {Function} onRecordingStart - 녹음 시작 시 호출되는 콜백
 * @param {boolean} disabled - 버튼 비활성화 여부
 * @param {boolean} autoStart - 자동으로 녹음 시작 여부
 */
const RecordButton = ({ onRecordingComplete, onRecordingStart, disabled = false, autoStart = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 recorder 초기화
    const audioRecorder = new AudioRecorder();
    setRecorder(audioRecorder);

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (audioRecorder) {
        audioRecorder.cleanup();
      }
      if (timer) {
        clearInterval(timer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 자동 시작 기능
  useEffect(() => {
    if (autoStart && recorder && !isRecording && !hasAutoStarted) {
      console.log('🎤 자동 녹음 시작');
      setHasAutoStarted(true);
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, recorder, isRecording, hasAutoStarted]);

  const startRecording = async () => {
    try {
      setError(null);
      await recorder.initialize();
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // 녹음 시작 콜백 호출
      if (onRecordingStart) {
        onRecordingStart();
      }

      // 타이머 시작
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimer(intervalId);

    } catch (err) {
      setError(err.message);
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      const audioBlob = await recorder.stop();
      setIsRecording(false);
      
      // 타이머 중지
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }

      if (onRecordingComplete) {
        onRecordingComplete(audioBlob);
      }
    } catch (err) {
      setError('녹음 중지 중 오류가 발생했습니다.');
      console.error('Failed to stop recording:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="record-button-container">
      <button
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
      >
        {isRecording ? (
          <>
            <span className="recording-dot"></span>
            녹음 중지
          </>
        ) : (
          <>
            <span className="mic-icon">🎤</span>
            녹음 시작
          </>
        )}
      </button>
      
      {isRecording && (
        <div className="recording-time">
          {formatTime(recordingTime)}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default RecordButton;
