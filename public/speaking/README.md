# 말하기 평가 미디어 파일 가이드

## 📁 폴더 구조

```
public/speaking/
├── images/          # 이미지 파일 (4~6등급)
│   ├── grade-4-01.png
│   ├── grade-5-01.png
│   └── grade-6-01.png
└── audio/           # 오디오 파일 (4~6등급)
    ├── grade-4-01.wav
    ├── grade-5-01.wav
    └── grade-6-01.wav
```

## 📊 Vercel 배포 용량 제한

### Free Plan (무료 플랜)
- **배포 용량**: 최대 100MB (압축 전)
- **대역폭**: 월 100GB
- **빌드 시간**: 월 6000분

### Pro Plan (유료 플랜 - $20/월)
- **배포 용량**: 최대 300MB
- **대역폭**: 월 1TB
- **빌드 시간**: 무제한

## 💡 파일 크기 최적화 권장사항

### 이미지 파일
- **형식**: PNG 또는 JPG
- **권장 크기**: 
  - 해상도: 최대 1200x800px
  - 파일 크기: 100-300KB 이하
- **최적화 도구**:
  - TinyPNG (https://tinypng.com/)
  - ImageOptim (Mac)
  - Squoosh (https://squoosh.app/)

### 오디오 파일
- **형식**: WAV → MP3 변환 권장
  - WAV: 1분당 약 10MB
  - MP3 (128kbps): 1분당 약 1MB
- **권장 설정**:
  - 비트레이트: 128kbps
  - 샘플레이트: 44.1kHz
  - 모노 (스테레오 대신)
- **변환 도구**:
  - FFmpeg: `ffmpeg -i input.wav -b:a 128k -ac 1 output.mp3`
  - Audacity (무료)
  - Online Audio Converter

## 📝 파일 명명 규칙

```
grade-{등급번호}-{문항번호}.{확장자}

예시:
- grade-4-01.png    # 4등급 첫 번째 문제 이미지
- grade-4-01.mp3    # 4등급 첫 번째 문제 오디오
- grade-5-02.png    # 5등급 두 번째 문제 이미지
```

## 🎯 예상 용량 계산

### 예시: 각 등급당 3문제씩 (4~6등급)
```
이미지: 9개 × 200KB = 1.8MB
오디오: 9개 × 1MB = 9MB
총합: 약 11MB
```

### 전체 프로젝트 용량
```
소스 코드: ~5MB
미디어 파일: ~11MB
node_modules (빌드 시): ~200MB (빌드 결과물만 배포됨)
---
배포 용량: 약 15-20MB ✅ (100MB 한도 내)
```

## ⚠️ 중요 사항

1. **Git에 큰 파일 추가 시 주의**
   - 100MB 이상 파일은 Git LFS 사용 필요
   - 현재 설정은 작은 파일만 관리

2. **대안: 외부 CDN 사용**
   - Cloudinary (무료: 25GB)
   - AWS S3 + CloudFront
   - Google Cloud Storage
   
3. **파일 추가 방법**
   - 이 폴더에 직접 파일 복사
   - `src/data/speakData.js`에서 경로 확인
   - 경로는 `/speaking/images/...` 또는 `/speaking/audio/...`

## 🚀 테스트 방법

1. 로컬에서 테스트:
   ```bash
   npm start
   ```

2. 브라우저 개발자 도구에서 Network 탭 확인
   - 이미지/오디오가 제대로 로드되는지 확인
   - 404 에러가 없는지 확인

3. 빌드 크기 확인:
   ```bash
   npm run build
   du -sh build/
   ```

## 📞 문의사항

파일 추가나 최적화 관련 문의사항이 있으시면 말씀해주세요!
