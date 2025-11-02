import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RecordButton from '../components/RecordButton';
import CountdownTimer from '../components/CountdownTimer';
import { uploadRecording } from '../services/api';
import { getSpeakingQuestionsForLevel } from '../data/speakData';
import './SpeakingQuestionPage.css';

/**
 * 통합 말하기 평가 페이지
 * - 발음 수준에 따라 3문항을 동적으로 로드
 * - 준비시간 → 대답시간 → 녹음 → 다음 문항 순차 진행
 */
const SpeakingQuestionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 메타데이터 및 설정
  const [metadata, setMetadata] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [pronunciationLevel, setPronunciationLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  // 진행 상태
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phase, setPhase] = useState('prep'); // 'prep' | 'answer' | 'recorded' | 'uploading' | 'completed'
  const [recording, setRecording] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  // 오디오 재생 ref
  const audioRef = useRef(null);

  // 초기화
  useEffect(() => {
    if (!location.state?.metadata || !location.state?.participantId || !location.state?.pronunciationLevel) {
      alert('잘못된 접근입니다. 로그인 페이지로 이동합니다.');
      navigate('/speaking-login');
      return;
    }

    const meta = location.state.metadata;
    const pid = location.state.participantId;
    const level = location.state.pronunciationLevel;

    console.log('📋 SpeakingQuestionPage - 받은 데이터:', {
      metadata: meta,
      participantId: pid,
      pronunciationLevel: level
    });

    setMetadata(meta);
    setParticipantId(pid);
    setPronunciationLevel(level);
    setSessionId(meta.session_id || null);

    // speakData에서 해당 수준의 문항 3개 가져오기
    const loadedQuestions = getSpeakingQuestionsForLevel(level, pid);
    console.log(`📚 SpeakingQuestionPage - 등급 '${level}'에 맞는 문제 로드:`, loadedQuestions);
    setQuestions(loadedQuestions);
    
    console.log('📝 로드된 문항:', loadedQuestions);
  }, [location.state, navigate]);

  // 준비시간 완료 → 대답시간으로 전환
  const handlePrepComplete = () => {
    console.log('⏰ 준비시간 완료 → 대답시간으로 전환');
    setPhase('answer');
  };

  // 준비시간 중 녹음 시작 → 대답시간으로 즉시 전환
  const handleRecordingStartDuringPrep = () => {
    console.log('🎤 준비시간 중 녹음 시작 → 대답시간으로 전환');
    setPhase('answer');
  };

  // 대답시간 완료 → 녹음 가능 상태로 전환 (녹음 중이 아니면)
  const handleAnswerComplete = () => {
    console.log('⏰ 대답시간 완료');
    setPhase('recorded');
  };

  // 녹음 완료
  const handleRecordingComplete = async (audioBlob) => {
    setRecording(audioBlob);
    setPhase('uploading');

    if (!sessionId) {
      console.log('⚠️ 세션 없음 - 로컬 저장만');
      setUploadStatus('success');
      setPhase('completed');
      return;
    }

    setUploadStatus('uploading');

    try {
      const currentQ = questions[currentQuestionIndex];
      const title = `말하기 ${currentQ.grade}등급 - ${currentQ.type}`;
      const recordingType = `speaking_grade${currentQ.grade}`;
      const originalText = currentQ.question; // 질문 텍스트를 원본 텍스트로 사용

      console.log('📤 업로드 시도:', {
        title,
        recordingType,
        sessionId,
        blobSize: audioBlob.size,
        blobType: audioBlob.type,
        hasMetadata: !!metadata,
        metadata: metadata,
        originalText: originalText,
      });

      const response = await uploadRecording(audioBlob, title, sessionId, recordingType, metadata, originalText);
      console.log('✅ 업로드 성공:', response);
      setUploadStatus('success');
      setPhase('completed');
    } catch (error) {
      console.error('❌ 업로드 실패:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
      });
      setUploadStatus('error');
      setPhase('completed');
    }
  };

  // 다음 문항으로 이동
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // 다음 문항으로
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setPhase('prep');
      setRecording(null);
      setUploadStatus(null);
    } else {
      // 모든 문항 완료
      alert('모든 말하기 평가가 완료되었습니다!');
      navigate('/', {
        state: {
          completed: true,
          sessionId: sessionId,
          metadata: metadata,
        }
      });
    }
  };

  // 재녹음
  const handleReRecord = () => {
    setRecording(null);
    setUploadStatus(null);
    setPhase('answer'); // 대답시간 단계로 돌아감 (타이머는 재시작 안 함)
  };

  // 녹음 재생
  const playRecording = () => {
    if (recording) {
      const audio = new Audio(URL.createObjectURL(recording));
      audio.play();
    }
  };

  // 로딩 중
  if (!metadata || !questions.length) {
    return (
      <div className="speaking-question-page">
        <div className="loading">문항을 불러오는 중...</div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // 레벨별 색상 클래스
  const levelClass = pronunciationLevel === '하' ? 'level-low' : pronunciationLevel === '중' ? 'level-mid' : 'level-high';

  return (
    <div className={`speaking-question-page ${levelClass}`}>
      <div className="question-container">
        {/* 헤더 */}
        <div className="question-header">
          <div className={`level-badge ${levelClass.replace('level-', '')}`}>
            발음평가: {pronunciationLevel}
          </div>
          <h1 className="question-title">말하기 평가</h1>
          <p className="participant-name">{metadata.name || participantId}</p>
          <div className="progress-bar-container">
            <div className="progress-text">
              문항 {currentQuestionIndex + 1} / {questions.length}
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        {/* 문항 내용 */}
        <div className="question-content">
          <div className="question-card">
            <div className="question-meta">
              <span className="grade-tag">{currentQ.grade}등급</span>
              <span className="type-tag">{currentQ.type}</span>
            </div>
            <p className="question-prompt">질문</p>
            <div className="question-text">
              <h2 className="question-main">{currentQ.item.prompt}</h2>
            </div>

            {/* 이미지 표시 (4~6등급) */}
            {currentQ.item.image && (
              <div className="question-image-container">
                <img 
                  src={currentQ.item.image} 
                  alt={`${currentQ.grade}등급 문제 이미지`}
                  className="question-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.error('이미지 로드 실패:', currentQ.item.image);
                  }}
                />
              </div>
            )}

            {/* 오디오 재생 (4~6등급) */}
            {currentQ.item.audio && (
              <div className="question-audio-container">
                <audio 
                  ref={audioRef}
                  src={currentQ.item.audio}
                  onError={() => {
                    console.error('오디오 로드 실패:', currentQ.item.audio);
                  }}
                />
                <button 
                  className="audio-play-button"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                      audioRef.current.play();
                    }
                  }}
                >
                  🔊 음성 듣기
                </button>
              </div>
            )}

            {currentQ.item.hints && currentQ.item.hints.length > 0 && (
              <div className="tips-box">
                <h4>💡 답변 가이드</h4>
                <ul>
                  {currentQ.item.hints.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 시간 정보 */}
            <div className="time-info">
              <span>⏱️ 준비시간: {currentQ.prepSec}초</span>
              <span>🎤 대답시간: {currentQ.answerSec}초</span>
            </div>
          </div>
        </div>

        {/* 타이머 & 녹음 섹션 */}
        <div className="recording-section">
          {phase === 'prep' && (
            <>
              <CountdownTimer
                key="prep-timer"
                seconds={currentQ.prepSec}
                onComplete={handlePrepComplete}
                label="준비시간"
                autoStart={true}
              />
              <RecordButton 
                onRecordingComplete={handleRecordingComplete}
                onRecordingStart={handleRecordingStartDuringPrep}
              />
              <p className="instruction-text">
                📖 질문을 읽고 답변을 준비하세요
                <br />
                <small>준비가 되었다면 녹음 버튼을 눌러 바로 시작할 수 있습니다</small>
              </p>
            </>
          )}

          {phase === 'answer' && (
            <>
              <CountdownTimer
                key="answer-timer"
                seconds={currentQ.answerSec}
                onComplete={handleAnswerComplete}
                label="대답시간"
                autoStart={true}
              />
              <RecordButton 
                onRecordingComplete={handleRecordingComplete}
                autoStart={true}
              />
              <p className="instruction-text">
                🎤 녹음이 자동으로 시작되었습니다
                <br />
                <small>녹음 중지 버튼을 눌러 답변을 마치세요</small>
              </p>
            </>
          )}

          {phase === 'recorded' && (
            <>
              <div className="upload-status success">
                ⏰ 대답시간이 종료되었습니다
              </div>
              <RecordButton onRecordingComplete={handleRecordingComplete} />
              <p className="instruction-text">
                🎤 시간이 지났지만 녹음을 원하시면 버튼을 눌러주세요
              </p>
            </>
          )}

          {phase === 'uploading' && (
            <div className="playback-section">
              {uploadStatus === 'uploading' && (
                <div className="upload-status uploading">
                  ⏳ 서버에 업로드 중...
                </div>
              )}
            </div>
          )}

          {phase === 'completed' && (
            <div className="playback-section">
              <div className="playback-controls">
                <button className="play-button" onClick={playRecording}>
                  🔊 녹음 듣기
                </button>
                <button className="re-record-button" onClick={handleReRecord}>
                  🔄 다시 녹음하기
                </button>
              </div>

              <button className="next-button" onClick={handleNext}>
                {currentQuestionIndex < questions.length - 1 ? '다음 문항 →' : '평가 완료 →'}
              </button>

              {uploadStatus === 'success' && (
                <div className="upload-status success">
                  {sessionId ? '✅ 업로드 완료!' : '✅ 녹음 완료! (로컬 저장)'}
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="upload-status error">
                  ❌ 업로드 실패 (로컬에 저장됨)
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakingQuestionPage;
