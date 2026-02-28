"use client";

// localStorage-based auth for static/offline mode
// Since this is a Next.js static export (output: "export"), we cannot use
// real API routes during development. This module provides a complete
// auth system backed by localStorage.

import { generateId } from "./utils";
import type { Profile, ApprovalStatus } from "@/types/database";

const USERS_KEY = "araharu_users";
const CURRENT_USER_KEY = "araharu_current_user";
const TOKEN_KEY = "auth_token";

// ---------- Internal Helpers ----------

function getStoredUsers(): (Profile & { password_hash: string })[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(USERS_KEY);
    const users = data ? JSON.parse(data) : [];
    // Migration: add approval_status for legacy users
    return users.map((u: any) => ({
      ...u,
      approval_status: u.approval_status || "approved",
    }));
  } catch {
    return [];
  }
}

function saveStoredUsers(users: (Profile & { password_hash: string })[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function createToken(userId: string): string {
  return btoa(
    JSON.stringify({
      id: userId,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }),
  );
}

function stripPasswordHash(user: Profile & { password_hash: string }): Profile {
  const { password_hash, ...safe } = user;
  return safe as Profile;
}

// ---------- Public API ----------

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role: "student" | "teacher" | "parent";
  grade?: number;
  semester?: number;
  school_name?: string;
}

export interface AuthResult {
  user: Profile;
  token: string;
}

/**
 * Get all registered users (profiles without password hashes).
 */
export function getUsers(): Profile[] {
  return getStoredUsers().map(stripPasswordHash);
}

/**
 * Register a new user with localStorage persistence.
 * Throws if the email is already registered.
 * Teachers get approval_status: 'pending', others get 'approved'.
 */
export function localSignup(data: SignupData): AuthResult {
  const users = getStoredUsers();

  if (users.find((u) => u.email === data.email)) {
    throw new Error("이미 등록된 이메일입니다.");
  }

  if (!data.email || !data.password || !data.name || !data.role) {
    throw new Error("필수 항목을 모두 입력해주세요.");
  }

  if (data.password.length < 4) {
    throw new Error("비밀번호는 최소 4자 이상이어야 합니다.");
  }

  const approvalStatus: ApprovalStatus =
    data.role === "teacher" ? "pending" : "approved";

  const now = new Date().toISOString();
  const newUser: Profile & { password_hash: string } = {
    id: generateId(),
    email: data.email,
    name: data.name,
    role: data.role,
    avatar_url: null,
    grade: data.grade ?? null,
    semester: data.semester ?? 1,
    school_name: data.school_name ?? null,
    class_name: null,
    student_number: null,
    parent_id: null,
    teacher_id: null,
    subscription_plan: "free",
    subscription_expires_at: null,
    streak_count: 0,
    total_points: 0,
    approval_status: approvalStatus,
    password_hash: simpleHash(data.password),
    created_at: now,
    updated_at: now,
  };

  users.push(newUser);
  saveStoredUsers(users);

  // For pending teachers, don't set current user (they can't use the app yet)
  if (approvalStatus === "pending") {
    const token = createToken(newUser.id);
    const safeUser = stripPasswordHash(newUser);
    return { user: safeUser, token };
  }

  const token = createToken(newUser.id);
  const safeUser = stripPasswordHash(newUser);

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  localStorage.setItem(TOKEN_KEY, token);

  return { user: safeUser, token };
}

/**
 * Log in an existing user.
 * Throws if email/password do not match or if teacher is not approved.
 */
export function localLogin(email: string, password: string): AuthResult {
  const users = getStoredUsers();
  const user = users.find((u) => u.email === email);

  if (!user || user.password_hash !== simpleHash(password)) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  // Block pending/rejected teachers
  if (user.role === "teacher" && user.approval_status === "pending") {
    throw new Error(
      "승인 대기 중인 계정입니다. 관리자 승인 후 로그인할 수 있습니다.",
    );
  }
  if (user.role === "teacher" && user.approval_status === "rejected") {
    throw new Error("승인이 거절된 계정입니다. 관리자에게 문의해주세요.");
  }

  const token = createToken(user.id);
  const safeUser = stripPasswordHash(user);

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  localStorage.setItem(TOKEN_KEY, token);

  return { user: safeUser, token };
}

/**
 * Get the currently signed-in user from localStorage.
 * Returns null if not signed in or token is expired.
 */
export function localGetCurrentUser(): Profile | null {
  if (typeof window === "undefined") return null;

  try {
    const tokenStr = localStorage.getItem(TOKEN_KEY);
    if (tokenStr) {
      const tokenData = JSON.parse(atob(tokenStr));
      if (tokenData.exp < Date.now()) {
        // Token expired - clean up
        localLogout();
        return null;
      }
    }

    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;
    const user = JSON.parse(data);
    // Migration: ensure approval_status exists
    if (!user.approval_status) user.approval_status = "approved";
    return user;
  } catch {
    return null;
  }
}

/**
 * Sign out the current user.
 */
export function localLogout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Update the current user's profile fields.
 * Persists changes to both the users list and current user cache.
 */
export function localUpdateProfile(
  userId: string,
  updates: Partial<Profile>,
): Profile {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("사용자를 찾을 수 없습니다.");

  const updatedUser = {
    ...users[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Don't allow overwriting sensitive fields through this function
  updatedUser.id = users[idx].id;
  updatedUser.password_hash = users[idx].password_hash;

  users[idx] = updatedUser;
  saveStoredUsers(users);

  const safeUser = stripPasswordHash(updatedUser);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

  return safeUser;
}

/**
 * Check if the environment should use local auth (i.e. static export / development).
 * Returns true when there is no real API server to connect to.
 */
export function shouldUseLocalAuth(): boolean {
  if (typeof window === "undefined") return false;
  // In static export mode, API routes won't work, so always use local auth.
  // This can be overridden by setting NEXT_PUBLIC_USE_API=true in env.
  const useApi =
    typeof process !== "undefined"
      ? process.env?.NEXT_PUBLIC_USE_API
      : undefined;
  return useApi !== "true";
}

/**
 * Get all registered users for admin/debug purposes.
 */
export function localGetAllUsers(): Profile[] {
  return getStoredUsers().map(stripPasswordHash);
}

// ---------- Admin: Teacher Approval ----------

/**
 * Get teachers filtered by approval status.
 */
export function localGetTeachersByStatus(status?: ApprovalStatus): Profile[] {
  const users = getStoredUsers();
  const teachers = users.filter((u) => u.role === "teacher");
  if (status) {
    return teachers
      .filter((u) => u.approval_status === status)
      .map(stripPasswordHash);
  }
  return teachers.map(stripPasswordHash);
}

/**
 * Approve a teacher's account.
 */
export function localApproveTeacher(teacherId: string): Profile {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === teacherId);
  if (idx === -1) throw new Error("사용자를 찾을 수 없습니다.");
  if (users[idx].role !== "teacher") throw new Error("교사 계정이 아닙니다.");

  users[idx].approval_status = "approved";
  users[idx].updated_at = new Date().toISOString();
  saveStoredUsers(users);
  return stripPasswordHash(users[idx]);
}

/**
 * Reject a teacher's account.
 */
export function localRejectTeacher(teacherId: string): Profile {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === teacherId);
  if (idx === -1) throw new Error("사용자를 찾을 수 없습니다.");
  if (users[idx].role !== "teacher") throw new Error("교사 계정이 아닙니다.");

  users[idx].approval_status = "rejected";
  users[idx].updated_at = new Date().toISOString();
  saveStoredUsers(users);
  return stripPasswordHash(users[idx]);
}

/**
 * Get count of pending teachers.
 */
export function localGetPendingTeacherCount(): number {
  return getStoredUsers().filter(
    (u) => u.role === "teacher" && u.approval_status === "pending",
  ).length;
}

// ---------- Teacher: Bulk Student Creation ----------

export interface BulkCreateResult {
  name: string;
  email: string;
  password: string;
}

/**
 * Bulk create student accounts from a list of names.
 * Returns the created accounts with auto-generated emails and passwords.
 */
export function localBulkCreateStudents(
  names: string[],
  options: {
    grade: number;
    semester: number;
    class_name: string;
    teacher_id: string;
  },
): BulkCreateResult[] {
  const users = getStoredUsers();
  const results: BulkCreateResult[] = [];
  const now = new Date().toISOString();

  for (const name of names) {
    const trimmedName = name.trim();
    if (!trimmedName) continue;

    // Generate unique email: student_[random]@class.local
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const email = `student_${randomSuffix}@class.local`;
    // Generate simple 4-digit password
    const password = String(Math.floor(1000 + Math.random() * 9000));

    const newUser: Profile & { password_hash: string } = {
      id: generateId(),
      email,
      name: trimmedName,
      role: "student",
      avatar_url: null,
      grade: options.grade,
      semester: options.semester,
      school_name: null,
      class_name: options.class_name,
      student_number: null,
      parent_id: null,
      teacher_id: options.teacher_id,
      subscription_plan: "free",
      subscription_expires_at: null,
      streak_count: 0,
      total_points: 0,
      approval_status: "approved",
      password_hash: simpleHash(password),
      created_at: now,
      updated_at: now,
    };

    users.push(newUser);
    results.push({ name: trimmedName, email, password });
  }

  saveStoredUsers(users);
  return results;
}

/**
 * Initialize demo accounts for development/testing.
 * Creates sample student, teacher, parent, and admin accounts if none exist.
 */
export function initDemoAccounts(): void {
  if (typeof window === "undefined") return;

  const users = getStoredUsers();
  const hasAdmin = users.some((u) => u.email === "admin@demo.com");
  if (hasAdmin) return; // Demo accounts already seeded

  const now = new Date().toISOString();

  // Create demo student/teacher/parent via signup (skips if email already exists)
  const demoAccounts: SignupData[] = [
    {
      email: "student@demo.com",
      password: "1234",
      name: "김아라",
      role: "student",
      grade: 1,
      semester: 1,
      school_name: "아라초등학교",
    },
    {
      email: "student2@demo.com",
      password: "1234",
      name: "이하루",
      role: "student",
      grade: 2,
      semester: 1,
      school_name: "아라초등학교",
    },
    {
      email: "teacher@demo.com",
      password: "1234",
      name: "박선생",
      role: "teacher",
      school_name: "아라초등학교",
    },
    {
      email: "parent@demo.com",
      password: "1234",
      name: "김부모",
      role: "parent",
    },
  ];

  for (const account of demoAccounts) {
    try {
      localSignup(account);
    } catch {
      // Ignore if already exists
    }
  }

  // Create admin account directly (not through signup which only accepts student/teacher/parent)
  const adminUser: Profile & { password_hash: string } = {
    id: generateId(),
    email: "admin@demo.com",
    name: "슈퍼관리자",
    role: "admin",
    avatar_url: null,
    grade: null,
    semester: null,
    school_name: null,
    class_name: null,
    student_number: null,
    parent_id: null,
    teacher_id: null,
    subscription_plan: "free",
    subscription_expires_at: null,
    streak_count: 0,
    total_points: 0,
    approval_status: "approved",
    password_hash: simpleHash("1234"),
    created_at: now,
    updated_at: now,
  };

  const currentUsers = getStoredUsers();
  currentUsers.push(adminUser);
  saveStoredUsers(currentUsers);

  // Auto-approve the demo teacher
  const allUsers = getStoredUsers();
  const teacherIdx = allUsers.findIndex((u) => u.email === "teacher@demo.com");
  if (teacherIdx !== -1 && allUsers[teacherIdx].approval_status === "pending") {
    allUsers[teacherIdx].approval_status = "approved";
    saveStoredUsers(allUsers);
  }

  // Clear the current user after seeding (don't auto-login)
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
