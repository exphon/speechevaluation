# Django CSRF 및 인증 설정 가이드

## 현재 문제 상황
1. ❌ CSRF 쿠키가 발급되지 않음 (`🍪 Cookies: EMPTY`)
2. ❌ 세션 생성 시 403 Forbidden (`자격 인증데이터가 제공되지 않았습니다`)
3. ❌ 모든 POST 요청이 실패

## ⚠️ 필수 Django 설정

### 1. REST Framework 권한 설정 (settings.py)

**발음/말하기 평가는 공개 서비스이므로 인증 불필요:**

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # ⚠️ 필수: 인증 없이 접근 허용
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
}
```

### 2. CSRF 쿠키 설정 (settings.py)

```python
# CSRF 설정
CSRF_TRUSTED_ORIGINS = [
    "https://speechevaluation.vercel.app",
    "http://localhost:3000",
]

CSRF_COOKIE_NAME = 'csrftoken'
CSRF_COOKIE_HTTPONLY = False  # ⚠️ 필수: JavaScript에서 접근 가능하게
CSRF_COOKIE_SECURE = True     # HTTPS에서만 전송
CSRF_COOKIE_SAMESITE = 'None' # ⚠️ 필수: Cross-origin 쿠키 허용
CSRF_USE_SESSIONS = False     # 쿠키 기반 CSRF 사용
```

### 3. CORS 설정 (settings.py)

```python
# CORS 설정
CORS_ALLOWED_ORIGINS = [
    "https://speechevaluation.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True  # ⚠️ 필수: 쿠키 전송 허용

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',  # ⚠️ 필수: CSRF 토큰 헤더 허용
    'x-requested-with',
]
```

### 4. Session 쿠키 설정 (settings.py)

```python
# Session 설정  
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_HTTPONLY = True
```

### 5. ViewSet에서 CSRF 쿠키 발급 (views.py)

⚠️ **가장 중요!** CSRF 쿠키를 발급하도록 데코레이터 추가:

```python
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

@method_decorator(ensure_csrf_cookie, name='dispatch')
class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [AllowAny]  # ⚠️ 필수: 인증 없이 접근 허용
    
    def get_queryset(self):
        queryset = super().get_queryset()
        participant_id = self.request.query_params.get('participant_id')
        
        if participant_id:
            queryset = queryset.filter(name=participant_id)
        
        return queryset

@method_decorator(ensure_csrf_cookie, name='dispatch')
class RecordingViewSet(viewsets.ModelViewSet):
    queryset = Recording.objects.all()
    serializer_class = RecordingSerializer
    permission_classes = [AllowAny]  # ⚠️ 필수
```

## 테스트 방법

### 1. CSRF 쿠키 발급 확인

```bash
curl -v "http://210.125.93.241:8020/api/sessions/?limit=1" 2>&1 | grep -i "set-cookie"
```

**기대 결과:**
```
< Set-Cookie: csrftoken=...; Path=/; SameSite=None; Secure
```

### 2. POST 요청 테스트

```bash
# 먼저 CSRF 토큰 받기
curl -c cookies.txt "http://210.125.93.241:8020/api/sessions/?limit=1"

# CSRF 토큰 추출
CSRF_TOKEN=$(grep csrftoken cookies.txt | awk '{print $7}')

# POST 요청
curl -b cookies.txt -X POST \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: $CSRF_TOKEN" \
  -d '{"name":"test","description":"test"}' \
  "http://210.125.93.241:8020/api/sessions/"
```

**기대 결과:** 200 OK 또는 201 Created

## 문제 해결 체크리스트

- [ ] `REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = [AllowAny]`
- [ ] `CSRF_COOKIE_HTTPONLY = False`
- [ ] `CSRF_COOKIE_SAMESITE = 'None'`
- [ ] `CORS_ALLOW_CREDENTIALS = True`
- [ ] `@ensure_csrf_cookie` 데코레이터 추가
- [ ] Django 서버 재시작

## 현재 상태 (프론트엔드)

✅ withCredentials: true (axios)  
✅ credentials: 'include' (fetch)  
✅ X-CSRFToken 헤더 자동 추가  
✅ GET 요청은 CSRF 경고 제거  
✅ /api/sessions/ 엔드포인트로 CSRF 초기화

**다음 필요한 작업: Django 백엔드 설정만 수정하면 됩니다.**
