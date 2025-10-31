import React from 'react';
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
import SpeakingQuestionLowPage from './pages/SpeakingQuestionLowPage';
import SpeakingQuestionMidPage from './pages/SpeakingQuestionMidPage';
import SpeakingQuestionHighPage from './pages/SpeakingQuestionHighPage';
import './App.css';

function App() {
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
          <Route path="/speaking-question-low" element={<SpeakingQuestionLowPage />} />
          <Route path="/speaking-question-mid" element={<SpeakingQuestionMidPage />} />
          <Route path="/speaking-question-high" element={<SpeakingQuestionHighPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
