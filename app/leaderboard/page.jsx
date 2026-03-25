"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ChevronRight, Zap, Loader2 } from "lucide-react";
import {
  FaMedal as Medal,
  FaAward as Award,
  FaStar as Star,
  FaFire as Flame,
  FaTrophy as Trophy,
  FaCrown as Crown,
  FaCalendar as Calendar,
  FaSchool as School,
} from "react-icons/fa";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("leaderboard")
      .select(`
        score,
        profiles ( name, school )
      `)
      .order("score", { ascending: false });

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return;
    }

    // Format data for UI
    const formatted = data.map((entry, index) => ({
      id: index,
      rank: index + 1,
      name: entry.profiles?.name || "Anonymous Learner",
      school: entry.profiles?.school || "Unknown School",
      points: entry.score,
      level: Math.floor(entry.score / 1000) + 1,
      achievements: 0, // Simplified for now as it's not in the base leaderboard table
      streak: 0, // Simplified for now
    }));

    setLeaders(formatted);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();

    // Real-time Updates
    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />;
      case 2:
        return <Medal className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />;
      case 3:
        return <Award className="h-5 w-5 md:h-6 md:w-6 text-amber-700" />;
      default:
        return (
          <span className="text-base md:text-lg font-bold text-slate-600 dark:text-slate-400">
            #{rank}
          </span>
        );
    }
  };

  const getRankStyling = (rank) => {
    switch (rank) {
      case 1:
        return {
          container:
            "border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 shadow-lg shadow-yellow-100/50 dark:shadow-yellow-900/20",
          avatar:
            "bg-gradient-to-br from-yellow-400 to-yellow-600 ring-2 md:ring-4 ring-yellow-300/50",
          text: "text-yellow-900 dark:text-yellow-100",
          points: "text-yellow-800 dark:text-yellow-200",
        };
      case 2:
        return {
          container:
            "border-slate-300 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 shadow-lg shadow-slate-100/50 dark:shadow-slate-900/20",
          avatar:
            "bg-gradient-to-br from-slate-400 to-slate-600 ring-2 md:ring-4 ring-slate-300/50",
          text: "text-slate-900 dark:text-slate-100",
          points: "text-slate-800 dark:text-slate-200",
        };
      case 3:
        return {
          container:
            "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-lg shadow-amber-100/50 dark:shadow-amber-900/20",
          avatar:
            "bg-gradient-to-br from-amber-500 to-amber-700 ring-2 md:ring-4 ring-amber-300/50",
          text: "text-amber-900 dark:text-amber-100",
          points: "text-amber-800 dark:text-amber-200",
        };
      default:
        return {
          container:
            "border-border hover:border-primary/30 transition-all duration-200",
          avatar: "bg-gradient-to-br from-primary to-primary/70",
          text: "text-foreground",
          points: "text-foreground",
        };
    }
  };

  const displayedStudents = showAll ? leaders : leaders.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Leaderboard
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Live updates from learners across the platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-3 sm:p-6 text-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-blue-500 mb-2 sm:mb-3" />
              <p className="text-xl sm:text-3xl font-bold text-blue-600">
                {leaders.length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Active Participants
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-3 sm:p-6 text-center">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-green-500 mb-2 sm:mb-3" />
              <p className="text-xl sm:text-3xl font-bold text-green-600">
                {leaders.reduce((acc, curr) => acc + curr.points, 0).toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Total Collective Points
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-3 sm:p-6 text-center">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-purple-500 mb-2 sm:mb-3" />
              <p className="text-xl sm:text-3xl font-bold text-purple-600">Real-time</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Data Syncing
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-3 sm:p-6 text-center">
              <Flame className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-orange-500 mb-2 sm:mb-3" />
              <p className="text-xl sm:text-3xl font-bold text-orange-600">Live</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Leaderboard
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="all-time" className="space-y-4 sm:space-y-6">
          <TabsList className="grid grid-cols-1 w-full max-w-sm sm:max-w-md mx-auto h-10 sm:h-12">
            <TabsTrigger
              value="all-time"
              className="text-xs sm:text-sm font-medium"
            >
              All Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-time">
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                  Top Learners
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Authentic scores from our Supabase database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                  ) : leaders.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      No leaderboard data yet. Play a game to be the first!
                    </div>
                  ) : (
                    displayedStudents.map((student) => {
                      const styling = getRankStyling(student.rank);
                      return (
                        <div
                          key={student.id}
                          className={`p-3 sm:p-6 rounded-xl border-2 transition-all duration-200 hover:scale-[1.01] sm:hover:scale-[1.02] ${styling.container}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                {getRankIcon(student.rank)}
                              </div>

                              <div
                                className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full ${styling.avatar} flex items-center justify-center text-white font-bold text-base lg:text-lg shadow-lg`}
                              >
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0] || "")
                                  .join("")}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3
                                  className={`font-bold text-base lg:text-lg ${styling.text} truncate`}
                                >
                                  {student.name}
                                </h3>
                                <p className="text-sm text-muted-foreground font-medium truncate">
                                  {student.school}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 lg:gap-6 text-right flex-shrink-0">
                              <div>
                                <p
                                  className={`font-bold text-lg lg:text-xl ${styling.points}`}
                                >
                                  {student.points.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                  points
                                </p>
                              </div>
                              <div className="hidden md:block">
                                <p className="font-semibold text-primary">
                                  Level {student.level}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {leaders.length > 5 && (
                  <div className="text-center mt-6 sm:mt-8">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => setShowAll(!showAll)}
                      className="flex items-center gap-2"
                    >
                      {showAll ? "Show Less" : "Load More"}
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          showAll ? "rotate-90" : ""
                        }`}
                      />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
