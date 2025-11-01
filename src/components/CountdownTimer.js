import React, { useState, useEffect } from 'react';
import './CountdownTimer.css';

/**
 * 카운트다운 타이머 컴포넌트
 * @param {number} seconds - 카운트다운 초
 * @param {Function} onComplete - 타이머 완료 시 호출되는 콜백
 * @param {string} label - 타이머 라벨 (예: '준비시간', '대답시간')
 * @param {boolean} autoStart - 자동 시작 여부
 */
const CountdownTimer = ({ seconds, onComplete, label = '남은 시간', autoStart = true }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(autoStart);

  useEffect(() => {
    setTimeLeft(seconds);
    setIsActive(autoStart);
  }, [seconds, autoStart]);

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsActive(false);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      if (onComplete) {
        onComplete();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const percentage = (timeLeft / seconds) * 100;
  const isWarning = percentage <= 30;
  const isDanger = percentage <= 10;

  return (
    <div className={`countdown-timer ${isWarning ? 'warning' : ''} ${isDanger ? 'danger' : ''}`}>
      <div className="timer-label">{label}</div>
      <div className="timer-display">{formatTime(timeLeft)}</div>
      <div className="timer-bar">
        <div 
          className="timer-progress" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CountdownTimer;
