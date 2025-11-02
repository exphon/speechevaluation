/**
 * Levenshtein Distance 계산 및 발음 정확도 평가
 */

/**
 * Levenshtein Distance 계산
 * 두 문자열 간의 최소 편집 거리를 계산합니다.
 * @param {string} str1 - 첫 번째 문자열
 * @param {string} str2 - 두 번째 문자열
 * @returns {number} - 편집 거리
 */
export function calculateLevenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // DP 테이블 초기화
  const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  // 첫 번째 행과 열 초기화
  for (let i = 0; i <= len1; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
  }
  
  // DP 테이블 채우기
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // 삭제
          dp[i][j - 1] + 1,      // 삽입
          dp[i - 1][j - 1] + 1   // 대체
        );
      }
    }
  }
  
  return dp[len1][len2];
}

/**
 * 텍스트 전처리 (공백, 구두점 제거)
 * @param {string} text - 원본 텍스트
 * @returns {string} - 전처리된 텍스트
 */
export function normalizeText(text) {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, '') // 공백 제거
    .replace(/[.,!?;:()]/g, '') // 구두점 제거
    .toLowerCase() // 소문자 변환 (영어가 섞인 경우)
    .trim();
}

/**
 * 정확도 점수 계산 (0-100)
 * @param {string} original - 원본 텍스트
 * @param {string} transcribed - 전사된 텍스트
 * @returns {number} - 정확도 점수 (0-100)
 */
export function calculateAccuracy(original, transcribed) {
  const normalizedOriginal = normalizeText(original);
  const normalizedTranscribed = normalizeText(transcribed);
  
  if (!normalizedOriginal || !normalizedTranscribed) {
    return 0;
  }
  
  const distance = calculateLevenshteinDistance(normalizedOriginal, normalizedTranscribed);
  const maxLength = Math.max(normalizedOriginal.length, normalizedTranscribed.length);
  
  if (maxLength === 0) return 0;
  
  // 정확도 = (1 - (거리 / 최대길이)) * 100
  const accuracy = ((1 - distance / maxLength) * 100);
  
  return Math.max(0, Math.min(100, accuracy)); // 0-100 범위로 제한
}

/**
 * 점수를 등급으로 변환 (상/중/하)
 * @param {number} score - 점수 (0-100)
 * @returns {string} - 등급 ('상', '중', '하')
 */
export function getGradeFromScore(score) {
  if (score >= 80) return '상';
  if (score >= 60) return '중';
  return '하';
}

/**
 * 등급에 따른 색상 반환
 * @param {string} grade - 등급 ('상', '중', '하')
 * @returns {string} - CSS 색상
 */
export function getGradeColor(grade) {
  switch (grade) {
    case '상':
      return '#4caf50'; // 녹색
    case '중':
      return '#ff9800'; // 주황색
    case '하':
      return '#f44336'; // 빨간색
    default:
      return '#999';
  }
}

/**
 * 전체 평가 결과 계산
 * @param {string} original - 원본 텍스트
 * @param {string} transcribed - 전사된 텍스트
 * @returns {Object} - { score, grade, distance, accuracy }
 */
export function evaluatePronunciation(original, transcribed) {
  const normalizedOriginal = normalizeText(original);
  const normalizedTranscribed = normalizeText(transcribed);
  const distance = calculateLevenshteinDistance(normalizedOriginal, normalizedTranscribed);
  const accuracy = calculateAccuracy(original, transcribed);
  const grade = getGradeFromScore(accuracy);
  
  return {
    score: Math.round(accuracy * 10) / 10, // 소수점 1자리
    grade,
    distance,
    accuracy,
    normalizedOriginal,
    normalizedTranscribed,
  };
}
