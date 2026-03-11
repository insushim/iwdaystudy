'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';

const USERS_KEY = 'araharu_users';
const CURRENT_USER_KEY = 'araharu_current_user';
const NICKNAME_SET_KEY = 'araharu_nickname_set';

/**
 * Check if user is a bulk-created student who hasn't set a nickname yet.
 * Bulk-created students have names like "1번", "2번", etc.
 */
export function needsNicknameSetup(userId: string, userName: string): boolean {
  if (typeof window === 'undefined') return false;
  // Already set nickname in this browser
  if (localStorage.getItem(`${NICKNAME_SET_KEY}_${userId}`)) return false;
  // Check if name looks like a default bulk-created name (번호 pattern)
  return /^\d+번$/.test(userName);
}

export default function NicknameModal() {
  const { user, setUser } = useAuthStore();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  if (!user || !needsNicknameSetup(user.id, user.name)) return null;

  const handleSave = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('닉네임을 입력해 주세요.');
      return;
    }
    if (trimmed.length < 2) {
      setError('2글자 이상 입력해 주세요.');
      return;
    }
    if (trimmed.length > 10) {
      setError('10글자 이하로 입력해 주세요.');
      return;
    }

    try {
      // Update in user store
      const raw = localStorage.getItem(USERS_KEY);
      const users = raw ? JSON.parse(raw) : [];
      const idx = users.findIndex((u: any) => u.id === user.id);
      if (idx !== -1) {
        users[idx].name = trimmed;
        users[idx].updated_at = new Date().toISOString();
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }

      // Update current user
      const updated = { ...user, name: trimmed };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
      localStorage.setItem(`${NICKNAME_SET_KEY}_${user.id}`, '1');
      setUser(updated);
    } catch {
      setError('저장에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-sm bg-background rounded-2xl shadow-2xl border overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary/5 border-b px-6 py-5 text-center">
            <div className="text-4xl mb-2">👋</div>
            <h2 className="text-xl font-bold">환영해요!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              친구들이 알아볼 수 있는 닉네임을 정해주세요
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="예: 하늘이, 민수"
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); setError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                autoFocus
                maxLength={10}
                className="h-12 text-center text-lg font-bold"
              />
              <p className="text-xs text-muted-foreground text-center">
                2~10글자, 본인 이름이나 별명을 입력하세요
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={!nickname.trim()}
              className="w-full h-12 text-base font-bold rounded-xl"
            >
              닉네임 설정 완료
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
