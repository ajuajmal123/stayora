import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, isAuthenticated, isLoading, isInitialized, error, setUser, setLoading, reset } = useAuthStore();

  const checkSession = useCallback(async () => {
    const state = useAuthStore.getState();
    if (state.isLoading) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/me", { method: "GET" });
      const body = await response.json();
      
      if (body.success && body.data) {
        setUser(body.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session check error:", err);
      setUser(null);
    } finally {
      setLoading(false);
      useAuthStore.setState({ isInitialized: true });
    }
  }, [setUser, setLoading]);

  const logout = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      const body = await response.json();

      if (body.success) {
        reset();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Logout error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Run initial session check on mount
  useEffect(() => {
    const state = useAuthStore.getState();
    if (!state.isInitialized && !state.isLoading) {
      checkSession();
    }
  }, [checkSession]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    logout,
    checkSession,
    setUser,
  };
}
