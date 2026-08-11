// 문항 중복 방지용 시그니처.
//
// 이 함수는 daily-set-generator.ts 안에 있었는데, local-storage.ts 가 그것만
// 쓰려고 생성기를 import 하는 바람에 **전 학년 커리큘럼 데이터(수만 줄)** 가
// local-storage 를 쓰는 모든 페이지(학부모·교사·관리자 포함)의 번들로 딸려
// 들어갔다. 문항 데이터가 전혀 필요 없는 화면까지 849KB(gzip)를 받게 되므로
// 의존성이 없는 이 파일로 분리한다.

import type { Question } from "@/types/database";

/** 시그니처를 만들지 않는(=중복 출제를 허용하는) 문항 타입 */
const NON_REPEATABLE_QUESTION_TYPES = new Set([
  "multiple_choice",
  "fill_blank",
  "short_answer",
  "true_false",
  "matching",
  "ordering",
  "drawing",
  "calculation",
  "word_puzzle",
  "dictation",
]);

/**
 * 같은 문항인지 판별하는 시그니처. 중복 방지 대상이 아니면 null.
 */
export function getQuestionSignature(question: Question): string | null {
  if (!NON_REPEATABLE_QUESTION_TYPES.has(question.question_type)) {
    return null;
  }

  return JSON.stringify({
    subject: question.subject,
    question_type: question.question_type,
    content: question.content,
    answer: question.answer,
  });
}

export { NON_REPEATABLE_QUESTION_TYPES };
