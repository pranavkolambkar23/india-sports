"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AdminUser = {
  email: string;
  userId: string;
};

type AdminAuthContextValue = {
  checked: boolean;
  user: AdminUser | null;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

async function fetchAdminUser(): Promise<AdminUser | null> {
  const token = localStorage.getItem("india-sports-admin-token");
  if (!token) return null;

  const response = await fetch("/api/admin/me", {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    localStorage.removeItem("india-sports-admin-token");
    return null;
  }

  return response.json();
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  const refresh = useCallback(async () => {
    const adminUser = await fetchAdminUser();
    setUser(adminUser);
    setChecked(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("india-sports-admin-token");
    setUser(null);
    setChecked(true);
    window.dispatchEvent(new Event("india-sports-admin-auth"));
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refresh();
    }, 0);

    window.addEventListener("india-sports-admin-auth", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("india-sports-admin-auth", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.clearTimeout(timeout);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({
      checked,
      user,
      isAdmin: Boolean(user),
      refresh,
      logout,
    }),
    [checked, logout, refresh, user]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  }
  return context;
}
