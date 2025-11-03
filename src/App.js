import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import InstructionPage from './pages/InstructionPage';
import MetaInfoPage from './pages/MetaInfoPage';
import WordReadingPage from './pages/WordReadingPage';
import SentenceReadingPage from './pages/SentenceReadingPage';
import ParagraphReadingPage from './pages/ParagraphReadingPage';
import CompletionPage from './pages/CompletionPage';
import SpeakingLoginPage from './pages/SpeakingLoginPage';
import SpeakingTestPage from './pages/SpeakingTestPage';
import SpeakingQuestionPage from './pages/SpeakingQuestionPage';
import SpeakingCompletionPage from './pages/SpeakingCompletionPage';
import ScoreLookupPage from './pages/ScoreLookupPage';
import './App.css';

function App() {
  // 앱 시작 시 CSRF 토큰 받아오기
  useEffect(() => {
    // /api/login/ 엔드포인트가 없으므로 /api/sessions/로 CSRF 토큰 획득
    // Django에서 @ensure_csrf_cookie를 sessions/ 뷰에 적용했다고 가정
    const csrfUrl = '/api/sessions/?limit=1';
    
    console.log('🌐 CSRF initialization request target:', csrfUrl);

    fetch(csrfUrl, {
      method: 'GET',
      credentials: 'include', // ⚠️ 쿠키 전송 허용
    })
      .then(async (response) => {
        if (!response.ok) {
          const bodyText = await response.text();
          console.warn('⚠️ CSRF token request failed:', response.status, bodyText);
          console.warn('   This is non-critical. Continuing without CSRF token.');
          return;
        }
        console.log('✅ CSRF token initialized via', csrfUrl);
        
        // 쿠키 확인 로그
        setTimeout(() => {
          const cookies = document.cookie;
          console.log('🍪 Cookies after CSRF init:', cookies ? cookies.substring(0, 200) : 'EMPTY');
          const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
          if (csrfToken) {
            console.log('✅ CSRF token found:', csrfToken.substring(0, 30) + '...');
          } else {
            console.warn('⚠️ CSRF token NOT found in cookies after initialization!');
          }
        }, 500);
      })
      .catch((error) => {
        console.warn('⚠️ CSRF token initialization error (non-critical):', error.message);
      });
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/instructions" element={<InstructionPage />} />
          <Route path="/meta" element={<MetaInfoPage />} />
          <Route path="/word-reading" element={<WordReadingPage />} />
          <Route path="/sentence-reading" element={<SentenceReadingPage />} />
          <Route path="/paragraph-reading" element={<ParagraphReadingPage />} />
          <Route path="/completion" element={<CompletionPage />} />
          <Route path="/speaking-login" element={<SpeakingLoginPage />} />
          <Route path="/speaking-test" element={<SpeakingTestPage />} />
          <Route path="/speaking-questions" element={<SpeakingQuestionPage />} />
          <Route path="/speaking-completion" element={<SpeakingCompletionPage />} />
          <Route path="/score-lookup" element={<ScoreLookupPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
