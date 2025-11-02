# API 설정 가이드

## 환경별 설정

### 개발 환경 (.env.development)
로컬에서 `npm start`로 개발할 때 사용됩니다.

```
REACT_APP_API_BASE_URL=http://210.125.93.241:8020/api
```

Django 백엔드 서버(`http://210.125.93.241:8020`)로 직접 요청을 보냅니다.

### 프로덕션 환경 (.env.production)
Vercel에 배포할 때 사용됩니다.

```
REACT_APP_API_BASE_URL=/api
```

Vercel의 리라이트(rewrites) 기능으로 `/api/*` 요청을 Django 백엔드로 프록시합니다.

## Vercel 리라이트 설정 (vercel.json)

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://210.125.93.241:8020/api/:path*"
    }
  ]
}
```

## 개발 서버 실행

```bash
# 개발 모드로 실행 (.env.development 사용)
npm start

# 프로덕션 빌드 (.env.production 사용)
npm run build
```

## CORS 설정

Django 서버에서 CORS를 허용해야 합니다:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # 로컬 개발
    "https://speechevaluation.vercel.app",  # Vercel 배포
]

# 또는 개발 중에는
CORS_ALLOW_ALL_ORIGINS = True
```

## 문제 해결

### 전사 API 500 에러
- Django 서버 URL이 올바른지 확인: `http://210.125.93.241:8020/api`
- Django에서 `/recordings/{id}/transcribe/` 엔드포인트가 구현되어 있는지 확인
- Django 서버 로그 확인

### CORS 에러
- Django `CORS_ALLOWED_ORIGINS`에 React 앱 URL 추가
- 브라우저 개발자 도구 > Network 탭에서 OPTIONS 요청 확인
