/**
 * 음성 녹음을 위한 유틸리티 클래스
 * MediaRecorder API를 사용하여 브라우저에서 음성을 녹음합니다.
 */
class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  /**
   * 마이크 권한을 요청하고 녹음을 초기화합니다.
   */
  async initialize() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      // 브라우저 호환성을 위한 mimeType 설정
      const mimeType = this.getSupportedMimeType();
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeType,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      return true;
    } catch (error) {
      console.error('Error initializing audio recorder:', error);
      throw new Error('마이크 접근 권한이 필요합니다.');
    }
  }

  /**
   * 브라우저가 지원하는 mimeType을 반환합니다.
   */
  getSupportedMimeType() {
    const types = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return ''; // 기본값
  }

  /**
   * 녹음을 시작합니다.
   */
  start() {
    if (!this.mediaRecorder) {
      throw new Error('Recorder not initialized. Call initialize() first.');
    }

    this.audioChunks = [];
    this.mediaRecorder.start();
    console.log('Recording started');
  }

  /**
   * 녹음을 중지하고 Blob을 반환하는 Promise를 리턴합니다.
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        console.log('Recording stopped, blob size:', audioBlob.size);
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 리소스를 정리합니다.
   */
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  /**
   * 현재 녹음 중인지 확인합니다.
   */
  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }
}

export default AudioRecorder;
