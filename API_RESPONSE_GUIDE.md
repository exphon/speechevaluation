# Whisper 전사 API 응답 처리 가이드

## 📊 서버 응답 형식

### 전사 API 응답
```json
{
  "id": 123,
  "transcription": "사과",
  "confidence": 0.98,
  "language": "ko"
}
```

### 필드 설명

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | integer | 녹음 ID | `123` |
| `transcription` | string | 전사된 텍스트 | `"사과"` |
| `confidence` | float | 신뢰도 (0.0 ~ 1.0) | `0.98` (98%) |
| `language` | string | 감지된 언어 | `"ko"` (한국어) |

## 🔧 프론트엔드 처리

### 1. 상태 관리

```javascript
const [transcriptions, setTranscriptions] = useState({});
const [transcriptionDetails, setTranscriptionDetails] = useState({});
const [transcriptionErrors, setTranscriptionErrors] = useState({});
```

**상태 구조:**
```javascript
// transcriptions: 전사 텍스트
{
  123: "사과",
  124: "바나나",
  125: "딸기"
}

// transcriptionDetails: 추가 정보
{
  123: { confidence: 0.98, language: "ko" },
  124: { confidence: 0.95, language: "ko" },
  125: { confidence: 0.99, language: "ko" }
}

// transcriptionErrors: 오류 정보
{
  126: "Network Error"
}
```

### 2. API 응답 처리

```javascript
const handleTranscribe = async (recordingId) => {
  try {
    const result = await transcribeRecording(recordingId);
    
    // 전사 텍스트 저장
    const transcriptionText = result.transcription || result.text;
    setTranscriptions(prev => ({
      ...prev,
      [recordingId]: transcriptionText
    }));
    
    // 추가 정보 저장 (confidence, language)
    if (result.confidence !== undefined || result.language) {
      setTranscriptionDetails(prev => ({
        ...prev,
        [recordingId]: {
          confidence: result.confidence,
          language: result.language
        }
      }));
    }
    
  } catch (error) {
    // 오류 메시지 저장
    setTranscriptionErrors(prev => ({
      ...prev,
      [recordingId]: error.response?.data?.error || error.message
    }));
  }
};
```

### 3. UI 표시

```jsx
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
```

**화면 출력:**
```
┌─────────────────────────────────┐
│ 전사 결과: 사과                  │
│ 신뢰도: 98.0%                    │
└─────────────────────────────────┘
```

## 📈 신뢰도 해석

### 신뢰도 범위

| 범위 | 해석 | 색상 | 조치 |
|------|------|------|------|
| 95% ~ 100% | 매우 정확 | 🟢 녹색 | 그대로 사용 |
| 85% ~ 94% | 정확 | 🟡 노란색 | 확인 권장 |
| 70% ~ 84% | 보통 | 🟠 주황색 | 재녹음 고려 |
| 0% ~ 69% | 낮음 | 🔴 빨간색 | 재녹음 필요 |

### UI 개선 예시

```jsx
const getConfidenceColor = (confidence) => {
  if (confidence >= 0.95) return '#4CAF50'; // 녹색
  if (confidence >= 0.85) return '#FFC107'; // 노란색
  if (confidence >= 0.70) return '#FF9800'; // 주황색
  return '#F44336'; // 빨간색
};

const getConfidenceLabel = (confidence) => {
  if (confidence >= 0.95) return '매우 정확';
  if (confidence >= 0.85) return '정확';
  if (confidence >= 0.70) return '보통';
  return '낮음';
};

// 사용
{transcriptionDetails[rec.id]?.confidence !== undefined && (
  <div 
    className="transcription-confidence"
    style={{ color: getConfidenceColor(transcriptionDetails[rec.id].confidence) }}
  >
    신뢰도: {(transcriptionDetails[rec.id].confidence * 100).toFixed(1)}% 
    ({getConfidenceLabel(transcriptionDetails[rec.id].confidence)})
  </div>
)}
```

## 🌐 다국어 지원

### 언어 코드

| 코드 | 언어 | 표시 |
|------|------|------|
| `ko` | 한국어 | 🇰🇷 한국어 |
| `en` | 영어 | 🇺🇸 English |
| `ja` | 일본어 | 🇯🇵 日本語 |
| `zh` | 중국어 | 🇨🇳 中文 |

### UI 표시 예시

```jsx
const getLanguageLabel = (code) => {
  const languages = {
    ko: '🇰🇷 한국어',
    en: '🇺🇸 English',
    ja: '🇯🇵 日本語',
    zh: '🇨🇳 中文'
  };
  return languages[code] || code;
};

{transcriptionDetails[rec.id]?.language && (
  <div className="transcription-language">
    {getLanguageLabel(transcriptionDetails[rec.id].language)}
  </div>
)}
```

## 🔍 전체 화면 예시

```jsx
<li className="recording-item">
  <div className="recording-header">
    <span className="recording-title">단어 1: 사과</span>
    <span className="recording-id">ID: 123</span>
  </div>
  
  <div className="recording-actions">
    <button 
      className="transcribe-button"
      onClick={() => handleTranscribe(123)}
      disabled={transcribing || transcriptions[123]}
    >
      {transcriptions[123] ? '✅' : '🎤 전사'}
    </button>
  </div>
  
  {transcriptions[123] && (
    <div className="transcription-result">
      <strong>전사 결과:</strong> 사과
      <div className="transcription-confidence">
        신뢰도: 98.0%
      </div>
      <div className="transcription-language">
        🇰🇷 한국어
      </div>
    </div>
  )}
  
  {transcriptionErrors[123] && (
    <div className="transcription-error">
      ❌ 오류: Network Error
    </div>
  )}
</li>
```

## 📝 Django 서버 구현

### 응답 생성 예시

```python
from rest_framework.decorators import action
from rest_framework.response import Response
import whisper

class RecordingViewSet(viewsets.ModelViewSet):
    
    @action(detail=True, methods=['post'])
    def transcribe(self, request, pk=None):
        """Whisper를 사용한 음성 전사"""
        recording = self.get_object()
        
        try:
            # Whisper 모델 로드
            model = whisper.load_model("base")
            
            # 전사 수행
            result = model.transcribe(
                recording.audio_file.path,
                language='ko'
            )
            
            # 전사 결과 저장
            recording.transcription = result['text']
            recording.confidence = result.get('avg_logprob', 0)  # 신뢰도
            recording.language = result.get('language', 'ko')
            recording.save()
            
            # 응답 반환
            return Response({
                'id': recording.id,
                'transcription': result['text'],
                'confidence': calculate_confidence(result),  # 0~1 사이 값
                'language': result.get('language', 'ko')
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=500
            )

def calculate_confidence(whisper_result):
    """Whisper 결과에서 신뢰도 계산"""
    # avg_logprob를 0~1 범위로 변환
    # Whisper의 avg_logprob는 음수이며, 0에 가까울수록 신뢰도가 높음
    avg_logprob = whisper_result.get('avg_logprob', -1)
    
    # -1 ~ 0 범위를 0 ~ 1로 변환 (간단한 방법)
    confidence = max(0, min(1, 1 + avg_logprob))
    
    return round(confidence, 2)
```

## 🧪 테스트 케이스

### 1. 높은 신뢰도 (명확한 발음)

**입력:** 조용한 환경에서 "사과"를 또박또박 발음

**예상 응답:**
```json
{
  "id": 123,
  "transcription": "사과",
  "confidence": 0.98,
  "language": "ko"
}
```

**화면 표시:**
```
전사 결과: 사과
신뢰도: 98.0% (매우 정확)
```

### 2. 중간 신뢰도 (배경 소음)

**입력:** 약간의 배경 소음이 있는 환경에서 "바나나" 발음

**예상 응답:**
```json
{
  "id": 124,
  "transcription": "바나나",
  "confidence": 0.87,
  "language": "ko"
}
```

**화면 표시:**
```
전사 결과: 바나나
신뢰도: 87.0% (정확)
```

### 3. 낮은 신뢰도 (불명확한 발음)

**입력:** 시끄러운 환경에서 작은 목소리로 발음

**예상 응답:**
```json
{
  "id": 125,
  "transcription": "딸기",
  "confidence": 0.65,
  "language": "ko"
}
```

**화면 표시:**
```
전사 결과: 딸기
신뢰도: 65.0% (낮음)
⚠️ 재녹음을 권장합니다
```

### 4. 오류 케이스

**입력:** 네트워크 연결 실패

**예상 응답:**
```json
{
  "error": "Connection refused"
}
```

**화면 표시:**
```
❌ 오류: Connection refused
```

## 💡 개선 아이디어

### 1. 신뢰도 기반 경고

```javascript
{transcriptionDetails[rec.id]?.confidence < 0.7 && (
  <div className="transcription-warning">
    ⚠️ 신뢰도가 낮습니다. 재녹음을 권장합니다.
  </div>
)}
```

### 2. 자동 재전사

```javascript
// 신뢰도가 너무 낮으면 자동으로 재전사 시도
if (result.confidence < 0.5) {
  console.log('신뢰도가 낮아 재전사 시도...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  return handleTranscribe(recordingId);
}
```

### 3. 진행률 표시

```javascript
const [transcriptionProgress, setTranscriptionProgress] = useState(0);

// 일괄 전사 시
for (let i = 0; i < allRecordingIds.length; i++) {
  await transcribeRecording(allRecordingIds[i]);
  setTranscriptionProgress((i + 1) / allRecordingIds.length * 100);
}
```

### 4. 전사 결과 편집

```javascript
const [editingId, setEditingId] = useState(null);
const [editedText, setEditedText] = useState('');

{editingId === rec.id ? (
  <input 
    value={editedText}
    onChange={(e) => setEditedText(e.target.value)}
    onBlur={() => {
      setTranscriptions(prev => ({...prev, [rec.id]: editedText}));
      setEditingId(null);
    }}
  />
) : (
  <span onClick={() => {
    setEditingId(rec.id);
    setEditedText(transcriptions[rec.id]);
  }}>
    {transcriptions[rec.id]}
  </span>
)}
```

## 📞 API 호출 예시

### cURL
```bash
curl -X POST http://210.125.93.241:8020/api/recordings/123/transcribe/ \
  -H "Content-Type: application/json"
```

### JavaScript (Axios)
```javascript
const response = await axios.post(
  'http://210.125.93.241:8020/api/recordings/123/transcribe/',
  {},
  {
    timeout: 120000
  }
);

console.log(response.data);
// {
//   "id": 123,
//   "transcription": "사과",
//   "confidence": 0.98,
//   "language": "ko"
// }
```

### Python (requests)
```python
import requests

response = requests.post(
    'http://210.125.93.241:8020/api/recordings/123/transcribe/',
    timeout=120
)

data = response.json()
print(data['transcription'])  # "사과"
print(f"신뢰도: {data['confidence'] * 100}%")  # 98.0%
```

---

**작성일**: 2025년 10월 22일  
**버전**: 1.1.0  
**상태**: Confidence 표시 기능 추가
