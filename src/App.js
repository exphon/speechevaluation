import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import InstructionPage from './pages/InstructionPage';
import WordReadingPage from './pages/WordReadingPage';
import SentenceReadingPage from './pages/SentenceReadingPage';
import ParagraphReadingPage from './pages/ParagraphReadingPage';
import CompletionPage from './pages/CompletionPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/instructions" element={<InstructionPage />} />
          <Route path="/word-reading" element={<WordReadingPage />} />
          <Route path="/sentence-reading" element={<SentenceReadingPage />} />
          <Route path="/paragraph-reading" element={<ParagraphReadingPage />} />
          <Route path="/completion" element={<CompletionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
