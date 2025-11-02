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

// A 세트(기본) 문항: 각 등급 당 1문항
const baseItemsByGrade = /** @type {Record<number, SpeakItem[]>} */({
  1: [
    {
      grade: 1,
      id: 'A-1-01',
      prompt: '고향이 어디입니까?\n무엇이 유명합니까?',
      hints: ['고향 이름', '고향에서 유명한 것(2개)'],
      audio: '/speaking/audio/set1_level1.mp3',   // 문제 읽기 음성
    },
  ],
  2: [
    {
      grade: 2,
      id: 'A-2-01',
      prompt: '이번 방학 때 여행을 가려고 합니다. 어디로 가겠습니까?\n여행을 가기 전에 무엇을 준비하겠습니까?\n여행을 가서 무엇을 하겠습니까? 여행 계획에 대해 이야기하십시오',
      hints: ['여행을 갈 곳', '여행을 가기 전에 할 일', '여행지에서 할 일'],
      audio: '/speaking/audio/set1_level2.mp3',   // 문제 읽기 음성
    },
  ],
  3: [
    {
      grade: 3,
      id: 'A-3-01',
      prompt: '기억에 남는 공연이나 영화, 드라마가 있습니까?\n어떤 이야기이고 어떤 장면이 기억에 남는지 이야기하십시오.',
      hints: ['공연이나 영화, 드라마 제목', '중심 내용', '기억에 남는 장면'],
      audio: '/speaking/audio/set1_level3.mp3',   // 문제 읽기 음성
    },
  ],
  4: [
    {
      grade: 4,
      id: 'A-4-01',
      prompt: '시대적 상황에 따라 직장 생활의 분위기가 달라집니다.\n최근 기술 발달의 변화로 과거와 현재의 근무 환경이 어떻게 달라졌는지 비교하고 어느 쪽을 선호하는지 이야기하십시오.',
      hints: ['과거의 근무 환경', '현재의 근무 환경', '자신이 선호하는 방식'],
      image: '/speaking/images/set1_level4.png',  // 이미지 파일 경로
      audio: '/speaking/audio/set1_level4.mp3',   // 오디오 파일 경로
    },
  ],
  5: [
    {
      grade: 5,
      id: 'A-5-01',
      prompt: '<조기교육>은 지능 발달이 빠른 학령기 이전의 어린이를 대상으로 일정한 교과과정에 따라 실시하는 교육을 말합니다. 예를 들면 6살 이전에 외국어나 수학 교육을 시키는 경우가 이에 해당됩니다. 이러한 교육 방식에 대해 찬성하는지 반대하는지 말하고 그렇게 생각하는 두 가지 근거를 말하십시오.',
      hints: [''],
      image: '/speaking/images/set1_level5.png',
      audio: '/speaking/audio/set1_level5.mp3',
    },
  ],
  6: [
    {
      grade: 6,
      id: 'A-6-01',
      prompt: '최근 한국 사회 전반적으로 출산율이 급속히 하락하면서 저출산 현상이 심각해지고 있습니다.\n저출산 현상의 원인과 문제점은 무엇이고 이를 해결하기 위한 방안으로는 어떤 것이 있는지 자신의 생각을 말하십시오.',
      hints: ['원인 - 결혼관의 변화', '문제점 - 생산 인구 감소', '해결 방안 - 육아 서비스 확충'],
      image: '/speaking/images/set1_level6.png',
      audio: '/speaking/audio/set1_level6.mp3',
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
