// Cloudflare Pages Function: GET /api/daily-set?grade=1&semester=1&day=42
// Returns the daily set with questions for the given grade/semester/day

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const grade = parseInt(url.searchParams.get('grade') || '0', 10);
    const semester = parseInt(url.searchParams.get('semester') || '1', 10);
    const dayParam = url.searchParams.get('day');

    if (!grade || grade < 1 || grade > 6) {
      return jsonResponse({ message: '올바른 학년을 지정해주세요. (1~6)' }, 400);
    }

    if (semester !== 1 && semester !== 2) {
      return jsonResponse({ message: '올바른 학기를 지정해주세요. (1 또는 2)' }, 400);
    }

    // Calculate which set number to use based on day of year
    const dayOfYear = dayParam ? parseInt(dayParam, 10) : getDayOfYear();

    // Find a published daily set for this grade/semester
    // Use modular arithmetic so we cycle through available sets
    const setCountResult = await context.env.DB.prepare(
      'SELECT COUNT(*) as count FROM daily_sets WHERE grade = ? AND semester = ? AND is_published = 1'
    ).bind(grade, semester).first<{ count: number }>();

    const totalSets = setCountResult?.count || 0;

    if (totalSets === 0) {
      return jsonResponse({
        message: '해당 학년/학기의 학습 세트가 아직 준비되지 않았습니다.',
        set: null,
        questions: [],
      });
    }

    // Determine which set to use (1-indexed)
    const setNumber = ((dayOfYear - 1) % totalSets) + 1;

    // Fetch the daily set
    const dailySet = await context.env.DB.prepare(
      'SELECT * FROM daily_sets WHERE grade = ? AND semester = ? AND set_number = ? AND is_published = 1'
    ).bind(grade, semester, setNumber).first();

    if (!dailySet) {
      return jsonResponse({
        message: '오늘의 학습 세트를 찾을 수 없습니다.',
        set: null,
        questions: [],
      });
    }

    // Fetch all questions for this set, ordered by order_index
    const questionsResult = await context.env.DB.prepare(
      'SELECT * FROM questions WHERE daily_set_id = ? ORDER BY order_index ASC'
    ).bind(dailySet.id).all();

    const questions = (questionsResult.results || []).map((q: any) => ({
      ...q,
      content: tryParseJson(q.content),
      answer: tryParseJson(q.answer),
      metadata: tryParseJson(q.metadata),
    }));

    // Check if the authenticated user already has a record for this set
    const userId = (context as any).userId;
    let record = null;
    if (userId) {
      record = await context.env.DB.prepare(
        'SELECT * FROM learning_records WHERE student_id = ? AND daily_set_id = ?'
      ).bind(userId, dailySet.id).first();

      if (record) {
        record = {
          ...record,
          emotion_before: tryParseJson((record as any).emotion_before),
          emotion_after: tryParseJson((record as any).emotion_after),
          readiness: tryParseJson((record as any).readiness),
        };
      }
    }

    return jsonResponse({
      set: dailySet,
      questions,
      record,
    });
  } catch (err: any) {
    return jsonResponse({ message: err.message || '학습 세트 조회 중 오류가 발생했습니다.' }, 500);
  }
};

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function tryParseJson(val: unknown): unknown {
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
