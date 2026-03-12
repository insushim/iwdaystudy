import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types/database";
import {
  localLogin,
  localSignup,
  localLogout,
  localUpdateProfile,
  type SignupData,
} from "@/lib/local-auth";

interface AuthState {
  user: Profile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => void;
  setUser: (user: Profile | null) => void;
}

/** Try D1 API login, then fall back to localStorage */
async function apiLogin(
  email: string,
  password: string,
): Promise<{ user: Profile; token: string } | null> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      // 403 = teacher pending/rejected (hard error, don't fall back)
      if (res.status === 403) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "로그인 실패");
      }
      // 401 = user not found OR wrong password → fall back to local auth
      // 500 = server error → fall back to local
      return null;
    }
    return await res.json();
  } catch (e) {
    if (e instanceof TypeError) return null; // network error → fall back
    throw e; // re-throw auth errors
  }
}

async function apiSignup(
  data: SignupData,
): Promise<{ user: Profile; token: string } | null> {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      if (res.status === 400 || res.status === 409) {
        throw new Error(err?.message || "회원가입 실패");
      }
      return null;
    }
    return await res.json();
  } catch (e) {
    if (e instanceof TypeError) return null;
    throw e;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // 1) Try D1 API first
          const apiResult = await apiLogin(email, password);
          if (apiResult) {
            localStorage.setItem("auth_token", apiResult.token);
            // Save user to localStorage so dashboard layout can read it
            localStorage.setItem("araharu_current_user", JSON.stringify(apiResult.user));
            // Also save to local-auth for offline/local features
            try { localLogin(email, password); } catch { /* ignore */ }
            set({
              user: apiResult.user,
              token: apiResult.token,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
          // 2) Fall back to localStorage auth
          const result = localLogin(email, password);
          // Sync to D1 so other devices can login
          fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: result.user.email,
              password,
              name: result.user.name,
              role: result.user.role,
              grade: result.user.grade,
              semester: result.user.semester,
              school_name: result.user.school_name,
            }),
          }).catch(() => {});
          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (data) => {
        set({ isLoading: true });
        try {
          // 1) Try D1 API first
          const apiResult = await apiSignup(data);
          if (apiResult) {
            // Also save to local-auth for offline features
            try { localSignup(data); } catch { /* ignore duplicate */ }
            if (
              apiResult.user.role === "teacher" &&
              apiResult.user.approval_status === "pending"
            ) {
              set({
                user: apiResult.user,
                token: null,
                isAuthenticated: false,
                isLoading: false,
              });
              return;
            }
            localStorage.setItem("auth_token", apiResult.token);
            localStorage.setItem("araharu_current_user", JSON.stringify(apiResult.user));
            set({
              user: apiResult.user,
              token: apiResult.token,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
          // 2) Fall back to localStorage
          const result = localSignup(data);
          if (
            result.user.role === "teacher" &&
            result.user.approval_status === "pending"
          ) {
            set({
              user: result.user,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }
          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localLogout();
        localStorage.removeItem("auth_token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        const user = get().user;
        if (!user) return;
        try {
          const updated = localUpdateProfile(user.id, data);
          set({ user: updated });
        } catch {
          set({ user: { ...user, ...data } });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: "araharu-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
