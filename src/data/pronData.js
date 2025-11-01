// 발음평가용 데이터 (5세트)
// - 각 세트는 단어 10개, 문장 3개(초급/중급/고급), 문단 1개로 구성됩니다.

/**
 * Pronunciation Set 타입
 * @typedef {Object} PronSet
 * @property {string} id        - 세트 식별자 (예: 'A', 'B', 'C', 'D', 'E')
 * @property {string} name      - 세트명 (예: '세트 A')
 * @property {string[]} words   - 단어 10개
 * @property {string[]} sentences - 문장 3개 (초급/중급/고급)
 * @property {string} paragraph - 문단(텍스트)
 */

// 세트 A
const setA = /** @type {PronSet} */({
  id: 'A',
  name: '세트 A',
  words: [
    '아빠',
    '팔',
    '발',
    '김치',
    '빵',
    '학교',
    '편리해요',
    '연락',
    '정류장',
    '빨래',
  ],
  sentences: [
    '저는 한국어를 공부해요.',
    '어제는 친구와 삼겹살을 먹었어요.',
    '대통령 연설은 많은 사람들에게 감동을 주었습니다.',
  ],
  paragraph: `저는 주말마다 케이팝 영상을 봅니다. 어제는 서울 공연장에서 열린 콘서트에 다녀왔습니다. 현장에서 들은 노래와 팬들의 응원 소리는 정말 잊을 수 없는 추억이 되었습니다.`,
});

// 세트 B
const setB = /** @type {PronSet} */({
  id: 'B',
  name: '세트 B',
  words: [
    '집',
    '책',
    '의자',
    '축하',
    '맛집',
    '합리적',
    '악기',
    '번역',
    '국립',
    '찜요리',
  ],
  sentences: [
    '오늘 날씨가 좋아요.',
    '친구가 전화를 해서 급하게 나갔어요.',
    '각국의 문화적 다양성을 존중하는 태도는 국제 사회의 평화와 협력을 위해 필수적입니다.',
  ],
  paragraph: `저는 한국에 온 지 6개월이 되었습니다. 최근에는 한류 드라마에 빠져서 밤늦게까지 시청합니다. 대사 속 빠른 대화와 억양을 듣다 보니, 발음도 조금씩 자연스러워지고 있습니다.`,
});

// 세트 C
const setC = /** @type {PronSet} */({
  id: 'C',
  name: '세트 C',
  words: [
    '산',
    '쓸모',
    '빨리',
    '여덟시',
    '설날',
    '옛날',
    '협력',
    '직접',
    '독립',
    '연락',
  ],
  sentences: [
    '저는 주말에 산에 갑니다.',
    '설날에는 가족이 모여 떡국을 먹습니다.',
    '양국은 문화 교류를 통한 협력 방안을 논의했습니다.',
  ],
  paragraph: `지난주에 친구와 함께 서울 여행을 다녀왔습니다. 경복궁과 명동을 걸으며 사진도 많이 찍었습니다. 특히 한 카페에서 마신 전통차가 인상 깊었습니다.`,
});

// 세트 D
const setD = /** @type {PronSet} */({
  id: 'D',
  name: '세트 D',
  words: [
    '고등어',
    '옷',
    '꽃',
    '콧등',
    '여덟',
    '연락',
    '맛집',
    '합창',
    '번역',
    '녋혀요',
  ],
  sentences: [
    '봄에는 꽃이 예쁩니다.',
    '저는 하루에 여덟 시간 공부합니다.',
    '그 영화는 사회 문제를 깊이 있게 다루어 많은 사람들의 공감을 얻었습니다.',
  ],
  paragraph: `이번 주말에 유명한 맛집에 가려고 합니다. 그곳은 드라마 촬영지로도 잘 알려져 있습니다. 배우들이 실제로 앉았던 자리를 직접 볼 수 있다고 해서 기대가 큽니다.`,
});

// 세트 E
const setE = /** @type {PronSet} */({
  id: 'E',
  name: '세트 E',
  words: [
    '지팡이',
    '호빵',
    '전화',
    '낱낱이',
    '정류장',
    '문지방',
    '협력',
    '직접',
    '신라',
    '기막히게',
  ],
  sentences: [
    '저는 아침에 빵을 먹습니다.',
    '버스를 타려면 정류장으로 가야 합니다.',
    '그 공연은 전통 악기와 현대 음악의 협연으로 큰 호응을 얻었습니다.',
  ],
  paragraph: `제가 좋아하는 아이돌 그룹이 새 앨범을 발표했습니다. 이번에는 전통 악기를 활용한 곡이 포함되어 있습니다. 음악 방송 무대에서 이를 직접 듣고 보니 더욱 감동적이었습니다.`,
});

export const pronSets = /** @type {PronSet[]} */([
  setA,
  setB,
  setC,
  setD,
  setE,
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
