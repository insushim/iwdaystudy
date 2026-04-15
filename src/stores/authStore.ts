import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types/database";
import type { SignupData } from "@/lib/local-auth";

interface AuthState {
  user: Profile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    expectedRole?: "student" | "staff",
  ) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => void;
  setUser: (user: Profile | null) => void;
}

async function apiLogin(
  email: string,
  password: string,
  expectedRole?: "student" | "staff",
): Promise<{ user: Profile; token: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, expected_role: expectedRole }),
  });
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ message: "로그인에 실패했습니다." }));
    throw new Error(err?.message || "로그인에 실패했습니다.");
  }
  return res.json();
}

async function apiSignup(
  data: SignupData,
): Promise<{ user: Profile; token: string | null }> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ message: "회원가입에 실패했습니다." }));
    throw new Error(err?.message || "회원가입에 실패했습니다.");
  }
  return res.json();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password, expectedRole) => {
        set({ isLoading: true });
        try {
          const result = await apiLogin(email, password, expectedRole);
          localStorage.setItem("auth_token", result.token);
          localStorage.setItem(
            "araharu_current_user",
            JSON.stringify(result.user),
          );
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
          const result = await apiSignup(data);
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
          if (result.token) {
            localStorage.setItem("auth_token", result.token);
            localStorage.setItem(
              "araharu_current_user",
              JSON.stringify(result.user),
            );
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
        localStorage.removeItem("auth_token");
        localStorage.removeItem("araharu_current_user");
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, ...data } });
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
