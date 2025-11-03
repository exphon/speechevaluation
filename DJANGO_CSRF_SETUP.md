# Django CSRF 설정 가이드

## 문제 상황
프론트엔드에서 403 Forbidden 에러 발생:
```
GET https://speechevaluation.vercel.app/api/sessions/?participant_id=P_526240 403 (Forbidden)
```

## Django 백엔드 필수 설정

### 1. CORS 설정 (settings.py)

```python
# CORS 설정
CORS_ALLOWED_ORIGINS = [
    "https://speechevaluation.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True  # ⚠️ 중요: 쿠키 전송 허용

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',  # ⚠️ 중요: CSRF 토큰 헤더 허용
    'x-requested-with',
]
```

### 2. CSRF 설정 (settings.py)

```python
# CSRF 설정
CSRF_TRUSTED_ORIGINS = [
    "https://speechevaluation.vercel.app",
    "http://localhost:3000",
]

CSRF_COOKIE_NAME = 'csrftoken'
CSRF_COOKIE_HTTPONLY = False  # ⚠️ 중요: JavaScript에서 접근 가능하게
CSRF_COOKIE_SECURE = True     # HTTPS에서만 전송
CSRF_COOKIE_SAMESITE = 'None' # Cross-origin 쿠키 허용
CSRF_USE_SESSIONS = False     # 쿠키 기반 CSRF 사용
```

### 3. Session 쿠키 설정 (settings.py)

```python
# Session 설정
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_HTTPONLY = True
```

### 4. /login/ 엔드포인트 생성

CSRF 토큰을 발급하는 엔드포인트가 필요합니다:

```python
# views.py
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def get_csrf_token(request):
    """
    CSRF 토큰을 쿠키로 발급하는 엔드포인트
    프론트엔드가 앱 시작 시 이 엔드포인트를 호출해야 함
    """
    return JsonResponse({'detail': 'CSRF cookie set'})

# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.get_csrf_token, name='csrf'),
    # ... 기타 URL 패턴
]
```

### 5. GET 요청 CSRF 면제 (선택사항)

GET 요청은 일반적으로 CSRF 검증이 필요 없습니다. Django REST Framework를 사용하는 경우:

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # 또는 필요한 권한 클래스
    ],
}
```

특정 뷰에서 CSRF 면제가 필요한 경우:

```python
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class MyAPIView(APIView):
    pass
```

## 프론트엔드 설정 (이미 완료됨)

✅ `withCredentials: true` - axios 설정 완료
✅ `credentials: 'include'` - fetch 설정 완료
✅ `X-CSRFToken` 헤더 자동 추가 - interceptor 설정 완료
✅ 앱 시작 시 `/login/` 호출 - CSRF 토큰 사전 획득 완료

## 디버깅 체크리스트

### 프론트엔드 (브라우저 콘솔)
1. `🌐 CSRF initialization request target:` - 올바른 URL로 요청하는지 확인
2. `✅ CSRF token initialized via` - 초기화 성공 메시지 확인
3. `🍪 Cookies after CSRF init:` - 쿠키가 설정되었는지 확인
4. `🔐 [Request Interceptor]` - 각 요청에 CSRF 토큰이 포함되는지 확인

### Django 백엔드
1. Django 로그에서 403 에러 원인 확인
2. CORS 설정이 올바른지 확인
3. CSRF 쿠키가 제대로 설정되는지 확인
4. `/login/` 엔드포인트가 존재하고 응답하는지 확인

### 브라우저 DevTools (Network 탭)
1. `/api/login/` 요청의 Response Headers에서 `Set-Cookie: csrftoken=...` 확인
2. 후속 요청의 Request Headers에서 `X-CSRFToken: ...` 확인
3. 후속 요청의 Request Headers에서 `Cookie: csrftoken=...` 확인

## 일반적인 문제와 해결책

### 문제: 쿠키가 저장되지 않음
**원인**: `CSRF_COOKIE_SAMESITE` 또는 `CORS_ALLOW_CREDENTIALS` 설정 누락
**해결**: 위 설정들 확인 및 추가

### 문제: CSRF 토큰이 없다고 나옴
**원인**: `/login/` 엔드포인트가 없거나 `@ensure_csrf_cookie` 데코레이터 누락
**해결**: 엔드포인트 생성 및 데코레이터 추가

### 문제: Cross-origin 쿠키 경고
**원인**: SameSite 정책 문제
**해결**: `CSRF_COOKIE_SAMESITE = 'None'` 및 `CSRF_COOKIE_SECURE = True` 설정

## 참고 자료
- [Django CSRF Protection](https://docs.djangoproject.com/en/stable/ref/csrf/)
- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)
