# 변경 사항 (Immediate Upload Implementation)

## 개요
녹음 정지 버튼을 누르면 즉시 서버에 업로드되도록 시스템을 수정했습니다.

## 주요 변경사항

### 1. API 서비스 수정 (`src/services/api.js`)

#### 변경된 함수 시그니처
**이전:**
```javascript
uploadRecording(audioBlob, type, expectedText, sessionId)
// FormData fields: audio_file, recording_type, expected_text, session_id
```

**이후:**
```javascript
uploadRecording(audioBlob, title, sessionId)
// FormData fields: audio_file, title, session (optional)
```

**createSession 함수:**
```javascript
createSession(name = null, description = null)
// POST /api/sessions/ with optional name and description
```

### 2. InstructionPage 수정

**변경 사항:**
- 세션 생성 기능 추가
- "평가 시작하기" 버튼 클릭 시 세션 자동 생성
- 생성된 세션 ID를 WordReadingPage로 전달

**흐름:**
1. 사용자가 동의 체크박스 선택
2. "평가 시작하기" 버튼 클릭
3. 서버에 세션 생성 요청
4. 생성된 세션 ID와 함께 단어 읽기 페이지로 이동

### 3. WordReadingPage 수정

**주요 변경:**
- 녹음 완료 즉시 서버 업로드 구현
- 업로드 상태 표시 (uploading/success/error)
- 업로드 완료 후에만 "다음" 버튼 활성화
- 세션 ID를 다음 페이지로 전달

**업로드 타이밍:**
```
녹음 중지 → 즉시 업로드 시작 → 업로드 완료 → "다음" 버튼 활성화
```

**업로드되는 데이터:**
- title: "단어 1: [단어내용]"
- audio_file: Blob 객체
- session: 세션 ID

### 4. SentenceReadingPage 수정

**WordReadingPage와 동일한 패턴:**
- 녹음 완료 즉시 업로드
- 업로드 상태 표시
- 세션 ID 전달

**업로드되는 데이터:**
- title: "문장 1: [문장내용]"
- audio_file: Blob 객체
- session: 세션 ID

### 5. ParagraphReadingPage 수정

**WordReadingPage와 동일한 패턴:**
- 녹음 완료 즉시 업로드
- 업로드 상태 표시
- 업로드된 녹음 ID를 CompletionPage로 전달

**업로드되는 데이터:**
- title: "문단 읽기"
- audio_file: Blob 객체
- session: 세션 ID

### 6. CompletionPage 수정

**변경 사항:**
- 업로드 기능 완전 제거 (이미 모두 업로드됨)
- 업로드된 녹음 목록만 표시
- 각 녹음의 ID와 제목 표시

**표시 정보:**
- 세션 ID
- 단어 녹음 목록 (제목, ID)
- 문장 녹음 목록 (제목, ID)
- 문단 녹음 (제목, ID)

### 7. CSS 스타일 추가

**공통 스타일 (WordReadingPage.css, SentenceReadingPage.css, ParagraphReadingPage.css):**
```css
.upload-status {
  /* 업로드 상태 표시 스타일 */
}
.upload-status.uploading { /* 업로드 중 */ }
.upload-status.success { /* 업로드 성공 */ }
.upload-status.error { /* 업로드 실패 */ }
```

**CompletionPage.css:**
- 세션 정보 박스 스타일
- 녹음 목록 스타일
- 녹음 카테고리별 스타일

## 데이터 흐름

```
InstructionPage
  ↓ (세션 생성)
  ↓ sessionId
  ↓
WordReadingPage (10개)
  → 녹음1 업로드 → recordingId1
  → 녹음2 업로드 → recordingId2
  → ...
  ↓ (sessionId, [recordingIds])
  ↓
SentenceReadingPage (3개)
  → 녹음1 업로드 → recordingId11
  → 녹음2 업로드 → recordingId12
  → 녹음3 업로드 → recordingId13
  ↓ (sessionId, [recordingIds])
  ↓
ParagraphReadingPage (1개)
  → 녹음 업로드 → recordingId14
  ↓ (sessionId, [all recordingIds])
  ↓
CompletionPage
  - 업로드된 녹음 목록 표시
  - 세션 정보 표시
```

## API 호출 순서

1. **POST /api/sessions/**
   - InstructionPage에서 호출
   - 응답: `{id, name, description, recording_count, created_at, updated_at}`

2. **POST /api/recordings/** (14번 호출)
   - 각 녹음마다 즉시 호출
   - Body: `FormData {title, audio_file, session}`
   - 응답: `{id, session, title, audio_file, duration, file_size, status, ...}`

3. **CompletionPage 도달**
   - 모든 녹음이 이미 업로드 완료된 상태
   - 추가 업로드 없음

## 사용자 경험 개선

### 이전:
1. 모든 녹음을 로컬에 저장
2. 마지막에 한 번에 업로드
3. 업로드 실패 시 모든 녹음 재업로드 필요

### 이후:
1. 각 녹음 즉시 업로드
2. 업로드 상태 실시간 확인
3. 실패 시 해당 녹음만 재녹음
4. 네트워크 안정성 향상

## 오류 처리

**업로드 실패 시:**
- 오류 메시지 표시
- "다시 녹음하기" 버튼으로 재시도
- "다음" 버튼 비활성화 (업로드 성공 시에만 활성화)

**네트워크 문제:**
- Axios timeout: 120초
- 자동 재시도 없음 (사용자가 직접 재녹음)

## 테스트 방법

1. 개발 서버 실행:
   ```bash
   cd /Users/tyoon/work/reactnative/kocca/speech-evaluation-app
   npm start
   ```

2. 브라우저에서 http://localhost:3000 접속

3. 테스트 시나리오:
   - [ ] InstructionPage에서 세션 생성 확인
   - [ ] WordReadingPage에서 각 녹음 즉시 업로드 확인
   - [ ] 업로드 중 상태 표시 확인
   - [ ] 업로드 성공 후 "다음" 버튼 활성화 확인
   - [ ] SentenceReadingPage 동일 확인
   - [ ] ParagraphReadingPage 동일 확인
   - [ ] CompletionPage에서 모든 녹음 ID 표시 확인

## 서버 연동

**서버 주소:** http://210.125.93.241:8020/api/

**필요한 엔드포인트:**
- POST /api/sessions/
- POST /api/recordings/
- GET /api/recordings/ (선택)
- GET /api/recordings/{id}/ (선택)

**CORS 설정 필요:**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    # 실제 프론트엔드 도메인 추가
]
```

## 다음 단계

1. **서버 연동 테스트**
   - Django 서버가 정상 작동하는지 확인
   - API 응답 형식 검증

2. **평가 기능 추가**
   - POST /api/recordings/{id}/process/
   - POST /api/recordings/{id}/transcribe/
   - 평가 결과 표시 페이지

3. **적응형 문제 생성**
   - 평가 결과 기반 추가 문제 생성
   - 난이도 조정

## 주의사항

- 서버가 실행 중이어야 업로드 가능
- 마이크 권한 필요
- 네트워크 연결 필요
- 브라우저 MediaRecorder API 지원 필요 (Chrome, Firefox, Edge)

## 파일 목록

**수정된 파일:**
- `src/services/api.js`
- `src/pages/InstructionPage.js`
- `src/pages/WordReadingPage.js`
- `src/pages/SentenceReadingPage.js`
- `src/pages/ParagraphReadingPage.js`
- `src/pages/CompletionPage.js`
- `src/pages/WordReadingPage.css`
- `src/pages/SentenceReadingPage.css`
- `src/pages/ParagraphReadingPage.css`
- `src/pages/CompletionPage.css`

**추가된 파일:**
- `CHANGES.md` (이 문서)
