"use client";
import { useState, useEffect, useCallback } from "react";
import { getCurrentUser, logout as authLogout, UserProfile } from "./auth";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  return { user, loading, logout, refreshUser, isLoggedIn: !!user };
}
