// 발음평가용 데이터 (멀티 세트 지원)
// - 현재는 기본 세트 1개만 원본 콘텐츠로 구성되어 있으며,
//   동일한 콘텐츠를 복제한 예비 세트들을 포함하여 총 5세트 구조로 제공됩니다.
// - 추후 실제 세트별 문항으로 교체만 하면 됩니다.

/**
 * Pronunciation Set 타입
 * @typedef {Object} PronSet
 * @property {string} id        - 세트 식별자 (예: 'A', 'B', 'C')
 * @property {string} name      - 세트명 (예: '세트 A')
 * @property {string[]} words   - 단어 10개
 * @property {string[]} sentences - 문장 배열
 * @property {string} paragraph - 문단(텍스트)
 */

// 원본 테스트 데이터 (세트 A)
const baseSet = /** @type {PronSet} */({
  id: 'A',
  name: '세트 A',
  words: [
    '사과',
    '컴퓨터',
    '음악',
    '학교',
    '친구',
    '가족',
    '여행',
    '책',
    '운동',
    '영화',
  ],
  sentences: [
    '오늘 날씨가 정말 좋습니다.',
    '저는 매일 아침 운동을 합니다.',
    '주말에 친구들과 영화를 보러 갑니다.',
  ],
  paragraph: `
한국의 전통 음식은 매우 다양하고 건강에 좋습니다. 
김치는 가장 대표적인 한국 음식으로, 발효 과정을 거쳐 만들어집니다. 
비빔밥은 여러 가지 채소와 고기를 밥 위에 올려 고추장과 함께 비벼 먹는 음식입니다. 
`,
});

// 현재는 동일 콘텐츠 복제 세트로 5개 구성 (A~E)
// 추후 실제 세트별 다른 콘텐츠로 교체만 하면 됩니다.
export const pronSets = /** @type {PronSet[]} */([
  baseSet,
  { ...baseSet, id: 'B', name: '세트 B' },
  { ...baseSet, id: 'C', name: '세트 C' },
  { ...baseSet, id: 'D', name: '세트 D' },
  { ...baseSet, id: 'E', name: '세트 E' },
]);

// 안정적인 해시 함수 (ID 문자열 기반 분배)
function stableHash(input) {
  const str = String(input ?? '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
}

/**
 * 참가자의 ID(또는 세션ID)를 기반으로 세트를 균등 분배합니다.
 * pronSets 길이에 따라 자동 분배되며, 세트 수가 바뀌어도 동작합니다.
 * @param {string|number} participantId
 * @returns {PronSet}
 */
export function getAssignedPronSet(participantId) {
  if (!pronSets.length) {
    throw new Error('No pronunciation sets are configured');
  }
  const idx = stableHash(participantId) % pronSets.length;
  return pronSets[idx];
}

/**
 * 세트 ID로 세트를 조회합니다. 없으면 undefined.
 * @param {string} id
 * @returns {PronSet|undefined}
 */
export function getPronSetById(id) {
  return pronSets.find((s) => s.id === id);
}

// 현재 페이지들 호환을 위해 기본 세트의 항목을 동일 이름으로 export
const defaultSet = pronSets[0];
export const words = defaultSet.words;
export const sentences = defaultSet.sentences;
export const paragraph = defaultSet.paragraph;

// 필요 시 기본 세트를 직접 가져가고 싶을 때 사용
export function getDefaultPronSet() {
  return defaultSet;
}
