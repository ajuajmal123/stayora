import { useEffect, useCallback } from "react";
import { useAuthStore, AuthenticatedUser } from "@/store/authStore";
import { LoginInput, RegisterInput } from "@/validations/auth";

export function useAuth() {
  const { user, isAuthenticated, isLoading, error, setUser, setLoading, setError, reset } = useAuthStore();

  const checkSession = useCallback(async () => {
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
    }
  }, [setUser, setLoading]);

  const login = async (input: LoginInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await response.json();

      if (body.success && body.data) {
        setUser(body.data);
        return true;
      } else {
        setError(body.message || "Login failed");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (input: RegisterInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await response.json();

      if (body.success && body.data) {
        setUser(body.data);
        return true;
      } else {
        setError(body.message || "Registration failed");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

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
    if (!isAuthenticated && user === null) {
      checkSession();
    }
  }, [checkSession, isAuthenticated, user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkSession,
  };
}
