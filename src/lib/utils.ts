import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getGradeGroup(grade: number): '1-2' | '3-4' | '5-6' {
  if (grade <= 2) return '1-2';
  if (grade <= 4) return '3-4';
  return '5-6';
}

export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    math: '#FF6B35',
    korean: '#4ECDC4',
    spelling: '#A18CD1',
    vocabulary: '#FF8BA7',
    hanja: '#8B4513',
    english: '#4169E1',
    writing: '#2ECC71',
    general_knowledge: '#F9CA24',
    safety: '#E74C3C',
    creative: '#FF69B4',
    emotion_check: '#FF8BA7',
    readiness_check: '#4ECDC4',
    science: '#00BCD4',
    social: '#795548',
  };
  return colors[subject] || '#2ECC71';
}

export function getGradeColor(grade: number): string {
  const colors: Record<number, string> = {
    1: '#FF8BA7',
    2: '#F9CA24',
    3: '#4ECDC4',
    4: '#4169E1',
    5: '#A18CD1',
    6: '#2ECC71',
  };
  return colors[grade] || '#2ECC71';
}

export function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function hashPassword(password: string): string {
  // Simple hash for demo - in production use bcrypt via API
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
