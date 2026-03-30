"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  Calendar,
  Trophy,
  Star,
  BookOpen,
  Clock,
  Target,
  BarChart3,
  Calculator,
  FlaskConical,
  Laptop,
  Hammer
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGameStore } from '@/stores/useGameStore';
import { supabase } from '@/lib/supabase';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function ProgressPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { totalPoints, level, streak, userProgress, gameProgress, recentScores, fetchRecentScores, subscribeToLeaderboard } = useGameStore();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Real-time initialization
  useEffect(() => {
    if (user?.id) {
      fetchRecentScores(user.id);
      const channel = subscribeToLeaderboard(user.id);
      return () => {
        if (channel) supabase.removeChannel(channel);
      };
    }
  }, [user?.id, fetchRecentScores, subscribeToLeaderboard]);

  // Format chart data from real scores
  const getChartData = () => {
    if (!recentScores || recentScores.length === 0) return [];
    
    return recentScores.map(score => ({
      name: new Date(score.created_at).toLocaleDateString([], { weekday: 'short' }),
      points: score.score,
      fullDate: new Date(score.created_at).toLocaleDateString()
    }));
  };

  const chartData = getChartData();

  // Real Subject Progress Calculation
  const calculateSubjectProgress = (subjectId) => {
    const subjectGames = {
      mathematics: ['number-quest', 'algebra-adventure', 'fraction-pizza', 'geometry-builder', 'basic-arithmetic', 'pattern-master', 'graph-explorer', 'probability-casino'],
      science: ['chemistry-lab', 'biology-explorer', 'solar-system', 'atom-builder', 'ecosystem-manager', 'weather-wizard', 'periodic-table'],
      technology: ['code-creator', 'digital-citizen', 'app-architect', 'algorithm-arena', 'web-designer', 'database-detective', 'ai-trainer'],
      engineering: ['bridge-builder', 'simple-machines', 'circuit-master', 'green-engineer', 'rocket-designer', 'city-planner', 'robot-builder', 'material-tester']
    };

    const games = subjectGames[subjectId] || [];
    const completedCount = games.filter(id => gameProgress[id]?.completed).length;
    const progress = games.length > 0 ? Math.round((completedCount / games.length) * 100) : 0;

    return {
      completed: completedCount,
      total: games.length,
      percent: progress
    };
  };

  const subjectProgress = [
    { name: 'Mathematics', ...calculateSubjectProgress('mathematics'), color: '#3B82F6' },
    { name: 'Science', ...calculateSubjectProgress('science'), color: '#10B981' },
    { name: 'Technology', ...calculateSubjectProgress('technology'), color: '#8B5CF6' },
    { name: 'Engineering', ...calculateSubjectProgress('engineering'), color: '#F59E0B' }
  ];

  // Derive recent activity from recent scores and achievements
  const recentActivity = [
    ...(recentScores?.slice(-3).map((s, i) => ({
      id: `score-${i}`,
      type: 'game_completed',
      title: 'Game Completed',
      subject: 'STEM Challenge',
      points: s.score,
      time: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: Trophy
    })) || []),
    ...(userProgress.badges?.slice(-2).map((b, i) => ({
      id: `badge-${i}`,
      type: 'achievement_unlocked',
      title: b,
      subject: 'Achievement',
      points: 100,
      time: 'Recently',
      icon: Star
    })) || [])
  ].sort((a, b) => b.id.localeCompare(a.id));

  const totalGamesCompleted = subjectProgress.reduce((sum, subject) => sum + subject.completed, 0);
  const totalGames = subjectProgress.reduce((sum, subject) => sum + subject.total, 0);
  const overallProgress = Math.round((totalGamesCompleted / totalGames) * 100);


  return (
    <div className="min-h-screen bg-background">      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            📊 Progress Tracking
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor your learning journey and see how you're improving across all STEM subjects
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{totalPoints}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Level</p>
                  <p className="text-2xl font-bold">{level}</p>
                </div>
                <Trophy className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Streak Days</p>
                  <p className="text-2xl font-bold">{streak}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold">{overallProgress}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Your points and game completion over time</CardDescription>
              <div className="flex gap-2">
                <Button
                  variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('week')}
                >
                  Week
                </Button>
                <Button
                  variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('month')}
                >
                  Month
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="points" stroke="#22C55E" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>Your completion rate by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectProgress.map((subject) => (
                  <div key={subject.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-muted-foreground">
                        {subject.completed}/{subject.total} games
                      </span>
                    </div>
                    <Progress value={subject.percent} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest achievements and completed games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.subject}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        +{activity.points} pts
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}