import { create } from "zustand";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "user";
  avatar?: string;
  phoneNumber?: string;
}

interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  setUser: (user: AuthenticatedUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user, error: null, isInitialized: true }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ user: null, isAuthenticated: false, error: null, isInitialized: true }),
}));
