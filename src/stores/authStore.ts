import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types/database";
import {
  localLogin,
  localSignup,
  localLogout,
  localGetCurrentUser,
  localUpdateProfile,
  shouldUseLocalAuth,
  type SignupData,
  type AuthResult,
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
          if (shouldUseLocalAuth()) {
            // Static export / offline mode: use localStorage auth
            const result = localLogin(email, password);
            set({
              user: result.user,
              token: result.token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Production mode: call Cloudflare Functions API
            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
              const err = await res
                .json()
                .catch(() => ({ message: "로그인 실패" }));
              throw new Error(err.message || "로그인 실패");
            }
            const data = await res.json();
            localStorage.setItem("auth_token", data.token);
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (data) => {
        set({ isLoading: true });
        try {
          if (shouldUseLocalAuth()) {
            const result = localSignup(data);
            // Pending teachers: set user but not authenticated
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
          } else {
            const res = await fetch("/api/auth/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (!res.ok) {
              const err = await res
                .json()
                .catch(() => ({ message: "회원가입 실패" }));
              throw new Error(err.message || "회원가입 실패");
            }
            const result = await res.json();
            // Pending teachers
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
            localStorage.setItem("auth_token", result.token);
            set({
              user: result.user,
              token: result.token,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        if (shouldUseLocalAuth()) {
          localLogout();
        }
        localStorage.removeItem("auth_token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        const user = get().user;
        if (!user) return;

        if (shouldUseLocalAuth()) {
          const updated = localUpdateProfile(user.id, data);
          set({ user: updated });
        } else {
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
