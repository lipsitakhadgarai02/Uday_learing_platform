"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";

const AppLayout = ({ children }) => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { fetchUserProfile, subscribeToProfile } = useGameStore();
  const { theme } = useTheme();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Initial fetch of real database stats
      fetchUserProfile(user.id);

      // Subscribe to live database changes (Real-time)
      const channel = subscribeToProfile(user.id);

      return () => {
        if (channel) {
          channel.unsubscribe();
        }
      };
    }
  }, [isAuthenticated, user?.id, fetchUserProfile, subscribeToProfile]);

  // Pages that should not show header/footer (full-screen experiences)
  const noLayoutPages = ["/login", "/signup", "/auth/login", "/auth/signup"];

  // Game pages that should only show minimal header (no footer for immersion)
  const gamePages = pathname?.startsWith("/games/");

  // Check if current page should have no layout
  const shouldHideLayout = noLayoutPages.some((page) =>
    pathname?.startsWith(page)
  );

  // If it's a no-layout page, render children only
  if (shouldHideLayout) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header Navigation - Always visible except on no-layout pages */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Footer - Hide on game pages for better immersion */}
      {!gamePages && (
        <footer className="mt-auto border-t bg-background">
          <Footer />
        </footer>
      )}
    </div>
  );
};

export default AppLayout;