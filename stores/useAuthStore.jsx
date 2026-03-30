import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isGuest: false,
  isInitializing: true,

  setSession: async (session) => {
    if (session?.user) {
      const user = session.user;
      
      try {
        // Fetch fresh profile data to get the real, up-to-date role
        // Added a timeout to prevent infinite hangs
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 2000)
        );

        const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]);
        
        if (!error && profile) {
          set({
            user: {
              ...user,
              ...profile,
              name: profile.name || user.user_metadata?.name || user.email?.split('@')[0],
              role: profile.role || user.user_metadata?.role || 'student',
            },
            isAuthenticated: true,
            isGuest: false,
            isInitializing: false
          });
          return;
        }
      } catch (err) {
        console.warn("Profile fetch failed or timed out, using fallback metadata", err);
      }

      // Fallback to metadata if profile fetch fails or times out
      set({
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0],
          role: user.user_metadata?.role || 'student',
          ...user.user_metadata
        },
        isAuthenticated: true,
        isGuest: false,
        isInitializing: false
      });
    } else {
      set({ user: null, isAuthenticated: false, isInitializing: false });
    }
  },


  setInitialized: (val = false) => set({ isInitializing: val }),

  continueAsGuest: () => {
    set({ 
      user: { id: 'guest', name: 'Guest User', role: 'student' },
      isAuthenticated: false,
      isGuest: true,
      isInitializing: false
    });
  },


  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, isGuest: false });
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