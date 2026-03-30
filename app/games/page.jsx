"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen,
  GraduationCap,
  Lock,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

import { 
  Calculator,
  FlaskConical, 
  Laptop, 
  Hammer,
  Play,
  Trophy,
  Clock,
  Star,
  CheckCircle,
  Gamepad2,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/stores/useGameStore';
import { useAuthStore } from '@/stores/useAuthStore';


export default function GamesPage() {
  const { t } = useTranslation();
  const { gameProgress, getGameProgress } = useGameStore();
  const { user } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState(user?.grade || 'all');

  const classCards = [
    { id: 'all', class: '∞', title: "All Classes", description: "View the complete library of STEM games", subjects: ["All Subjects"], color: "bg-slate-800" },
    { id: '6', class: 6, title: "Class 6 - Discovery", description: "Fundamental scientific and math principles", subjects: ["Math", "Science"], color: "bg-blue-500" },
    { id: '7', class: 7, title: "Class 7 - Analysis", description: "Algebraic thinking and biological observations", subjects: ["Math", "Biology"], color: "bg-indigo-500" },
    { id: '8', class: 8, title: "Class 8 - Exploration", description: "Geometric concepts and chemical reactions", subjects: ["Math", "Chemistry"], color: "bg-purple-500" },
    { id: '9', class: 9, title: "Class 9 - Master", description: "Advanced algebra and fundamental physics", subjects: ["Math", "Physics"], color: "bg-fuchsia-500" },
    { id: '10', class: 10, title: "Class 10 - Excellence", description: "Trigonometry and complex chemical equations", subjects: ["Math", "Chemistry"], color: "bg-pink-500" },
    { id: '11', class: 11, title: "Class 11 - Expert", description: "Calculus basics and advanced physics concepts", subjects: ["Math", "Physics"], color: "bg-rose-500" },
    { id: '12', class: 12, title: "Class 12 - Professional", description: "Integration and complex scientific theories", subjects: ["Math", "Science"], color: "bg-red-500" },

  ];


  const gameCategories = [
    {
      id: 'mathematics',
      icon: <Calculator className="h-8 w-8" />,
      color: 'bg-green-500',
      title: 'Mathematics Games',
      description: 'Master numbers, equations and geometric concepts',
      games: [
        {
          id: 'number-quest',
          title: 'Number Quest',
          description: 'Master arithmetic through adventure',
          difficulty: 'easy',
          duration: '15 min',
          points: 100,
          unlocked: true,
          classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'algebra-adventure',
          title: 'Algebra Adventure',
          description: 'Solve equations to unlock treasures',
          difficulty: 'medium',
          duration: '20 min',
          points: 150,
          unlocked: true,
          classes: ['6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'fraction-pizza',
          title: 'Fraction Pizza',
          description: 'Learn fractions by making delicious pizzas',
          difficulty: 'easy',
          duration: '12 min',
          points: 80,
          unlocked: true,
          classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'geometry-builder',
          title: 'Geometry Builder',
          description: 'Build structures using geometric shapes',
          difficulty: 'hard',
          duration: '25 min',
          points: 200,
          unlocked: true,
          classes: ['7', '8', '9', '10', '11', '12']

        },
        {
          id: 'basic-arithmetic',
          title: 'Math Speedster',
          description: 'Quick arithmetic challenges and mental math',
          difficulty: 'easy',
          duration: '10 min',
          points: 75,
          unlocked: true,
          classes: ['6']
        },
        {
          id: 'pattern-master',
          title: 'Pattern Master',
          description: 'Discover and complete number patterns',
          difficulty: 'medium',
          duration: '18 min',
          points: 130,
          unlocked: true,
          classes: ['6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'graph-explorer',
          title: 'Graph Explorer',
          description: 'Navigate coordinate planes and create graphs',
          difficulty: 'hard',
          duration: '30 min',
          points: 220,
          unlocked: true,
          classes: ['7', '8', '9', '10', '11', '12']

        },
        {
          id: 'probability-casino',
          title: 'Probability Casino',
          description: 'Learn probability through fun casino games',
          difficulty: 'medium',
          duration: '22 min',
          points: 160,
          unlocked: true,
          classes: ['6', '7', '8', '9', '10', '11', '12']

        }
      ]
    },
    {
      id: 'science',
      icon: <FlaskConical className="h-8 w-8" />,
      color: 'bg-green-500',
      title: 'Science Laboratory',
      description: 'Explore physics, chemistry, and biology through experiments',
      games: [
        {
          id: 'chemistry-lab',
          title: 'Virtual Chemistry Lab',
          description: 'Conduct safe virtual experiments',
          difficulty: 'medium',
          duration: '30 min',
          points: 175,
          unlocked: true,
          classes: ['6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'biology-explorer',
          title: 'Biology Explorer',
          description: 'Journey through living systems',
          difficulty: 'hard',
          duration: '35 min',
          points: 225,
          unlocked: true,
          classes: ['7', '8', '9', '10', '11', '12']

        },
        {
          id: 'solar-system',
          title: 'Solar System Adventure',
          description: 'Explore planets and space phenomena',
          difficulty: 'medium',
          duration: '25 min',
          points: 180,
          unlocked: true,
          classes: ['6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'atom-builder',
          title: 'Atom Builder',
          description: 'Build atoms and understand atomic structure',
          difficulty: 'hard',
          duration: '28 min',
          points: 200,
          unlocked: true,
          classes: ['7', '8', '9', '10', '11', '12']

        },
        {
          id: 'ecosystem-manager',
          title: 'Ecosystem Manager',
          description: 'Balance nature and manage ecosystems',
          difficulty: 'medium',
          duration: '32 min',
          points: 190,
          unlocked: true,
          classes: ['6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'weather-wizard',
          title: 'Weather Wizard',
          description: 'Predict weather patterns and understand climate',
          difficulty: 'easy',
          duration: '18 min',
          points: 110,
          unlocked: true,
          classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'periodic-table',
          title: 'Periodic Table Quest',
          description: 'Master elements and chemical properties',
          difficulty: 'hard',
          duration: '40 min',
          points: 250,
          unlocked: true,
          classes: ['7', '8', '9', '10', '11', '12']

        }
      ]
    },
    {
      id: 'technology',
      icon: <Laptop className="h-8 w-8" />,
      color: 'bg-emerald-500',
      title: 'Technology & Coding',
      description: 'Learn programming, digital skills, and computer science',
      games: [
        {
          id: 'code-creator',
          title: 'Code Creator',
          description: 'Learn programming basics',
          difficulty: 'easy',
          duration: '25 min',
          points: 150,
          unlocked: true,
          classes: ['9', '10', '11', '12']

        },
        {
          id: 'digital-citizen',
          title: 'Digital Citizen',
          description: 'Learn internet safety and ethics',
          difficulty: 'easy',
          duration: '15 min',
          points: 100,
          unlocked: true,
          classes: ['9', '10', '11', '12']

        },
        {
          id: 'app-architect',
          title: 'App Architect',
          description: 'Design and build mobile apps',
          difficulty: 'hard',
          duration: '40 min',
          points: 250,
          unlocked: true,
          classes: ['9', '10', '11', '12']

        },
        {
          id: 'algorithm-arena',
          title: 'Algorithm Arena',
          description: 'Master sorting and searching algorithms',
          difficulty: 'hard',
          duration: '35 min',
          points: 230,
          unlocked: true,
          classes: ['9', '10', '11', '12']

        },
        {
          id: 'web-designer',
          title: 'Web Designer',
          description: 'Create beautiful websites with HTML/CSS',
          difficulty: 'medium',
          duration: '30 min',
          points: 180,
          unlocked: true,
          classes: ['9', '10', '11', '12']

        },
        {
          id: 'database-detective',
          title: 'Database Detective',
          description: 'Learn data management and SQL queries',
          difficulty: 'medium',
          duration: '28 min',
          points: 170,
          unlocked: true,
          classes: ['9', '10', '11', '12']

        },
        {
          id: 'ai-trainer',
          title: 'AI Trainer',
          description: 'Train simple AI models and understand machine learning',
          difficulty: 'hard',
          duration: '45 min',
          points: 280,
          unlocked: true,
          classes: ['9', '10', '11', '12']

        }
      ]
    },

    {
      id: 'engineering',
      icon: <Hammer className="h-8 w-8" />,
      color: 'bg-teal-500',
      title: 'Engineering & Design',
      description: 'Build, design, and solve engineering challenges',
      games: [
        {
          id: 'bridge-builder',
          title: 'Bridge Builder',
          description: 'Design and test bridge structures',
          difficulty: 'medium',
          duration: '30 min',
          points: 180,
          unlocked: true,
          classes: ['6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'simple-machines',
          title: 'Simple Machines',
          description: 'Learn about levers, pulleys, and gears',
          difficulty: 'easy',
          duration: '20 min',
          points: 130,
          unlocked: true,
          classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'circuit-master',
          title: 'Circuit Master',
          description: 'Build electronic circuits',
          difficulty: 'hard',
          duration: '35 min',
          points: 220,
          unlocked: true,
          classes: ['7', '8', '9', '10', '11', '12']

        },
        {
          id: 'green-engineer',
          title: 'Green Engineer',
          description: 'Design sustainable solutions',
          difficulty: 'medium',
          duration: '25 min',
          points: 170,
          unlocked: true,
          classes: ['6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'rocket-designer',
          title: 'Rocket Designer',
          description: 'Build rockets and explore space physics',
          difficulty: 'hard',
          duration: '40 min',
          points: 240,
          unlocked: true,
          classes: ['7', '8', '9', '10', '11', '12']

        },
        {
          id: 'city-planner',
          title: 'City Planner',
          description: 'Design efficient and sustainable cities',
          difficulty: 'medium',
          duration: '35 min',
          points: 200,
          unlocked: true,
          classes: ['6', '7', '8', '9', '10', '11', '12']

        },
        {
          id: 'robot-builder',
          title: 'Robot Builder',
          description: 'Program and control virtual robots',
          difficulty: 'hard',
          duration: '38 min',
          points: 260,
          unlocked: true,
          classes: ['7', '8', '9', '10', '11', '12']

        },
        {
          id: 'material-tester',
          title: 'Material Tester',
          description: 'Test material properties and strength',
          difficulty: 'medium',
          duration: '22 min',
          points: 150,
          unlocked: true,
          classes: ['6', '7', '8', '9', '10', '11', '12']

        }
      ]
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGameStatus = (gameId) => {
    const progress = getGameProgress(gameId);
    return progress;
  };

  return (
    <div className="min-h-screen bg-background">      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-1">
            Official UDAYA Curriculum
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Gamified <span className="text-primary">STEM</span> Learning
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose your grade level to access curated interactive games and challenges.
          </p>
        </div>

        {/* Grade Cards Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Pick Your Class
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {classCards.map((card) => (
              <Card 
                key={card.id} 
                className={`group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 ${
                  selectedClass === card.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
                }`}
                onClick={() => {
                  setSelectedClass(card.id);
                  document.getElementById('games-display')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {card.class}
                    </div>
                    {selectedClass === card.id && (
                      <CheckCircle className="h-6 w-6 text-primary animate-in zoom-in" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {card.subjects.map(s => (
                      <Badge key={s} variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant={selectedClass === card.id ? "default" : "outline"} 
                    className="w-full font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    {selectedClass === card.id ? 'Viewing Games' : 'Browse Games'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Games Section */}
        <div id="games-display" className="scroll-mt-24 space-y-12">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Gamepad2 className="h-8 w-8 text-primary" />
              {selectedClass === 'all' ? 'All Learning Games' : `Class ${selectedClass} Games`}
            </h2>
            <Badge variant="outline" className="text-lg px-4 py-1 border-2 border-primary/20">
              {gameCategories.flatMap(c => c.games.filter(g => selectedClass === 'all' || g.classes.includes(selectedClass))).length} Available
            </Badge>
          </div>

          {gameCategories.map((category) => {
            const filteredGames = category.games.filter(g => selectedClass === 'all' || g.classes.includes(selectedClass));
            if (filteredGames.length === 0) return null;

            return (
              <div key={category.id} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`${category.color} text-white p-4 rounded-2xl shadow-lg`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{category.title}</h3>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredGames.map((game) => {
                    const gameStatus = getGameStatus(game.id);
                    const isCompleted = gameStatus && gameStatus.completed;
                    const currentScore = gameStatus?.score || 0;

                    return (
                      <Card key={game.id} className={`hover:shadow-lg hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-green-950/20 dark:to-black/60 ${!game.unlocked ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {game.title}
                                {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {!game.unlocked && <Badge variant="secondary" className="text-[10px] py-0">Soon</Badge>}
                              </CardTitle>
                              <CardDescription className="mt-1 text-sm">
                                {game.description}
                              </CardDescription>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge className={getDifficultyColor(game.difficulty)}>
                              <Target className="h-3 w-3 mr-1" />
                              {game.difficulty.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {game.duration}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {game.points} pts
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          {gameStatus && gameStatus.progress > 0 && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{Math.round(gameStatus.progress)}%</span>
                              </div>
                              <Progress value={gameStatus.progress} className="h-2" />
                            </div>
                          )}

                          {currentScore > 0 && (
                            <div className="flex items-center justify-between text-sm mb-4">
                              <span className="text-muted-foreground">High Score:</span>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{currentScore}</span>
                              </div>
                            </div>
                          )}

                          <Button 
                            className="w-full text-white border-0 bg-green-600 hover:bg-green-700 font-bold" 
                            disabled={!game.unlocked}
                            asChild={game.unlocked}
                          >
                            {game.unlocked ? (
                              <Link href={`/games/${category.id}/${game.id}`}>
                                <Play className="h-4 w-4 mr-2 text-white" />
                                {isCompleted ? 'Play Again' : 'Start Game'}
                              </Link>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 mr-2" />
                                Coming Soon
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}