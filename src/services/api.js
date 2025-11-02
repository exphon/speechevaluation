import axios from 'axios';

// API 기본 설정
// 배포(HTTPS) 환경에서는 '/api'로 프록시(리라이트) 사용, 로컬 개발에서는 .env의 REACT_APP_API_BASE_URL 사용
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60초 타임아웃 (음성 처리는 시간이 걸릴 수 있음)
});

/**
 * 단일 녹음 파일을 서버에 업로드
 * @param {Blob} audioBlob - 녹음된 오디오 파일
 * @param {string} title - 녹음 제목
 * @param {number} sessionId - 세션 ID (선택)
 * @param {string} recordingType - 녹음 유형: 'word', 'sentence', 'paragraph' (선택)
 * @param {Object} metadata - 참여자 메타데이터 (선택)
 * @returns {Promise} 서버 응답 (녹음 정보)
 */
export const uploadRecording = async (audioBlob, title, sessionId = null, recordingType = null, metadata = null, originalText = null) => {
  try {
    const formData = new FormData();
    
    // 파일 확장자를 blob의 타입에 맞게 설정
    const extension = audioBlob.type.includes('webm') ? 'webm' : 
                     audioBlob.type.includes('ogg') ? 'ogg' : 
                     audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
    
    formData.append('title', title);
    formData.append('audio_file', audioBlob, `recording.${extension}`);
    
    if (sessionId) {
      formData.append('session', sessionId);
    }

    // 녹음 유형 추가 (word, sentence, paragraph)
    if (recordingType) {
      formData.append('recording_type', recordingType);
    }

    // 메타데이터 추가 (JSON 문자열로 전송)
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    // 원본 텍스트 추가
    if (originalText) {
      formData.append('original_text', originalText);
    }

    console.log(`📤 Uploading: "${title}" (type: ${recordingType || 'unknown'}, text: ${originalText ? originalText.substring(0, 20) + '...' : 'N/A'})...`);
    
    const response = await api.post('/recordings/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Upload successful - ID:', response.data.id);
    return response.data;
    
  } catch (error) {
    console.error('❌ Audio upload error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      }
    });
    throw error;
  }
};

/**
 * 여러 녹음 파일을 배치로 업로드
 * @param {Array} recordings - 녹음 객체 배열 [{blob, type, text}, ...]
 * @param {string} sessionId - 세션 ID (선택)
 * @returns {Promise} 업로드된 녹음 정보 배열
 */
export const uploadBatchRecordings = async (recordings, sessionId = null) => {
  try {
    console.log(`📤 Uploading ${recordings.length} recordings in batch...`);
    
    const uploadPromises = recordings.map((recording, index) => {
      return uploadRecording(
        recording.audio || recording.blob,
        recording.type || recording.recording_type,
        recording.text || recording.expected_text,
        sessionId
      );
    });

    const results = await Promise.all(uploadPromises);
    console.log('✅ Batch upload successful:', results.length, 'files uploaded');
    return results;
    
  } catch (error) {
    console.error('❌ Batch upload error:', error);
    throw error;
  }
};

/**
 * 녹음 목록 조회
 * @param {Object} params - 쿼리 파라미터 {session_id, recording_type 등}
 * @returns {Promise} 녹음 목록
 */
export const getRecordings = async (params = {}) => {
  try {
    const response = await api.get('/recordings/', { params });
    return response.data;
  } catch (error) {
    console.error('Get recordings error:', error);
    throw error;
  }
};

/**
 * 특정 녹음 정보 조회
 * @param {number} recordingId - 녹음 ID
 * @returns {Promise} 녹음 정보
 */
export const getRecording = async (recordingId) => {
  try {
    const response = await api.get(`/recordings/${recordingId}/`);
    return response.data;
  } catch (error) {
    console.error('Get recording error:', error);
    throw error;
  }
};

/**
 * 녹음 파일 처리 요청 (전사 + 평가)
 * @param {number} recordingId - 녹음 ID
 * @param {Object} options - 처리 옵션
 * @returns {Promise} 처리 결과 (전사 및 평가)
 */
export const processRecording = async (recordingId, options = {}) => {
  try {
    console.log(`🔄 Processing recording ${recordingId}...`);
    
    const response = await api.post(`/recordings/${recordingId}/process/`, options, {
      timeout: 120000, // Whisper 처리는 시간이 걸릴 수 있으므로 2분으로 증가
    });
    
    console.log('✅ Processing complete:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Processing error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 녹음 파일 전사 (Whisper)
 * @param {number} recordingId - 녹음 ID
 * @returns {Promise} 전사 결과
 */
export const transcribeRecording = async (recordingId) => {
  try {
    console.log(`🎤 Transcribing recording ${recordingId}...`);
    
    const response = await api.post(`/recordings/${recordingId}/transcribe/`, {}, {
      timeout: 120000, // Whisper 처리는 시간이 걸릴 수 있으므로 2분
    });
    
    console.log('✅ Transcription complete:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Transcription error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 새로운 세션 생성
 * @param {string} name - 세션 이름 (선택)
 * @param {string} description - 세션 설명 (선택)
 * @returns {Promise} 생성된 세션 정보
 */
export const createSession = async (name = null, description = null, metadata = null) => {
  try {
    console.log('📝 Creating new session...');
    
    const data = {};
    if (name) data.name = name;
    if (description) data.description = description;
    // 메타데이터를 백엔드에 전달 (백엔드가 지원하지 않으면 무시됨)
    if (metadata) data.metadata = metadata;
    
    const response = await api.post('/sessions/', data);

    console.log('✅ Session created - ID:', response.data.id);
    return response.data;
    
  } catch (error) {
    console.error('❌ Session creation error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 세션 완료 처리
 * @param {string} sessionId - 세션 ID
 * @returns {Promise} 완료된 세션 정보
 */
export const completeSession = async (sessionId) => {
  try {
    const response = await api.post(`/sessions/${sessionId}/complete/`);
    console.log('✅ Session completed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Complete session error:', error);
    throw error;
  }
};

/**
 * 참여자 ID로 메타데이터 조회
 * @param {string} participantId - 6자리 참여자 ID
 * @returns {Promise} 메타데이터 정보
 */
export const getMetadataByParticipantId = async (participantId) => {
  try {
    console.log(`🔍 Fetching metadata for participant: ${participantId}...`);
    
    // 세션 목록에서 participant_id로 필터링
    const response = await api.get('/sessions/', {
      params: { participant_id: participantId }
    });
    
    console.log('📊 API Response:', response.data);
    
    // 페이지네이션된 응답 처리
    let sessions = [];
    if (response.data.results && Array.isArray(response.data.results)) {
      sessions = response.data.results;
    } else if (Array.isArray(response.data)) {
      sessions = response.data;
    }
    
    console.log(`📋 Found ${sessions.length} session(s)`);
    
    // 세션이 없으면 404 에러
    if (sessions.length === 0) {
      const error = new Error('Participant not found');
      error.response = { status: 404 };
      throw error;
    }
    
    // P_로 시작하는 ID는 발음평가 세션만 필터링
    // S_로 시작하는 ID가 조회되는 경우를 방지
    let targetSession = null;
    if (participantId.startsWith('P_')) {
      // 발음평가 세션 찾기: name이 P_로 시작하는 세션
      const pronSessions = sessions.filter(s => s.name && s.name.startsWith('P_'));
      console.log(`🔍 Filtered pronunciation sessions: ${pronSessions.length}`);
      targetSession = pronSessions[0]; // 가장 최근 발음평가 세션
    } else {
      // 일반 조회는 첫 번째 세션
      targetSession = sessions[0];
    }
    
    if (!targetSession) {
      const error = new Error('Pronunciation evaluation session not found');
      error.response = { status: 404 };
      throw error;
    }
    
    console.log('✅ Selected session:', targetSession);
    console.log('🔍 Session fields:', {
      id: targetSession.id,
      name: targetSession.name,
      pronunciation_level: targetSession.pronunciation_level,
      metadata: targetSession.metadata ? 'exists' : 'null',
    });
    
    // metadata 필드 파싱
    if (targetSession.metadata) {
      const metadata = typeof targetSession.metadata === 'string' 
        ? JSON.parse(targetSession.metadata) 
        : targetSession.metadata;
      
      console.log('✅ Metadata extracted:', metadata);
      
      // 세션에 저장된 발음평가 레벨 가져오기
      console.log('🔍 Checking pronunciation_level from:');
      console.log('  - session.pronunciation_level:', targetSession.pronunciation_level);
      console.log('  - metadata.pronunciation_level:', metadata.pronunciation_level);
      
      // session.pronunciation_level 우선 (서버에 PATCH로 저장된 값)
      const pronunciationLevel = targetSession.pronunciation_level || metadata.pronunciation_level || '하';
      
      console.log(`📊 Final Pronunciation Level: ${pronunciationLevel}`);
      
      return {
        ...metadata,
        session_id: targetSession.id,
        session_name: targetSession.name,
        pronunciation_level: pronunciationLevel, // 발음평가 레벨 추가
      };
    }
    
    // metadata 필드가 없으면 에러
    const error = new Error('No metadata found for this participant');
    error.response = { status: 404 };
    throw error;
    
  } catch (error) {
    console.error('❌ Metadata fetch error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * 세션의 발음 등급 업데이트
 * @param {number} sessionId - 세션 ID
 * @param {string} pronunciationLevel - 발음 등급 (상/중/하)
 * @returns {Promise} 업데이트된 세션 정보
 */
export const updateSessionPronunciationLevel = async (sessionId, pronunciationLevel) => {
  try {
    console.log(`📝 Updating pronunciation level for session ${sessionId}: ${pronunciationLevel}...`);
    
    const response = await api.patch(`/sessions/${sessionId}/`, {
      pronunciation_level: pronunciationLevel
    });
    
    console.log('✅ Pronunciation level updated:', response.data);
    console.log('🔍 Updated session pronunciation_level field:', response.data.pronunciation_level);
    return response.data;
    
  } catch (error) {
    console.error('❌ Pronunciation level update error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 적응형 문제 요청
 * @param {string} level - 평가된 레벨 (상/중/하)
 * @param {string} sessionId - 세션 ID
 * @returns {Promise} 적응형 문제 데이터
 */
export const getAdaptiveQuestion = async (level, sessionId = null) => {
  try {
    const params = { level };
    if (sessionId) params.session_id = sessionId;
    
    const response = await api.get('/adaptive-question/', { params });
    return response.data;
  } catch (error) {
    console.error('Adaptive question error:', error);
    throw error;
  }
};

/**
 * API 서버 상태 확인
 * @returns {Promise} 서버 상태
 */
export const checkServerStatus = async () => {
  try {
    // 동일 오리진을 통해 프록시된 백엔드 상태 확인 (혼합 컨텐츠 방지)
    const response = await api.get('/');
    return response.data || { status: 'ok' };
  } catch (error) {
    console.error('Server status check error:', error);
    return { status: 'offline', error: error.message };
  }
};

export default api;
