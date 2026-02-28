// All the TypeScript types mirroring the D1 SQLite schema

export type UserRole = "student" | "teacher" | "parent" | "admin";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type SubjectType =
  | "math"
  | "korean"
  | "spelling"
  | "vocabulary"
  | "hanja"
  | "english"
  | "writing"
  | "general_knowledge"
  | "safety"
  | "science"
  | "social"
  | "creative";

export type QuestionType =
  | "multiple_choice"
  | "fill_blank"
  | "short_answer"
  | "true_false"
  | "matching"
  | "ordering"
  | "drawing"
  | "writing_prompt"
  | "emotion_check"
  | "readiness_check"
  | "calculation"
  | "word_puzzle"
  | "dictation";

export interface Profile {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  avatar_url: string | null;
  grade: number | null;
  semester: number | null;
  school_name: string | null;
  class_name: string | null;
  student_number: number | null;
  parent_id: string | null;
  teacher_id: string | null;
  subscription_plan: string;
  subscription_expires_at: string | null;
  streak_count: number;
  total_points: number;
  approval_status: ApprovalStatus;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  grade: number;
  semester: number;
  school_name: string | null;
  year: number;
  invite_code: string;
  is_active: boolean;
  created_at: string;
}

export interface ClassMember {
  id: string;
  class_id: string;
  student_id: string;
  joined_at: string;
}

export interface CurriculumStandard {
  id: string;
  grade: number;
  semester: number;
  subject: SubjectType;
  standard_code: string;
  description: string;
  unit_name: string | null;
  difficulty: number;
  week_start: number | null;
  week_end: number | null;
  created_at: string;
}

export interface DailySet {
  id: string;
  grade: number;
  semester: number;
  set_number: number;
  title: string;
  description: string | null;
  estimated_minutes: number;
  total_questions: number;
  total_points: number;
  is_published: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  daily_set_id: string;
  curriculum_standard_id: string | null;
  subject: SubjectType;
  question_type: QuestionType;
  order_index: number;
  title: string | null;
  content: any; // JSON
  answer: any; // JSON
  explanation: string | null;
  points: number;
  hint: string | null;
  metadata: any | null;
  created_at: string;
}

export interface LearningRecord {
  id: string;
  student_id: string;
  daily_set_id: string;
  class_id: string | null;
  started_at: string;
  completed_at: string | null;
  total_score: number;
  max_score: number;
  time_spent_seconds: number;
  is_completed: boolean;
  emotion_before: any | null;
  emotion_after: any | null;
  readiness: any | null;
  created_at: string;
}

export interface QuestionResponse {
  id: string;
  learning_record_id: string;
  question_id: string;
  student_answer: any;
  is_correct: boolean | null;
  score: number;
  time_spent_seconds: number;
  attempts: number;
  created_at: string;
}

export interface DailyAssignment {
  id: string;
  class_id: string | null;
  student_id: string | null;
  daily_set_id: string;
  assigned_date: string;
  due_date: string | null;
  is_mandatory: boolean;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number | null;
  rarity: "common" | "rare" | "epic" | "legendary";
  created_at: string;
}

export interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;
  earned_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  price: number;
  payment_method: string | null;
  payment_id: string | null;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  auto_renew: boolean;
  created_at: string;
}
