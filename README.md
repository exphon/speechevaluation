# 말하기 평가 시스템 (Speech Evaluation System)

음성 녹음 기반의 발음 평가 시스템입니다. 사용자가 단어, 문장, 문단을 읽으면 음성을 녹음하고, 서버로 전송하여 AI 기반 평가 및 피드백을 받을 수 있습니다.

## 📋 프로젝트 개요

이 시스템은 다음과 같은 단계로 구성됩니다:
1. **단어 읽기**: 10개의 단어를 읽고 녹음
2. **문장 읽기**: 3개의 문장을 읽고 녹음
3. **문단 읽기**: 1개의 문단을 읽고 녹음
4. **평가 및 피드백**: Whisper를 통한 음성 전사 및 OpenAI API를 통한 평가
5. **적응형 문제**: 평가 결과에 따른 맞춤형 문제 제공

## 🛠 기술 스택

### Frontend
- **React 18**: UI 라이브러리
- **React Router DOM**: 페이지 라우팅
- **Axios**: HTTP 클라이언트
- **MediaRecorder API**: 브라우저 기반 음성 녹음

### Backend (예정)
- **Django**: REST API 서버
- **Whisper**: 음성-텍스트 전사
- **OpenAI API**: 발음 평가
- **서버 주소**: 210.125.93.241:8020

## 📁 프로젝트 구조

```
speech-evaluation-app/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── RecordButton.js         # 녹음 버튼 컴포넌트
│   │   └── RecordButton.css
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── IndexPage.js            # 메인 페이지
│   │   ├── InstructionPage.js      # 안내 페이지
│   │   ├── WordReadingPage.js      # 단어 읽기 페이지
│   │   ├── SentenceReadingPage.js  # 문장 읽기 페이지
│   │   ├── ParagraphReadingPage.js # 문단 읽기 페이지
│   │   └── CompletionPage.js       # 완료 페이지
│   ├── services/           # API 서비스
│   │   └── api.js                  # 서버 통신 함수
│   ├── utils/             # 유틸리티
│   │   └── audioRecorder.js        # 녹음 유틸리티 클래스
│   ├── data/              # 테스트 데이터
│   │   └── testData.js             # 단어, 문장, 문단 데이터
│   ├── App.js             # 메인 앱 컴포넌트
│   └── index.js           # 진입점
├── package.json
└── README.md
```

## 🎯 주요 기능

### 1. 음성 녹음 시스템
- **MediaRecorder API** 사용
- 브라우저 마이크 권한 요청 및 관리
- 실시간 녹음 시간 표시
- 녹음 재생 및 재녹음 기능
- 지원 포맷: WebM, Ogg, MP4 (브라우저 호환성)

### 2. 사용자 인터페이스
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- **단계별 진행 표시**: 프로그레스 바 및 진행률
- **애니메이션**: 부드러운 페이지 전환 효과
- **직관적인 UX**: 명확한 안내 메시지 및 버튼

### 3. 페이지별 기능

#### IndexPage (메인 페이지)
- 시스템 소개 및 환영 메시지
- 평가 구성 안내
- 참가하기 버튼

#### InstructionPage (안내 페이지)
- 녹음 방법 상세 설명
- 주의사항 안내
- 개인정보 처리 동의
- 동의 후 평가 시작

#### WordReadingPage (단어 읽기)
- 10개 단어 순차적 제시
- 단어별 녹음 및 저장
- 진행률 표시
- 녹음 재생/재녹음 기능

#### SentenceReadingPage (문장 읽기)
- 3개 문장 순차적 제시
- 문장별 녹음 및 저장
- 이전 녹음 데이터 유지

#### ParagraphReadingPage (문단 읽기)
- 문단 전체 표시
- 한 번에 녹음
- 녹음 팁 제공

#### CompletionPage (완료 페이지)
- 녹음 요약 표시
- 서버 업로드 기능 (준비됨)
- 다음 단계 안내

## 🔧 기술 구현 상세

### AudioRecorder 클래스
```javascript
class AudioRecorder {
  - initialize(): 마이크 권한 요청 및 MediaRecorder 설정
  - start(): 녹음 시작
  - stop(): 녹음 중지 및 Blob 반환
  - cleanup(): 리소스 정리
  - getSupportedMimeType(): 브라우저 호환 포맷 확인
}
```

**핵심 기능:**
- Echo Cancellation: 에코 제거
- Noise Suppression: 노이즈 감소
- Auto Gain Control: 자동 음량 조절

### API 서비스 (준비됨)
```javascript
- uploadAudio(): 음성 파일 서버 업로드
- transcribeAudio(): Whisper 음성 전사
- evaluatePronunciation(): OpenAI 발음 평가
- getAdaptiveQuestion(): 적응형 문제 요청
```

### 상태 관리
- React Hooks (useState, useEffect) 사용
- React Router의 location.state로 페이지 간 데이터 전달
- 녹음 데이터는 배열로 관리 및 전달

## 🚀 시작하기

### 필수 요구사항
- Node.js 14 이상
- npm 또는 yarn
- 최신 브라우저 (Chrome, Firefox, Safari, Edge)

### 설치 및 실행

```bash
# 프로젝트 디렉토리로 이동
cd speech-evaluation-app

# 의존성 패키지 설치
npm install

# 개발 서버 실행
npm start
```

개발 서버가 실행되면 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 프로덕션 빌드

```bash
# 프로덕션 빌드 생성
npm run build
```

빌드된 파일은 `build/` 폴더에 생성됩니다.

## 🔐 브라우저 권한

이 애플리케이션은 다음 권한이 필요합니다:
- **마이크 접근 권한**: 음성 녹음을 위해 필수

### 권한 허용 방법
1. 첫 녹음 시도 시 브라우저가 권한 요청
2. "허용" 클릭
3. HTTPS 환경에서만 작동 (localhost는 예외)

## 📱 브라우저 호환성

| 브라우저 | 지원 여부 | 비고 |
|---------|----------|------|
| Chrome | ✅ | 완전 지원 |
| Firefox | ✅ | 완전 지원 |
| Safari | ✅ | iOS 14.3 이상 |
| Edge | ✅ | Chromium 기반 |
| IE | ❌ | 지원 안 함 |

## 🌐 서버 연동

### Django 서버 정보
- **서버 주소**: http://210.125.93.241:8020
- **API 베이스 URL**: http://210.125.93.241:8020/api
- **녹음 업로드**: http://210.125.93.241:8020/api/recordings/

### API 엔드포인트

```javascript
// 1. 세션 생성
POST /api/sessions/
응답: { session_id: "unique-session-id" }

// 2. 녹음 파일 업로드
POST /api/recordings/
Body (FormData):
  - audio_file: Blob (오디오 파일)
  - recording_type: "word" | "sentence" | "paragraph"
  - expected_text: "읽어야 할 텍스트"
  - session_id: "세션 ID" (선택)
응답: { id, audio_file, recording_type, expected_text, created_at }

// 3. 녹음 목록 조회
GET /api/recordings/
쿼리: ?session_id=xxx&recording_type=word
응답: [녹음 객체 배열]

// 4. 특정 녹음 조회
GET /api/recordings/{id}/
응답: { 녹음 정보 }

// 5. 녹음 처리 (전사 + 평가)
POST /api/recordings/{id}/process/
응답: { 
  transcription: "전사 결과",
  evaluation: { score, feedback, ... }
}

// 6. 세션 완료
POST /api/sessions/{session_id}/complete/
응답: { session_id, average_score, completed_at }

// 7. 적응형 문제
GET /api/adaptive-question/?level=상&session_id=xxx
응답: { question_data }
```

### 클라이언트 사용 예시

```javascript
import { 
  createSession,
  uploadRecording,
  processRecording,
  completeSession 
} from './services/api';

// 1. 세션 시작
const session = await createSession();
const sessionId = session.session_id;

// 2. 녹음 업로드
const result = await uploadRecording(
  audioBlob,        // Blob 객체
  'word',          // 타입
  '사과',          // 원본 텍스트
  sessionId        // 세션 ID
);

// 3. 녹음 처리 (전사 + 평가)
const processed = await processRecording(result.id);
console.log(processed.transcription); // "사과"
console.log(processed.evaluation.score); // "상"

// 4. 세션 완료
await completeSession(sessionId);
```

### 환경 변수 설정
`.env` 파일 생성:
```
REACT_APP_API_URL=http://210.125.93.241:8020/api
```

## 📊 데이터 흐름

```
[사용자 음성 입력]
    ↓
[MediaRecorder API - 브라우저 녹음]
    ↓
[Blob 생성 및 메모리 저장]
    ↓
[CompletionPage - 업로드 버튼 클릭]
    ↓
[1. 세션 생성 API 호출]
    ↓
[2. FormData로 녹음 파일 전송]
    ↓
[Django 서버 - 210.125.93.241:8020]
    ├─ /api/recordings/ 엔드포인트
    ├─ 파일 저장 (media/recordings/)
    └─ DB에 메타데이터 저장
    ↓
[3. 녹음 처리 요청 (선택)]
    ├─ Whisper 음성 전사 (서버 측)
    └─ OpenAI API 발음 평가 (서버 측)
    ↓
[평가 결과 반환]
    ├─ 전사 텍스트
    ├─ 평가 점수 (상/중/하)
    └─ 상세 피드백
    ↓
[4. 적응형 문제 생성]
    └─ 평가 레벨 기반 문제 제공
```

## 🎨 디자인 특징

- **그라데이션 배경**: 페이지별 고유 색상
- **카드 기반 레이아웃**: 깔끔한 컨텐츠 구성
- **애니메이션**: fadeIn, slideIn, bounce 효과
- **반응형**: 모바일 우선 디자인
- **접근성**: 의미있는 HTML 구조

## 🔄 향후 개발 계획

### Phase 1 (완료)
- ✅ React 프로젝트 기본 구조
- ✅ 음성 녹음 기능
- ✅ 페이지 라우팅
- ✅ UI/UX 구현

### Phase 2 (진행 중)
- ✅ 서버 API 연동 완료
- ✅ 녹음 파일 업로드 기능
- ✅ 세션 관리 시스템
- ⏳ Django 서버 구축 (API 준비 완료)
- ⏳ Whisper 음성 전사 연동
- ⏳ OpenAI API 평가 시스템
- ⏳ 데이터베이스 설계

### Phase 3 (계획)
- 📝 적응형 문제 알고리즘
- 📝 사용자 인증 시스템
- 📝 평가 결과 대시보드
- 📝 통계 및 분석 기능

## 🐛 알려진 이슈

1. **Safari iOS**: 일부 구형 버전에서 MediaRecorder 미지원
2. **파일 크기**: 긴 녹음은 파일 크기가 클 수 있음
3. **네트워크**: 업로드 시 안정적인 인터넷 연결 필요

## 📝 라이센스

이 프로젝트는 교육 및 연구 목적으로 개발되었습니다.

## 👥 기여

버그 리포트 및 기능 제안은 이슈 트래커를 통해 제출해주세요.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

**개발 일자**: 2025년 10월 21-22일  
**버전**: 1.1.0  
**상태**: Phase 2 진행 중 (서버 업로드 기능 완료)

## 💾 녹음 파일 저장 및 처리 방식

### 현재 구현
- **메모리 저장**: 녹음 중에는 Blob 객체로 메모리에 저장
- **서버 업로드**: CompletionPage에서 "서버에 업로드하기" 버튼 클릭 시 업로드
- **세션 관리**: 세션 ID로 여러 녹음을 그룹화하여 관리

### 업로드 프로세스
1. **세션 생성**: `POST /api/sessions/` → 세션 ID 발급
2. **순차 업로드**: 단어(10개) → 문장(3개) → 문단(1개)
3. **진행률 표시**: 실시간 업로드 진행률 (0-100%)
4. **에러 처리**: 실패 시 재시도 가능

### 서버 측 처리 (예정)
```
업로드된 파일
  ↓
Django media/recordings/ 저장
  ↓  
DB에 메타데이터 기록
  ↓
Whisper 음성 전사 (서버에서 실행)
  ↓
OpenAI API 평가 (서버에서 실행)
  ↓
결과 저장 및 반환
```

### ⚠️ 중요 사항
- **로컬 저장 없음**: 녹음 파일은 브라우저 메모리에만 존재
- **새로고침 주의**: 업로드 전 새로고침 시 모든 녹음 삭제됨
- **서버 필수**: AI 처리(Whisper, OpenAI)는 서버에서만 가능

