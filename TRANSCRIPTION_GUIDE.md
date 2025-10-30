# Whisper 전사 기능 사용 가이드

## 🎤 개요

Whisper AI를 사용하여 업로드된 녹음 파일을 텍스트로 변환하는 기능입니다.

## ✨ 주요 기능

### 1. 개별 전사
- 각 녹음마다 "🎤 전사" 버튼 제공
- 클릭 시 해당 녹음만 전사
- 전사 완료 후 결과 즉시 표시

### 2. 일괄 전사
- "🎤 모든 녹음 전사하기" 버튼으로 모든 녹음 일괄 처리
- 순차적으로 전사 진행
- 진행 상황 실시간 확인 가능

### 3. 결과 표시
- ✅ 전사 완료 시: 녹색 배경의 결과 박스
- ❌ 전사 실패 시: 빨간색 배경의 오류 메시지
- 🔄 전사 중: 버튼 비활성화 및 "전사 중..." 표시

## 📋 사용 방법

### CompletionPage에서 전사하기

#### 방법 1: 개별 전사
```
1. CompletionPage로 이동 (모든 녹음 완료 후)
2. 녹음 목록에서 원하는 녹음의 "🎤 전사" 버튼 클릭
3. 전사 완료 시 결과 표시:
   ┌────────────────────────────────────┐
   │ 단어 1: 사과                        │
   │ ID: 123                    🎤 전사  │
   │ ─────────────────────────────────  │
   │ 전사 결과: 사과                     │
   └────────────────────────────────────┘
```

#### 방법 2: 전체 일괄 전사
```
1. "🎤 모든 녹음 전사하기" 버튼 클릭
2. 모든 녹음이 순차적으로 전사됨
3. 진행 중: "🔄 전사 중..." 표시
4. 완료 후 모든 결과 표시
```

## 🎯 전사 결과 예시

### 성공 케이스
```
녹음: "사과"
전사 결과: 사과
```

```
녹음: "나는 학교에 갑니다"
전사 결과: 나는 학교에 갑니다
```

### 오류 케이스
```
❌ 오류: Network Error
❌ 오류: Recording not found
❌ 오류: Whisper API error
```

## 🔧 기술 구현

### API 엔드포인트
```javascript
POST /api/recordings/{id}/transcribe/

응답:
{
  "id": 123,
  "transcription": "사과",
  "confidence": 0.98,
  "language": "ko"
}
```

### 프론트엔드 함수
```javascript
// 단일 전사
const handleTranscribe = async (recordingId) => {
  const result = await transcribeRecording(recordingId);
  setTranscriptions(prev => ({
    ...prev,
    [recordingId]: result.transcription
  }));
};

// 일괄 전사
const handleTranscribeAll = async () => {
  for (const recordingId of allRecordingIds) {
    await transcribeRecording(recordingId);
    // 0.5초 딜레이 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};
```

### 상태 관리
```javascript
const [transcribing, setTranscribing] = useState(false);
const [transcriptions, setTranscriptions] = useState({});
const [transcriptionErrors, setTranscriptionErrors] = useState({});
```

## 📊 UI 구성

### 전사 버튼
```css
.transcribe-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  padding: 6px 12px;
}
```

### 전사 결과 박스
```css
.transcription-result {
  background: #e8f5e9;        /* 연한 녹색 */
  border-left: 3px solid #4CAF50;
  padding: 10px;
}
```

### 오류 박스
```css
.transcription-error {
  background: #ffebee;        /* 연한 빨간색 */
  border-left: 3px solid #f44336;
  padding: 10px;
}
```

## ⚠️ 주의사항

### 1. 서버 모드에서만 사용 가능
```javascript
// 로컬 모드에서는 전사 불가
if (!sessionId) {
  alert('로컬 모드에서는 전사를 사용할 수 없습니다.');
  return;
}
```

### 2. 타임아웃 설정
```javascript
// Whisper 처리는 시간이 걸릴 수 있으므로 타임아웃 2분
timeout: 120000  // 120초
```

### 3. 서버 부하 관리
```javascript
// 일괄 전사 시 0.5초 딜레이
await new Promise(resolve => setTimeout(resolve, 500));
```

## 🐛 문제 해결

### 문제 1: "로컬 모드에서는 전사를 사용할 수 없습니다"
**원인**: 세션 ID가 없음 (서버 연결 실패)
**해결**: 
1. Django 서버가 실행 중인지 확인
2. InstructionPage에서 세션 생성 성공 확인
3. 네트워크 연결 확인

### 문제 2: "Network Error"
**원인**: 서버 연결 실패
**해결**:
1. 서버 주소 확인: `http://210.125.93.241:8020`
2. CORS 설정 확인
3. 방화벽 설정 확인

### 문제 3: "Timeout Error"
**원인**: Whisper 처리 시간 초과 (2분 이상)
**해결**:
1. 녹음 파일이 너무 크지 않은지 확인
2. 서버 리소스 확인 (CPU, 메모리)
3. Whisper 모델 최적화 필요

### 문제 4: 전사 결과가 부정확
**원인**: 
- 음질이 좋지 않음
- 배경 소음이 많음
- 발음이 불명확함

**해결**:
1. 조용한 환경에서 녹음
2. 마이크와 적절한 거리 유지 (30cm)
3. 또박또박 발음
4. 재녹음 시도

## 📈 성능 최적화

### 1. 캐싱
```javascript
// 이미 전사된 녹음은 다시 전사하지 않음
disabled={transcribing || transcriptions[rec.id]}
```

### 2. 순차 처리
```javascript
// Promise.all 대신 for loop 사용 (서버 부하 방지)
for (const recordingId of allRecordingIds) {
  await transcribeRecording(recordingId);
}
```

### 3. 에러 격리
```javascript
// 하나의 전사 실패가 다른 전사에 영향 없음
try {
  await transcribeRecording(recordingId);
} catch (error) {
  // 오류 저장하고 계속 진행
  setTranscriptionErrors(prev => ({...prev, [recordingId]: error}));
}
```

## 🔮 향후 개선 사항

### Phase 1 (현재)
- ✅ 개별 전사 기능
- ✅ 일괄 전사 기능
- ✅ 결과 표시
- ✅ 오류 처리

### Phase 2 (계획)
- 📝 전사 진행률 표시 (x/14 완료)
- 📝 전사 취소 기능
- 📝 전사 결과 편집 기능
- 📝 전사 결과 다운로드

### Phase 3 (계획)
- 📝 실시간 전사 (녹음 중)
- 📝 다국어 전사 지원
- 📝 화자 분리 (여러 사람)
- 📝 타임스탬프 표시

## 📝 Django 서버 구현 예시

```python
# views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
import whisper

class RecordingViewSet(viewsets.ModelViewSet):
    
    @action(detail=True, methods=['post'])
    def transcribe(self, request, pk=None):
        """녹음 파일 전사 (Whisper)"""
        recording = self.get_object()
        
        try:
            # Whisper 모델 로드
            model = whisper.load_model("base")
            
            # 오디오 파일 전사
            result = model.transcribe(
                recording.audio_file.path,
                language='ko'
            )
            
            # 전사 결과 저장
            recording.transcription = result['text']
            recording.save()
            
            return Response({
                'id': recording.id,
                'transcription': result['text'],
                'confidence': result.get('confidence', 0),
                'language': 'ko'
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=500
            )
```

## 🎯 테스트 시나리오

### 시나리오 1: 정상 흐름
```
1. 녹음 완료 → CompletionPage
2. "🎤 모든 녹음 전사하기" 클릭
3. 진행 상태 표시: "🔄 전사 중..."
4. 각 녹음 순차적으로 전사
5. 결과 표시: "전사 결과: [텍스트]"
6. 모든 전사 완료
```

### 시나리오 2: 개별 전사
```
1. 특정 녹음의 "🎤 전사" 버튼 클릭
2. 해당 녹음만 전사
3. 결과 즉시 표시
4. 다른 녹음은 개별적으로 전사 가능
```

### 시나리오 3: 오류 처리
```
1. 전사 시작
2. 네트워크 오류 발생
3. 오류 메시지 표시: "❌ 오류: Network Error"
4. 다른 녹음은 계속 전사 가능
```

## 📞 문의

전사 기능 관련 문의:
- 기술 지원: 이슈 트래커
- 버그 리포트: GitHub Issues

---

**작성일**: 2025년 10월 22일  
**버전**: 1.0.0  
**상태**: 개발 완료, 서버 통합 대기
