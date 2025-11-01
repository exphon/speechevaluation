// 말하기 평가 데이터 (1~6등급, 멀티 세트 지원)
// - 등급별 과제 유형과 준비/대답 시간을 정의합니다.
// - 발음 평가처럼 여러 세트로 구성되며, 참가자에게 균등하게 분배할 수 있도록 헬퍼를 제공합니다.

/**
 * @typedef {Object} SpeakItem
 * @property {number} grade         - 1~6 등급
 * @property {string} id            - 문항 식별자 (세트+등급+번호)
 * @property {string} prompt        - 질문/주제 텍스트
 * @property {string[]} [hints]     - 답변 가이드 힌트
 */

/**
 * @typedef {Object} SpeakSet
 * @property {string} id                     - 세트 식별자 (예: 'A')
 * @property {string} name                   - 세트명
 * @property {Record<number, SpeakItem[]>} itemsByGrade - 등급별 문항 목록
 */

// 등급별 메타(과제 유형/시간)
export const gradeMeta = {
  1: { type: '주제 소개하기', prepSec: 20, answerSec: 50 },
  2: { type: '계획 서술하기', prepSec: 30, answerSec: 60 },
  3: { type: '경험 서술하기', prepSec: 40, answerSec: 80 },
  4: { type: '사회적 변화 비교·대조', prepSec: 50, answerSec: 120 },
  5: { type: '사회 문제 의견 제시', prepSec: 60, answerSec: 150 },
  6: { type: '사회 문제 원인/해결 제시', prepSec: 70, answerSec: 180 },
};

// A 세트(기본) 문항: 각 등급 당 1문항 (플레이스홀더)
const baseItemsByGrade = /** @type {Record<number, SpeakItem[]>} */({
  1: [
    {
      grade: 1,
      id: 'A-1-01',
      prompt: '자신이 좋아하는 계절을 소개하고, 그 이유를 설명하세요.',
      hints: ['계절의 특징', '개인적 경험', '이 계절에 하는 활동'],
    },
  ],
  2: [
    {
      grade: 2,
      id: 'A-2-01',
      prompt: '이번 주말 또는 다음 주에 계획하고 있는 일정을 설명하세요.',
      hints: ['언제/어디서', '무엇을/왜', '준비해야 할 것'],
    },
  ],
  3: [
    {
      grade: 3,
      id: 'A-3-01',
      prompt: '최근에 기억에 남는 여행 또는 특별한 경험에 대해 이야기하세요.',
      hints: ['언제/어디서', '누구와', '무슨 일이 있었는지', '느낀 점'],
    },
  ],
  4: [
    {
      grade: 4,
      id: 'A-4-01',
      prompt: '온라인 쇼핑과 오프라인 쇼핑을 비교하여 각각의 장단점을 말해보세요.',
      hints: ['편의성', '가격/품질', '경험/안전'],
    },
  ],
  5: [
    {
      grade: 5,
      id: 'A-5-01',
      prompt: '지역 사회의 쓰레기 문제 해결을 위해 어떤 정책이 필요한지 의견을 말해보세요.',
      hints: ['문제의 현황', '구체적 대안', '기대 효과', '우려 사항'],
    },
  ],
  6: [
    {
      grade: 6,
      id: 'A-6-01',
      prompt: '출산율 저하의 원인을 설명하고, 실질적인 해결 방안을 제시하세요.',
      hints: ['원인 분석', '단기/장기 대책', '현실적 실행 가능성'],
    },
  ],
});

// 안정적인 해시 함수 (문항/세트 분배 용)
function stableHash(input) {
  const str = String(input ?? '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
}

// A 세트를 다른 세트로 복제할 때 ID 접두어만 변경
function cloneItemsForSet(setId, src) {
  const cloned = {};
  for (const grade of Object.keys(src)) {
    const g = Number(grade);
    cloned[g] = src[g].map((it, idx) => ({
      ...it,
      grade: g,
      id: `${setId}-${g}-${String(idx + 1).padStart(2, '0')}`,
    }));
  }
  return cloned;
}

// 현재는 A~E 동일 콘텐츠. 추후 세트별로 실제 문항만 교체하면 됨.
export const speakSets = /** @type {SpeakSet[]} */([
  { id: 'A', name: '세트 A', itemsByGrade: baseItemsByGrade },
  { id: 'B', name: '세트 B', itemsByGrade: cloneItemsForSet('B', baseItemsByGrade) },
  { id: 'C', name: '세트 C', itemsByGrade: cloneItemsForSet('C', baseItemsByGrade) },
  { id: 'D', name: '세트 D', itemsByGrade: cloneItemsForSet('D', baseItemsByGrade) },
  { id: 'E', name: '세트 E', itemsByGrade: cloneItemsForSet('E', baseItemsByGrade) },
]);

export function getAssignedSpeakSet(participantId) {
  if (!speakSets.length) {
    throw new Error('No speaking sets are configured');
  }
  const idx = stableHash(participantId) % speakSets.length;
  return speakSets[idx];
}

export function getSpeakSetById(id) {
  return speakSets.find((s) => s.id === id);
}

export function getDefaultSpeakSet() {
  return speakSets[0];
}

// 발음 수준에 따른 등급 매핑
export function getGradesForPronLevel(pronunciationLevel) {
  // 허용: '하' | '중' | '상' (대소문자 무시)
  const lv = String(pronunciationLevel || '').trim();
  if (lv === '하') return [1, 2, 3];
  if (lv === '중') return [3, 4, 5];
  if (lv === '상') return [4, 5, 6];
  // 기본값: 안전하게 1,2,3
  return [1, 2, 3];
}

/**
 * 발음 수준(하/중/상)과 참가자ID를 받아, 해당 참가자에게 할당된 세트에서
 * 각 등급(3개)별로 문항 1개씩을 결정하여 반환합니다.
 * - 세트 내에 등급별 문항이 여러 개라면 참가자ID로 균등 분배됩니다.
 * - 반환 항목에는 등급 메타(유형/시간)도 포함됩니다.
 * @param {'하'|'중'|'상'} pronunciationLevel
 * @param {string|number} [participantId]
 * @param {string} [setId] 특정 세트를 강제 지정하고 싶을 때 (없으면 participantId 기반 분배)
 */
export function getSpeakingQuestionsForLevel(pronunciationLevel, participantId, setId) {
  const grades = getGradesForPronLevel(pronunciationLevel);
  const set = setId ? (getSpeakSetById(setId) || getDefaultSpeakSet()) : (participantId != null ? getAssignedSpeakSet(participantId) : getDefaultSpeakSet());
  const seed = participantId != null ? String(participantId) : `${set.id}-seed`;

  const selected = [];
  for (const g of grades) {
    const items = set.itemsByGrade[g] || [];
    if (!items.length) continue; // 해당 등급 문항이 비어있을 경우 건너뜀

    const idx = items.length > 1 ? (stableHash(`${seed}-${g}`) % items.length) : 0;
    const item = items[idx];
    const meta = gradeMeta[g];
    selected.push({
      setId: set.id,
      setName: set.name,
      grade: g,
      type: meta?.type,
      prepSec: meta?.prepSec,
      answerSec: meta?.answerSec,
      item,
    });
  }
  return selected;
}
