# 서버 오류 해결 가이드

## 🔴 발생한 오류

```
AttributeError at /api/recordings/
'NoneType' object has no attribute 'strftime'
```

### 오류 원인
Django 서버에서 `None` 값에 대해 `.strftime()` 메서드를 호출하려고 시도했습니다. 이는 일반적으로 다음과 같은 경우에 발생합니다:

1. **날짜/시간 필드가 None**: 모델의 날짜 필드가 `null=True`이고 값이 설정되지 않았을 때
2. **자동 생성 필드 문제**: `auto_now_add` 또는 `auto_now`가 제대로 작동하지 않을 때
3. **직렬화 오류**: Serializer에서 날짜 필드를 처리할 때

## 🔧 Django 서버 수정 방법

### 1. 모델 확인 (`models.py`)

```python
from django.db import models

class Recording(models.Model):
    title = models.CharField(max_length=200)
    audio_file = models.FileField(upload_to='recordings/')
    session = models.ForeignKey('Session', on_delete=models.CASCADE, null=True, blank=True)
    
    # 날짜 필드 확인
    created_at = models.DateTimeField(auto_now_add=True)  # 자동으로 생성 시각 설정
    updated_at = models.DateTimeField(auto_now=True)      # 자동으로 수정 시각 설정
    
    # 또는 null 허용하는 경우
    # created_at = models.DateTimeField(null=True, blank=True)
```

### 2. Serializer 수정 (`serializers.py`)

```python
from rest_framework import serializers
from .models import Recording

class RecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recording
        fields = ['id', 'title', 'audio_file', 'session', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """날짜 필드가 None인 경우 처리"""
        data = super().to_representation(instance)
        
        # created_at이 None인 경우 현재 시각 사용
        if instance.created_at is None:
            from django.utils import timezone
            data['created_at'] = timezone.now().isoformat()
        
        return data
```

### 3. View 수정 (`views.py`)

```python
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.utils import timezone
from .models import Recording
from .serializers import RecordingSerializer

class RecordingViewSet(viewsets.ModelViewSet):
    queryset = Recording.objects.all()
    serializer_class = RecordingSerializer
    
    def create(self, request, *args, **kwargs):
        """녹음 파일 업로드"""
        try:
            # 파일 및 데이터 추출
            audio_file = request.FILES.get('audio_file')
            title = request.data.get('title')
            session_id = request.data.get('session')
            
            if not audio_file:
                return Response(
                    {'error': 'audio_file is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not title:
                return Response(
                    {'error': 'title is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Recording 생성
            recording = Recording.objects.create(
                title=title,
                audio_file=audio_file,
                session_id=session_id if session_id else None,
                created_at=timezone.now(),  # 명시적으로 설정
                updated_at=timezone.now()
            )
            
            serializer = self.get_serializer(recording)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
```

### 4. 마이그레이션

모델을 수정한 후 마이그레이션을 실행하세요:

```bash
python manage.py makemigrations
python manage.py migrate
```

## 🛠 임시 해결 방법

### 데이터베이스에서 None 값 수정

```bash
python manage.py shell
```

```python
from django.utils import timezone
from yourapp.models import Recording

# created_at이 None인 레코드 찾기
null_records = Recording.objects.filter(created_at__isnull=True)
print(f"Found {null_records.count()} records with null created_at")

# 현재 시각으로 업데이트
null_records.update(created_at=timezone.now(), updated_at=timezone.now())
```

## 📋 체크리스트

서버를 수정한 후 다음 사항을 확인하세요:

- [ ] 모델의 날짜 필드에 `auto_now_add=True` 설정
- [ ] 기존 데이터의 None 값 수정
- [ ] 마이그레이션 실행
- [ ] Serializer에서 날짜 필드 올바르게 처리
- [ ] View에서 예외 처리 추가
- [ ] 서버 재시작
- [ ] Postman/curl로 API 테스트

## 🧪 테스트 방법

### 1. Postman 또는 curl로 테스트

```bash
curl -X POST http://210.125.93.241:8020/api/recordings/ \
  -F "title=테스트 단어" \
  -F "audio_file=@test.webm"
```

예상 응답:
```json
{
  "id": 1,
  "title": "테스트 단어",
  "audio_file": "http://210.125.93.241:8020/media/recordings/test.webm",
  "session": null,
  "created_at": "2025-10-22T10:30:00Z",
  "updated_at": "2025-10-22T10:30:00Z"
}
```

### 2. 프론트엔드에서 테스트

서버 수정 후:
1. http://localhost:3000 접속
2. "참가하기" → 동의 → "평가 시작하기"
3. 녹음 진행
4. 콘솔에서 "✅ 업로드 성공" 확인

## 💡 프론트엔드 개선 사항 (완료)

서버 오류가 발생해도 사용자가 녹음을 계속할 수 있도록 다음 기능을 추가했습니다:

### 1. 자동 로컬 모드 전환
- ✅ 업로드 실패 시 자동으로 로컬 저장
- ✅ 사용자는 중단 없이 계속 진행
- ✅ 오류 메시지는 콘솔에만 표시

### 2. 상태 표시 개선
```javascript
// 세션 있음: "✅ 업로드 완료!"
// 세션 없음: "✅ 녹음 완료! (로컬 저장)"
```

### 3. 데이터 보존
```javascript
{
  id: null,
  word: "사과",
  title: "단어 1: 사과",
  audio: Blob,  // 오디오 데이터 보존
  recordingId: null,
  error: '서버 오류로 로컬 저장됨'
}
```

## 🔄 현재 동작 방식

### 세션 생성 실패 시:
```
InstructionPage → 세션 생성 시도 → 실패
→ 사용자에게 선택권 제공
→ "확인" 클릭 시 로컬 모드로 진행 (sessionId = null)
```

### 녹음 업로드 실패 시:
```
녹음 완료 → 서버 업로드 시도 → 실패
→ 자동으로 로컬 저장으로 전환
→ "✅ 녹음 완료! (로컬 저장)" 표시
→ 사용자는 계속 진행 가능
```

## 📝 로그 분석

### 정상 동작 (서버 정상):
```
📝 Creating session...
✅ 세션 생성 완료: {id: 123}
📤 Uploading: "단어 1: 사과"...
✅ Upload successful - ID: 456
```

### 로컬 모드 (서버 오류):
```
📝 Creating session...
❌ 세션 생성 실패: Network Error
오류 상세: connect ECONNREFUSED
⚠️ 세션 없이 로컬 녹음 모드로 진행
⚠️ 세션 없음 - 로컬 저장만 수행
```

### 업로드 실패 후 복구:
```
📤 Uploading: "단어 1: 사과"...
❌ 업로드 실패: Request failed with status code 500
오류 상세: 'NoneType' object has no attribute 'strftime'
⚠️ 서버 오류 - 로컬 저장으로 전환
```

## 🎯 다음 단계

### 즉시:
1. **Django 서버 코드 수정** (위 가이드 참고)
2. **데이터베이스 수정** (None 값 처리)
3. **서버 재시작**
4. **API 테스트** (Postman/curl)

### 서버 수정 후:
1. 프론트엔드에서 재테스트
2. 정상 업로드 확인
3. 평가 기능 구현

## 📞 문의

서버 수정 후에도 문제가 계속되면:
1. Django 로그 확인: `/var/log/django/error.log`
2. 모델 정의 확인
3. 데이터베이스 스키마 확인

---

**작성일**: 2025년 10월 22일  
**상태**: 프론트엔드 대응 완료, 서버 수정 필요
