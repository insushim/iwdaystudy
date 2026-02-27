// Cloudflare Pages Function: POST /api/generate
// AI question generation using Anthropic Claude API
// Generates a complete daily set of questions for a given grade/semester

interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
}

interface GenerateBody {
  grade: number;
  semester: number;
  set_number?: number;
  subjects?: string[];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const userId = (context as any).userId;
    if (!userId) {
      return jsonResponse({ message: '인증이 필요합니다.' }, 401);
    }

    // Verify user is teacher or admin
    const profile = await context.env.DB.prepare(
      'SELECT role FROM profiles WHERE id = ?'
    ).bind(userId).first<{ role: string }>();

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
      return jsonResponse({ message: '교사 또는 관리자만 문제를 생성할 수 있습니다.' }, 403);
    }

    const body = await context.request.json() as GenerateBody;
    const { grade, semester, subjects } = body;

    if (!grade || grade < 1 || grade > 6 || !semester) {
      return jsonResponse({ message: '올바른 학년/학기를 지정해주세요.' }, 400);
    }

    const apiKey = context.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return jsonResponse({ message: 'AI API 키가 설정되지 않았습니다.' }, 500);
    }

    // Determine the next set number
    const lastSet = await context.env.DB.prepare(
      'SELECT MAX(set_number) as max_num FROM daily_sets WHERE grade = ? AND semester = ?'
    ).bind(grade, semester).first<{ max_num: number | null }>();
    const setNumber = body.set_number ?? ((lastSet?.max_num || 0) + 1);

    // Determine grade group for question composition
    const gradeGroup = grade <= 2 ? '1-2' : grade <= 4 ? '3-4' : '5-6';
    const composition = getComposition(gradeGroup, subjects);

    // Build the prompt for Claude
    const prompt = buildPrompt(grade, semester, gradeGroup, composition);

    // Call Anthropic Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      return jsonResponse({ message: `AI API 오류: ${claudeResponse.status}`, detail: errText }, 502);
    }

    const claudeData = await claudeResponse.json() as any;
    const aiText = claudeData.content?.[0]?.text || '';

    // Parse the AI response as JSON
    let generatedQuestions: any[];
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiText.match(/```json\s*([\s\S]*?)\s*```/) || aiText.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiText;
      generatedQuestions = JSON.parse(jsonStr);
    } catch {
      return jsonResponse({
        message: 'AI가 생성한 데이터를 파싱할 수 없습니다.',
        raw: aiText,
      }, 500);
    }

    // Create the daily set in D1
    const setId = crypto.randomUUID();
    const totalQuestions = generatedQuestions.length;
    const totalPoints = generatedQuestions.reduce((sum: number, q: any) => sum + (q.points || 10), 0);
    const now = new Date().toISOString();

    await context.env.DB.prepare(
      `INSERT INTO daily_sets (id, grade, semester, set_number, title, description, estimated_minutes, total_questions, total_points, is_published, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
    ).bind(
      setId, grade, semester, setNumber,
      `${grade}학년 ${semester}학기 ${setNumber}일차`,
      `AI 생성 학습 세트 (${gradeGroup}학년군)`,
      30, totalQuestions, totalPoints, now
    ).run();

    // Insert questions
    const questionStmts = generatedQuestions.map((q: any, idx: number) => {
      const qId = crypto.randomUUID();
      return context.env.DB.prepare(
        `INSERT INTO questions (id, daily_set_id, curriculum_standard_id, subject, question_type, order_index, title, content, answer, explanation, points, hint, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        qId, setId, q.curriculum_standard_id ?? null,
        q.subject, q.question_type, idx,
        q.title ?? null,
        JSON.stringify(q.content),
        JSON.stringify(q.answer),
        q.explanation ?? null,
        q.points ?? 10,
        q.hint ?? null,
        q.metadata ? JSON.stringify(q.metadata) : null,
        now
      );
    });

    if (questionStmts.length > 0) {
      await context.env.DB.batch(questionStmts);
    }

    return jsonResponse({
      set_id: setId,
      set_number: setNumber,
      total_questions: totalQuestions,
      total_points: totalPoints,
      questions: generatedQuestions,
    }, 201);
  } catch (err: any) {
    return jsonResponse({ message: err.message || '문제 생성 중 오류가 발생했습니다.' }, 500);
  }
};

interface SectionDef {
  subject: string;
  title: string;
  count: number;
}

function getComposition(gradeGroup: string, filterSubjects?: string[]): SectionDef[] {
  const compositions: Record<string, SectionDef[]> = {
    '1-2': [
      { subject: 'emotion_check', title: '오늘의 기분 체크', count: 1 },
      { subject: 'readiness_check', title: '준비물 확인', count: 1 },
      { subject: 'math', title: '오늘의 수놀이', count: 2 },
      { subject: 'writing', title: '오늘의 글밥', count: 1 },
      { subject: 'spelling', title: '오늘의 맞춤법', count: 1 },
      { subject: 'vocabulary', title: '오늘의 한글놀이', count: 1 },
      { subject: 'creative', title: '오늘의 그리기', count: 1 },
      { subject: 'korean', title: '마음 읽기', count: 1 },
      { subject: 'general_knowledge', title: '상식 퀴즈', count: 1 },
    ],
    '3-4': [
      { subject: 'emotion_check', title: '오늘의 기분 체크', count: 1 },
      { subject: 'readiness_check', title: '준비물 확인', count: 1 },
      { subject: 'math', title: '오늘의 수놀이', count: 2 },
      { subject: 'writing', title: '오늘의 글밥', count: 1 },
      { subject: 'spelling', title: '오늘의 맞춤법', count: 1 },
      { subject: 'vocabulary', title: '오늘의 어휘', count: 1 },
      { subject: 'hanja', title: '오늘의 한자', count: 1 },
      { subject: 'english', title: '오늘의 English', count: 1 },
      { subject: 'creative', title: '대칭 그리기', count: 1 },
      { subject: 'general_knowledge', title: '상식 퀴즈', count: 1 },
      { subject: 'safety', title: '안전 퀴즈', count: 1 },
    ],
    '5-6': [
      { subject: 'emotion_check', title: '오늘의 기분 체크', count: 1 },
      { subject: 'readiness_check', title: '준비물 확인', count: 1 },
      { subject: 'math', title: '오늘의 수놀이', count: 2 },
      { subject: 'writing', title: '오늘의 글밥', count: 1 },
      { subject: 'spelling', title: '오늘의 맞춤법', count: 1 },
      { subject: 'vocabulary', title: '오늘의 어휘', count: 1 },
      { subject: 'hanja', title: '오늘의 한자', count: 1 },
      { subject: 'english', title: '오늘의 English', count: 1 },
      { subject: 'science', title: '오늘의 과학', count: 1 },
      { subject: 'social', title: '오늘의 사회', count: 1 },
      { subject: 'creative', title: '대칭/도형 그리기', count: 1 },
      { subject: 'safety', title: '안전/건강 퀴즈', count: 1 },
    ],
  };

  let sections = compositions[gradeGroup] || compositions['1-2'];
  if (filterSubjects && filterSubjects.length > 0) {
    sections = sections.filter(
      (s) => filterSubjects.includes(s.subject) || s.subject === 'emotion_check' || s.subject === 'readiness_check'
    );
  }
  return sections;
}

function buildPrompt(grade: number, semester: number, gradeGroup: string, composition: SectionDef[]): string {
  // Filter out non-AI subjects (emotion/readiness are handled client-side)
  const aiSections = composition.filter(
    (s) => s.subject !== 'emotion_check' && s.subject !== 'readiness_check'
  );

  const subjectRequirements = aiSections.map(
    (s) => `- ${s.subject} (${s.title}): ${s.count}문제`
  ).join('\n');

  return `당신은 초등학교 ${grade}학년 ${semester}학기 학생을 위한 일일 학습 문제를 만드는 전문 교육 콘텐츠 생성자입니다.
2022 개정 교육과정 기반으로 아래 과목별 문제를 JSON 배열로 생성해주세요.

## 과목별 문제 수
${subjectRequirements}

## 과목별 출제 가이드

### math (수학)
- ${grade}학년 ${semester}학기 교과 범위 내 계산 문제
- question_type: "calculation" 또는 "multiple_choice"
- content: { text: "문제 텍스트", expression?: "수식" }
- answer: { value: 정답숫자, explanation: "풀이" }

### spelling (맞춤법)
- 두 문장 중 올바른 맞춤법 고르기
- question_type: "multiple_choice"
- content: { text: "올바른 문장을 고르세요", options: ["문장A", "문장B"] }
- answer: { value: 0또는1, explanation: "설명" }

### vocabulary (어휘)
- 뜻풀이를 보고 낱말 맞추기
- question_type: "short_answer"
- content: { text: "뜻풀이", hints: ["힌트1", "힌트2"] }
- answer: { value: "정답단어", explanation: "설명" }

### hanja (한자) - 3학년 이상
- 한자의 음과 뜻을 알려주고 관련 문제
- question_type: "multiple_choice"
- content: { text: "문제", character: "漢", options: ["선택1", "선택2", "선택3", "선택4"] }
- answer: { value: 정답인덱스, explanation: "설명" }

### english (영어) - 3학년 이상
- 간단한 영어 문장/단어 문제
- question_type: "multiple_choice" 또는 "short_answer"
- content: { text: "문제", sentence?: "영어문장" }
- answer: { value: "정답", explanation: "설명" }

### writing (글쓰기)
- 짧은 글쓰기 프롬프트
- question_type: "writing_prompt"
- content: { text: "글쓰기 주제", minLength: 20 }
- answer: { value: null, explanation: "예시 답안 또는 가이드" }

### general_knowledge (상식)
- 빈칸 채우기 상식 퀴즈
- question_type: "fill_blank"
- content: { text: "___가 포함된 문장" }
- answer: { value: "정답", explanation: "설명" }

### safety (안전) - 3학년 이상
- 안전 관련 퀴즈
- question_type: "fill_blank" 또는 "multiple_choice"
- content: { text: "문제" }
- answer: { value: "정답", explanation: "설명" }

### science (과학) - 5학년 이상
- 교과 기반 과학 문제
- question_type: "multiple_choice"
- content: { text: "문제", options: ["A", "B", "C", "D"] }
- answer: { value: 정답인덱스, explanation: "설명" }

### social (사회) - 5학년 이상
- 교과 기반 사회 문제
- question_type: "multiple_choice"
- content: { text: "문제", options: ["A", "B", "C", "D"] }
- answer: { value: 정답인덱스, explanation: "설명" }

### creative (창의)
- 그리기/만들기 과제 설명
- question_type: "drawing"
- content: { text: "과제 설명", guide_image?: null }
- answer: { value: null, explanation: "참고 가이드" }

## 출력 형식
각 문제를 아래 형태의 JSON 객체로, 전체를 JSON 배열로 감싸서 출력하세요.
\`\`\`json
[
  {
    "subject": "math",
    "question_type": "calculation",
    "title": "문제 제목",
    "content": { ... },
    "answer": { ... },
    "explanation": "해설",
    "points": 10,
    "hint": "힌트 (선택)"
  }
]
\`\`\`

주의사항:
- ${grade}학년 ${semester}학기 수준에 적합한 난이도
- 한국 초등학교 교육과정 (2022 개정) 기준
- 모든 텍스트는 한국어 (영어 문제 제외)
- JSON만 출력. 추가 설명 불필요.
- 문제 순서는 위 과목 순서대로`;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
