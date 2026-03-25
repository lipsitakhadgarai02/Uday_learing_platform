import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,

  setSession: (session) => {
    if (session?.user) {
      const user = session.user;
      set({
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0],
          role: user.user_metadata?.role || 'student',
          ...user.user_metadata
        },
        isAuthenticated: true
      });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userProgress');
      localStorage.removeItem('gameScores');
    }
  },

  updateUser: async (userData) => {
    const { data, error } = await supabase.auth.updateUser({
      data: userData
    });

    if (!error && data?.user) {
      const currentUser = get().user;
      set({ user: { ...currentUser, ...userData } });
    }
  },

  initializeAuth: () => {
    // Handled by AuthContext listening to onAuthStateChange
  },
}));