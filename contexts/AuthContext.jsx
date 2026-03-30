'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGameStore } from '@/stores/useGameStore';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated, isGuest, setSession } = useAuthStore();
  const { initializeGameData } = useGameStore();

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await setSession(session);
      initializeGameData();
      setIsLoading(false);
    };

    checkSession();

    // Safety timer to ensure loading screen always disappears
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await setSession(session);
        setIsLoading(false);
        clearTimeout(safetyTimer);
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, [setSession, initializeGameData]);



  const requireAuth = (allowedRoles = []) => {
    // If authenticated OR is a guest, allow access
    if (!isAuthenticated && !isGuest) {
      router.push('/login');
      return false;
    }

    if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
      router.push('/unauthorized');
      return false;
    }

    return true;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      requireAuth,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}