# Django 전사 API 구현 가이드

React 앱이 `/api/recordings/{id}/transcribe/` 엔드포인트를 호출하고 있지만, Django 백엔드에 이 엔드포인트가 구현되지 않아 500 에러가 발생하고 있습니다.

## 필요한 구현

### 1. Django 뷰 추가

```python
# views.py 또는 recordings/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
import openai
import os

@api_view(['POST'])
def transcribe_recording(request, pk):
    """
    녹음 파일을 Whisper API로 전사
    
    POST /api/recordings/{id}/transcribe/
    
    Returns:
        {
            "transcription": "전사된 텍스트",
            "language": "ko",
            "confidence": 0.95
        }
    """
    try:
        # 녹음 객체 가져오기
        from .models import Recording  # 실제 모델 경로로 수정
        recording = get_object_or_404(Recording, pk=pk)
        
        # 이미 전사된 경우 반환
        if recording.transcribed_text:
            return Response({
                'transcription': recording.transcribed_text,
                'language': 'ko',
                'already_transcribed': True
            })
        
        # 오디오 파일 경로 확인
        if not recording.audio_file:
            return Response(
                {'error': '오디오 파일이 없습니다'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # OpenAI Whisper API 사용
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        if not openai.api_key:
            return Response(
                {'error': 'OpenAI API 키가 설정되지 않았습니다'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Whisper API 호출
        with recording.audio_file.open('rb') as audio_file:
            response = openai.Audio.transcribe(
                model="whisper-1",
                file=audio_file,
                language="ko"  # 한국어 지정
            )
        
        transcribed_text = response.get('text', '')
        
        # DB에 저장
        recording.transcribed_text = transcribed_text
        recording.save()
        
        return Response({
            'transcription': transcribed_text,
            'language': 'ko',
            'confidence': 1.0  # Whisper API는 confidence를 제공하지 않음
        })
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"❌ Transcription error: {error_detail}")
        
        return Response(
            {
                'error': str(e),
                'detail': error_detail if os.getenv('DEBUG') == 'True' else 'Internal server error'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

### 2. URL 라우팅 추가

```python
# urls.py

from django.urls import path
from . import views

urlpatterns = [
    # ... 기존 URL 패턴들
    
    path('recordings/<int:pk>/transcribe/', views.transcribe_recording, name='transcribe-recording'),
]
```

### 3. Recording 모델에 필드 추가 (필요시)

```python
# models.py

class Recording(models.Model):
    # ... 기존 필드들
    
    transcribed_text = models.TextField(
        blank=True,
        null=True,
        verbose_name="전사된 텍스트"
    )
    transcribed_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="전사 완료 시간"
    )
```

마이그레이션 실행:
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. 환경 변수 설정

`.env` 파일에 OpenAI API 키 추가:
```
OPENAI_API_KEY=your-openai-api-key-here
```

### 5. 필요한 패키지 설치

```bash
pip install openai
```

`requirements.txt`에 추가:
```
openai>=1.0.0
```

## 대안: 로컬 Whisper 사용 (OpenAI API 없이)

OpenAI API 비용이 부담되면 로컬 Whisper 모델 사용:

```python
import whisper

@api_view(['POST'])
def transcribe_recording(request, pk):
    try:
        recording = get_object_or_404(Recording, pk=pk)
        
        if recording.transcribed_text:
            return Response({'transcription': recording.transcribed_text})
        
        # Whisper 모델 로드 (처음 한 번만)
        # 작은 모델: tiny, base, small
        # 큰 모델: medium, large
        model = whisper.load_model("base")
        
        # 전사 수행
        result = model.transcribe(
            recording.audio_file.path,
            language='ko'
        )
        
        transcribed_text = result['text']
        
        # DB 저장
        recording.transcribed_text = transcribed_text
        recording.save()
        
        return Response({
            'transcription': transcribed_text,
            'language': result.get('language', 'ko')
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

로컬 Whisper 설치:
```bash
pip install openai-whisper
```

## 테스트

구현 후 테스트:

```bash
# Django 서버 실행
python manage.py runserver

# 또는 Vercel에 배포 후 테스트
```

React 앱에서 "모든 녹음 전사하기" 버튼을 클릭하여 정상 작동 확인.

## 현재 에러 원인

- React: `POST /api/recordings/101/transcribe/` 호출
- Django: 해당 엔드포인트 없음 → 500 에러
- 에러 메시지: `{error: "pn"}` (정확한 에러 메시지가 파싱되지 않음)

위 코드를 Django 프로젝트에 추가하면 문제가 해결됩니다.
