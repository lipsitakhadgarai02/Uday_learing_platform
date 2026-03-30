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
      weeklyGoal: 5,
      leaderboard: [],
      currentModule: null,
      ecoMode: false,
      recentScores: [],


      // --- GETTERS ---
      getGamesPlayedThisWeek: () => {
        const gameProgress = get().gameProgress;
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);

        return Object.values(gameProgress).filter(game => {
          if (!game.lastPlayed) return false;
          const lastPlayed = new Date(game.lastPlayed);
          return lastPlayed >= startOfWeek;
        }).length;
      },

      // --- SUPABASE REAL-TIME SYNC ---

      // --- SUPABASE REAL-TIME SYNC ---



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
                  badges: newData.badges || currentProgress.badges || [],
                  completedModules: newData.completed_modules || currentProgress.completedModules || [],
                },
              });

            }
          )
          .subscribe();

        return channel;
      },

      fetchRecentScores: async (userId) => {
        if (!userId) return;
        const { data, error } = await supabase
          .from('leaderboard')
          .select('score, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(30);
          
        if (data) {
          set({ recentScores: data });
        }
      },

      subscribeToLeaderboard: (userId) => {
        if (!userId) return null;
        const channel = supabase
          .channel(`leaderboard-${userId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "leaderboard",
              filter: `user_id=eq.${userId}`,
            },
            () => {
              get().fetchRecentScores(userId);
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
        const lastPlayDateStr = currentProgress.lastPlayDate;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let newStreak = get().streak || 0;
        
        if (!lastPlayDateStr) {
          newStreak = 1;
        } else {
          const lastPlayDate = new Date(lastPlayDateStr);
          const lastDate = new Date(lastPlayDate.getFullYear(), lastPlayDate.getMonth(), lastPlayDate.getDate());
          const diffTime = today - lastDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        }

        // Achievement checks
        const achievements = [...(currentProgress.badges || [])];
        if (newTotalPoints >= 100 && !achievements.includes('First Milestone')) {
          achievements.push('First Milestone');
        }
        if (newTotalPoints >= 500 && !achievements.includes('STEM Explorer')) {
          achievements.push('STEM Explorer');
        }
        if (newStreak >= 7 && !achievements.includes('Weekly Warrior')) {
          achievements.push('Weekly Warrior');
        }

        const updatedProgress = {
          ...currentProgress,
          totalPoints: newTotalPoints,
          level: newLevel,
          streakDays: newStreak,
          lastPlayDate: now.toISOString(),
          badges: achievements,
        };

        set({
          userProgress: updatedProgress,
          totalPoints: newTotalPoints,
          level: newLevel,
          streak: newStreak,
        });

        // 2. Database updates
        if (user?.id) {
          try {
            // Update individual game entry
            await saveScore(user.id, points); 

            // Update main profile for real-time sync across devices
            await supabase
              .from("profiles")
              .update({
                total_points: newTotalPoints,
                level: newLevel,
                streak: newStreak,
                badges: achievements,
                updated_at: now.toISOString(),
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

      updateGameProgress: async (gameId, scoreOrData, questionsAttempted, totalQuestions) => {
        let score = 0;
        let isCompleted = false;

        // Support both (gameId, {score, completed, ...}) and (gameId, score, attempted, total) signatures
        if (typeof scoreOrData === 'object' && scoreOrData !== null) {
          score = scoreOrData.score || 0;
          isCompleted = scoreOrData.completed || false;
        } else {
          score = typeof scoreOrData === 'number' ? scoreOrData : 0;
          isCompleted = questionsAttempted !== undefined && totalQuestions !== undefined && questionsAttempted >= totalQuestions;
        }

        const currentProgress = get().gameProgress;
        const updatedProgress = {
          ...currentProgress,
          [gameId]: typeof scoreOrData === 'object' ? scoreOrData : {
            score,
            completed: isCompleted,
            progress: totalQuestions ? (questionsAttempted / totalQuestions) * 100 : 0,
            lastPlayed: new Date().toISOString()
          },
        };
        
        set({ gameProgress: updatedProgress });

        // If the game is completed and has a score, sync it to Supabase
        if (isCompleted && score > 0) {
          console.log(`Syncing score for ${gameId}: ${score} points`);
          await get().addPoints(score);
        }
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

      syncLocalDataToSupabase: async (userId, retryCount = 0) => {
        if (!userId) return;

        const { userProgress, totalPoints, level, streak } = get();
        
        // Only sync if there is actually some progress to save
        if (totalPoints === 0 && streak === 0 && (userProgress.badges?.length || 0) === 0) {
          return;
        }

        try {
          // Check if profile exists first (to handle latency)
          const { data: profile, error: checkError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .single();
          
          if (checkError) {
            if (checkError.code === 'PGRST116' && retryCount < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
              return get().syncLocalDataToSupabase(userId, retryCount + 1);
            }
            if (checkError.code !== 'PGRST116' || retryCount >= 3) {
              console.error("Error checking profile for sync:", checkError.message || checkError, checkError.code);
            }
            return;
          }

          // 1. Update the profile
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              total_points: totalPoints,
              level: level,
              streak: streak,
              badges: userProgress.badges || [],
              game_progress: get().gameProgress || {},
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);


          if (profileError) throw profileError;

          console.log("Guest data successfully synced to Supabase.");
        } catch (error) {
          console.error("Error syncing guest data:", error.message || error, error.code);
        }
      },

    }),
    {
      name: "game-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);