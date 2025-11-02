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
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
    
    fetch(`${API_BASE_URL}/sessions/`, {
      method: 'GET',
      credentials: 'include', // ⚠️ 쿠키 전송 허용
    })
      .then(() => {
        console.log('✅ CSRF token initialized');
      })
      .catch((error) => {
        console.warn('⚠️ CSRF token initialization failed (non-critical):', error.message);
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
