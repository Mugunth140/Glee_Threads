'use client';

import { useRouter } from 'next/navigation';
import { createContext, ReactNode, startTransition, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Helper to read from localStorage safely
function getStoredAuth(): { token: string | null; admin: AdminUser | null } {
  if (typeof window === 'undefined') {
    return { token: null, admin: null };
  }
  const storedToken = localStorage.getItem('adminToken');
  const storedAdmin = localStorage.getItem('adminUser');
  if (storedToken && storedAdmin) {
    try {
      return { token: storedToken, admin: JSON.parse(storedAdmin) };
    } catch {
      return { token: null, admin: null };
    }
  }
  return { token: null, admin: null };
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{ admin: AdminUser | null; token: string | null }>({
    admin: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredAuth();
    startTransition(() => {
      setAuthState(stored);
      setIsLoading(false);
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAuthState({ admin: null, token: null });
    router.push('/admin/login');
  }, [router]);

  const checkAuth = useCallback(() => {
    const stored = getStoredAuth();
    return stored.admin?.role === 'admin';
  }, []);

  const value = useMemo(() => ({
    admin: authState.admin,
    token: authState.token,
    isLoading,
    logout,
    checkAuth,
  }), [authState.admin, authState.token, isLoading, logout, checkAuth]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
