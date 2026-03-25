import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { saveScore } from "@/lib/services/supabaseService";
import { useAuthStore } from "@/stores/useAuthStore";

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Direct properties for easy access
      totalPoints: 0,
      level: 1,
      streak: 0,
      achievements: [],

      userProgress: {
        totalPoints: 0,
        level: 1,
        badges: [],
        completedModules: [],
        streakDays: 0,
        lastPlayDate: null,
      },

      gameScores: {},
      gameProgress: {},
      leaderboard: [],
      currentModule: null,
      ecoMode: false,

      // --- SUPABASE REAL-TIME SYNC ---

      fetchUserProfile: async (userId) => {
        if (!userId) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("total_points, level, streak")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          return;
        }

        if (data) {
          const currentProgress = get().userProgress;
          set({
            totalPoints: data.total_points || 0,
            level: data.level || 1,
            streak: data.streak || 0,
            userProgress: {
              ...currentProgress,
              totalPoints: data.total_points || 0,
              level: data.level || 1,
              streakDays: data.streak || 0,
            },
          });
        }
      },

      subscribeToProfile: (userId) => {
        if (!userId) return null;

        const channel = supabase
          .channel(`profile-${userId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${userId}`,
            },
            (payload) => {
              const currentProgress = get().userProgress;
              const newData = payload.new;
              set({
                totalPoints: newData.total_points || 0,
                level: newData.level || 1,
                streak: newData.streak || 0,
                userProgress: {
                  ...currentProgress,
                  totalPoints: newData.total_points || 0,
                  level: newData.level || 1,
                  streakDays: newData.streak || 0,
                },
              });
            }
          )
          .subscribe();

        return channel;
      },

      // --- GAME METHODS ---

      addPoints: async (points) => {
        const currentProgress = get().userProgress;
        const newTotalPoints = currentProgress.totalPoints + points;
        const newLevel = Math.floor(newTotalPoints / 1000) + 1;

        const user = useAuthStore.getState().user;

        // 1. Optimistic local update
        const updatedProgress = {
          ...currentProgress,
          totalPoints: newTotalPoints,
          level: newLevel,
          lastPlayDate: new Date().toISOString(),
        };

        set({
          userProgress: updatedProgress,
          totalPoints: newTotalPoints,
          level: newLevel,
        });

        // 2. Database updates
        if (user?.id) {
          try {
            // Update individual game entry
            await saveScore(user.id, newTotalPoints);

            // Update main profile for real-time sync across devices
            await supabase
              .from("profiles")
              .update({
                total_points: newTotalPoints,
                level: newLevel,
                updated_at: new Date().toISOString(),
              })
              .eq("id", user.id);
          } catch (error) {
            console.error("Failed to sync score to Supabase", error);
          }
        }
      },

      addBadge: (badge) => {
        const currentProgress = get().userProgress;
        if (!currentProgress.badges.includes(badge)) {
          const updatedProgress = {
            ...currentProgress,
            badges: [...currentProgress.badges, badge],
          };
          set({ userProgress: updatedProgress });
        }
      },

      completeModule: (moduleId) => {
        const currentProgress = get().userProgress;
        if (!currentProgress.completedModules.includes(moduleId)) {
          const updatedProgress = {
            ...currentProgress,
            completedModules: [...currentProgress.completedModules, moduleId],
          };
          set({ userProgress: updatedProgress });
        }
      },

      updateGameScore: async (gameId, score) => {
        const currentScores = get().gameScores;
        const updatedScores = {
          ...currentScores,
          [gameId]: {
            score,
            date: new Date().toISOString(),
            attempts: (currentScores[gameId]?.attempts || 0) + 1,
          },
        };

        set({ gameScores: updatedScores });
      },

      setCurrentModule: (module) => {
        set({ currentModule: module });
      },

      toggleEcoMode: () => {
        set({ ecoMode: !get().ecoMode });
      },

      initializeGameData: () => {
        // Now handled by subscription and fetch methods triggered on auth change
      },

      updateGameProgress: (gameId, progressData) => {
        const currentProgress = get().gameProgress;
        const updatedProgress = {
          ...currentProgress,
          [gameId]: progressData,
        };
        set({ gameProgress: updatedProgress });
      },

      getGameProgress: (gameId) => {
        return (
          get().gameProgress[gameId] || {
            progress: 0,
            completed: false,
            bestScore: 0,
          }
        );
      },

      resetGameData: () => {
        const initialProgress = {
          totalPoints: 0,
          level: 1,
          badges: [],
          completedModules: [],
          streakDays: 0,
          lastPlayDate: null,
        };

        set({
          userProgress: initialProgress,
          gameScores: {},
          currentModule: null,
          totalPoints: 0,
          level: 1,
          streak: 0,
        });
      },
    }),
    {
      name: "game-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);