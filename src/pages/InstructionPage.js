import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../services/api';
import './InstructionPage.css';

/**
 * 녹음 방법 설명 페이지
 */
const InstructionPage = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleAgree = async () => {
    if (agreed && !creating) {
      // 메타정보 입력 화면으로 이동 (세션 생성은 그 화면에서 처리)
      navigate('/meta');
    }
  };

  return (
    <div className="instruction-page">
      <div className="instruction-container">
        <h1 className="instruction-title">녹음 방법 안내</h1>
        
        <div className="instruction-content">
          <section className="instruction-section">
            <h2>📋 평가 진행 방법</h2>
            <div className="instruction-text">
              <p>본 평가는 총 3단계로 진행됩니다:</p>
              <ol>
                <li><strong>단어 읽기</strong>: 화면에 제시되는 10개의 단어를 또박또박 읽어주세요.</li>
                <li><strong>문장 읽기</strong>: 3개의 문장을 자연스럽게 읽어주세요.</li>
                <li><strong>문단 읽기</strong>: 하나의 문단을 처음부터 끝까지 읽어주세요.</li>
              </ol>
            </div>
          </section>

          <section className="instruction-section">
            <h2>🎤 녹음 방법</h2>
            <div className="instruction-text">
              <ul>
                <li>각 문항마다 <strong>"녹음 시작"</strong> 버튼을 클릭하여 녹음을 시작합니다.</li>
                <li>제시된 텍스트를 또렷하게 읽어주세요.</li>
                <li>읽기가 끝나면 <strong>"녹음 중지"</strong> 버튼을 클릭합니다.</li>
                <li>녹음된 내용을 확인한 후 <strong>"다음"</strong> 버튼을 클릭합니다.</li>
              </ul>
            </div>
          </section>

          <section className="instruction-section">
            <h2>⚠️ 주의사항</h2>
            <div className="instruction-text">
              <ul>
                <li>조용한 환경에서 평가를 진행해주세요.</li>
                <li>마이크와 적절한 거리(약 30cm)를 유지해주세요.</li>
                <li>너무 빠르거나 느리지 않게, 자연스러운 속도로 읽어주세요.</li>
                <li>녹음 중에는 브라우저를 새로고침하거나 뒤로가기를 하지 마세요.</li>
                <li>한 번 제출한 녹음은 수정할 수 없습니다.</li>
              </ul>
            </div>
          </section>

          <section className="instruction-section">
            <h2>🔐 개인정보 처리</h2>
            <div className="instruction-text">
              <p>
                녹음된 음성 파일은 평가 목적으로만 사용되며, 
                평가 완료 후 안전하게 삭제됩니다. 
                수집된 데이터는 연구 및 시스템 개선을 위해 익명으로 처리될 수 있습니다.
              </p>
            </div>
          </section>

          <div className="agreement-section">
            <label className="agreement-checkbox">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>위 내용을 모두 확인했으며, 평가 진행에 동의합니다.</span>
            </label>
          </div>

          <div className="button-group">
            <button 
              className="back-button"
              onClick={() => navigate('/')}
              disabled={creating}
            >
              ← 뒤로가기
            </button>
            <button 
              className={`start-button ${agreed ? 'active' : ''}`}
              onClick={handleAgree}
              disabled={!agreed || creating}
            >
              {creating ? '세션 생성 중...' : '평가 시작하기 →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionPage;
