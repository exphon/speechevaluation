import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../services/api';
import './MetaInfoPage.css';

// 6자리 숫자 ID 생성 (발음평가용 - P_ 접두어)
const generatePronunciationId = () => `P_${String(Math.floor(100000 + Math.random() * 900000))}`;

const currentYear = new Date().getFullYear();

const MetaInfoPage = () => {
  const navigate = useNavigate();

  const [autoId, setAutoId] = useState(generatePronunciationId());
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [koreanMonths, setKoreanMonths] = useState(''); // 한국어 습득 기간(개월)

  const [submitting, setSubmitting] = useState(false);

  const years = useMemo(() => {
    const list = [];
    for (let y = currentYear; y >= 1940; y--) list.push(y);
    return list;
  }, []);

  const handleRegenerateId = () => setAutoId(generatePronunciationId());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const metadata = {
      participant_id: autoId,
      name: name || null,
      birth_year: birthYear || null,
      native_language: nativeLanguage || null,
      korean_acquisition_months: koreanMonths ? Number(koreanMonths) : null,
      created_at: new Date().toISOString(),
    };

    setSubmitting(true);

    try {
      // 세션 생성 시 메타데이터를 함께 전송
      const sessionName = `세션-${autoId}`;
      const description = '말하기 평가 (메타정보 포함)';
      const session = await createSession(sessionName, description, metadata);

      navigate('/word-reading', {
        state: {
          sessionId: session.id,
          meta: metadata,
        },
      });
    } catch (error) {
      console.error('❌ 세션 생성 실패:', error);
      const proceed = window.confirm(
        '서버에 연결할 수 없습니다.\n' +
          '세션 없이 로컬에서 녹음을 진행하시겠습니까? (메타정보는 함께 유지됩니다)\n\n' +
          '확인: 로컬 녹음 진행\n' +
          '취소: 돌아가기'
      );

      if (proceed) {
        navigate('/word-reading', {
          state: {
            sessionId: null,
            meta: metadata,
          },
        });
      } else {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="meta-page">
      <div className="meta-container">
        <h1 className="meta-title">참여자 메타정보</h1>
        <p className="meta-subtitle">평가 전에 간단한 정보를 입력해주세요. (추후 확장될 수 있어요)</p>

        <form className="meta-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>참여자 ID (발음평가용)</label>
            <div className="id-row">
              <input type="text" value={autoId} readOnly />
              <button type="button" className="regen-btn" onClick={handleRegenerateId}>
                재생성
              </button>
            </div>
            <p className="hint">P_ 접두어가 붙은 발음평가 전용 ID입니다. (말하기평가는 S_ 접두어)</p>
          </div>

          <div className="form-row">
            <label>이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
          </div>

          <div className="form-row">
            <label>태어난 해</label>
            <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
              <option value="">선택하세요</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>모국어</label>
            <input
              type="text"
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              placeholder="예: 한국어, 영어, 스페인어..."
            />
          </div>

          <div className="form-row">
            <label>한국어 습득 기간 (개월)</label>
            <input
              type="number"
              min="0"
              value={koreanMonths}
              onChange={(e) => setKoreanMonths(e.target.value)}
              placeholder="예: 24"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="back-button" onClick={() => navigate('/instructions')} disabled={submitting}>
              ← 뒤로가기
            </button>
            <button type="submit" className="next-button" disabled={submitting}>
              {submitting ? '세션 생성 중...' : '시작하기 →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MetaInfoPage;
