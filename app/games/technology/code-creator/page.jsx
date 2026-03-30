"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Trophy, 
  Star, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Code,
  Play,
  Bug,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';
import confetti from 'canvas-confetti';

export default function CodeCreator() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updateGameProgress, addPoints } = useGameStore();

  // Game State
  const [gameState, setGameState] = useState('menu'); // menu, playing, completed
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);

  const challenges = [
    {
      id: 1,
      title: "C: Hello World",
      description: "In C, we use 'printf' to show text. Write a program that prints 'Hello, World!'",
      difficulty: "easy",
      expectedOutput: "Hello, World!",
      starterCode: "#include <stdio.h>\n\nint main() {\n    // Write your printf code here\n    \n    return 0;\n}",
      hint: "Use printf(\"Hello, World!\");",
      class: "6"
    },
    {
      id: 2,
      title: "C: Basic Addition",
      description: "Create a variable 'sum' and set it to 10 + 20. Then print the result using %d.",
      difficulty: "easy",
      expectedOutput: "30",
      starterCode: "#include <stdio.h>\n\nint main() {\n    int num1 = 10;\n    int num2 = 20;\n    int sum;\n    // Calculate sum and print it\n    \n    return 0;\n}",
      hint: "sum = num1 + num2; printf(\"%d\", sum);",
      class: "6"
    },
    {
      id: 3,
      title: "C: Conditional Logic",
      description: "Use an 'if' statement to check if 15 is greater than 10. If true, print 'Greater'.",
      difficulty: "medium",
      expectedOutput: "Greater",
      starterCode: "#include <stdio.h>\n\nint main() {\n    int a = 15;\n    int b = 10;\n    // Add if statement here\n    \n    return 0;\n}",
      hint: "if (a > b) { printf(\"Greater\"); }",
      class: "7"
    },
    {
      id: 4,
      title: "C: For Loops",
      description: "Use a 'for' loop to print numbers from 1 to 3, each on a new line.",
      difficulty: "medium",
      expectedOutput: "1\n2\n3",
      starterCode: "#include <stdio.h>\n\nint main() {\n    // Use a for loop here\n    \n    return 0;\n}",
      hint: "for(int i=1; i<=3; i++) { printf(\"%d\\n\", i); }",
      class: "7"
    },
    {
      id: 5,
      title: "C: Functions",
      description: "Write a function 'square' that returns the square of 5. Print the result.",
      difficulty: "hard",
      expectedOutput: "25",
      starterCode: "#include <stdio.h>\n\nint square(int n) {\n    return n * n;\n}\n\nint main() {\n    // Call square function and print result\n    \n    return 0;\n}",
      hint: "printf(\"%d\", square(5));",
      class: "8"
    }
  ];

  const currentChall = challenges[currentChallenge];

  // Initialize game
  const startGame = () => {
    setGameState('playing');
    setCurrentChallenge(0);
    setScore(0);
    setTimeLeft(1200);
    setCode(challenges[0].starterCode);
    setOutput('');
    setError('');
    setShowResult(false);
    setChallengeComplete(false);
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Initialize starter code when challenge changes
  useEffect(() => {
    if (currentChall && gameState === 'playing') {
      setCode(currentChall.starterCode);
      setOutput('');
      setError('');
      setShowResult(false);
      setChallengeComplete(false);
    }
  }, [currentChallenge, gameState]);

  // Real C code execution using Piston API
  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');
    setShowResult(false);

    try {

      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'c',
          version: '*', // Use '*' to get the latest available C version
          files: [{ content: code }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      const runResult = data.run;
      
      if (runResult.stderr) {
        setError(runResult.stderr);
        setOutput(runResult.stdout);
      } else {
        const cleanOutput = runResult.stdout.trim();
        setOutput(cleanOutput);
        const isCorrect = cleanOutput === currentChall.expectedOutput.trim();
        setShowResult(true);
        setChallengeComplete(isCorrect);
        
        if (isCorrect) {
          const points = currentChall.difficulty === 'easy' ? 100 : currentChall.difficulty === 'medium' ? 200 : 300;
          setScore(prev => prev + points);
          
          // Sync to store for real-time progress
          updateGameProgress('code-creator', { score: points, completed: true });
          
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
          });
        }
      }
    } catch (err) {
      console.error("Piston API Error:", err);
      setError("Execution Error: " + (err.message || "Please check your internet connection and try again."));
    } finally {
      setIsRunning(false);
    }

  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameState('completed');
    
    // Update game progress
    const progress = ((currentChallenge + (challengeComplete ? 1 : 0)) / challenges.length) * 100;
    const gameData = {
      gameId: 'code-creator',
      progress: Math.min(progress, 100),
      score: score,
      completed: progress >= 100,
      lastPlayed: new Date().toISOString()
    };
    
    updateGameProgress('code-creator', gameData);
    addPoints(score);

    if (progress >= 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push('/games')} className="text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
          
          {gameState === 'playing' && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-bold">{score}</span>
              </div>
            </div>
          )}
        </div>

        {/* Game Menu */}
        {gameState === 'menu' && (
          <div className="text-center max-w-2xl mx-auto py-12">
            <div className="mb-12">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-3xl w-24 h-24 mx-auto mb-6 shadow-xl shadow-blue-500/20">
                <Code className="h-full w-full text-white" />
              </div>
              <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                C Language Creator
              </h1>
              <p className="text-xl text-slate-400">
                Master the world's most powerful programming language through interactive missions.
              </p>
            </div>
            
            <Card className="mb-12 bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Your Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-left space-y-4 text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg"><Terminal className="h-5 w-5 text-blue-400" /></div>
                  <span>Complete {challenges.length} real C coding challenges</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-lg"><Play className="h-5 w-5 text-green-400" /></div>
                  <span>Write and compile real code in our cloud sandbox</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/10 p-2 rounded-lg"><Trophy className="h-5 w-5 text-yellow-400" /></div>
                  <span>Unlock points and earn the "C Master" badge</span>
                </div>
              </CardContent>
            </Card>

            <Button size="lg" onClick={startGame} className="px-12 py-6 text-lg bg-blue-600 hover:bg-blue-500 transition-all transform hover:scale-105 active:scale-95 rounded-2xl shadow-xl shadow-blue-600/20">
              Launch Simulator
            </Button>
          </div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && currentChall && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm uppercase tracking-widest text-blue-400 font-bold">
                        Mission {currentChallenge + 1}
                    </span>
                    <h2 className="text-2xl font-bold">{currentChall.title}</h2>
                </div>
                <Badge className={`${
                  currentChall.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' : 
                  currentChall.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                } border-0 px-3 py-1`}>
                  {currentChall.difficulty.toUpperCase()}
                </Badge>
              </div>
              <Progress 
                value={((currentChallenge) / challenges.length) * 100} 
                className="h-1.5 bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
              {/* Challenge Description */}
              <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                <Card className="bg-slate-900 border-slate-800 h-full">
                    <CardHeader>
                    <CardTitle className="text-slate-100">Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-slate-300">
                    <p className="text-lg leading-relaxed">
                        {currentChall.description}
                    </p>
                    
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Expected Output</h4>
                        <pre className="font-mono text-cyan-400">
                        {currentChall.expectedOutput}
                        </pre>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-300 mb-2">
                            <Bug className="h-4 w-4" /> Hint
                        </h4>
                        <p className="text-sm italic">
                        {currentChall.hint}
                        </p>
                    </div>
                    
                    {showResult && (
                        <div className={`p-4 rounded-xl flex items-start gap-4 ${challengeComplete ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {challengeComplete ? <CheckCircle className="h-6 w-6 shrink-0" /> : <XCircle className="h-6 w-6 shrink-0" />}
                        <div>
                            <span className="font-bold block">{challengeComplete ? 'Mission Accomplished!' : 'Code Rejected'}</span>
                            <p className="text-sm mt-1">{challengeComplete ? 'Your code passed the compiler and produced correct output.' : 'The output did not match the expected result. Debug and try again.'}</p>
                        </div>
                        </div>
                    )}
                    
                    {challengeComplete && (
                        <Button onClick={nextChallenge} className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-lg rounded-xl">
                            {currentChallenge < challenges.length - 1 ? 'Next Mission' : 'Complete Assignment'} <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    )}
                    </CardContent>
                </Card>
              </div>

              {/* Code Editor */}
              <div className="flex flex-col gap-4">
                <Card className="bg-slate-900 border-slate-800 flex-1 flex flex-col">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5 mr-4">
                                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                            </div>
                            <span className="text-xs font-mono text-slate-500">main.c</span>
                        </div>
                        <Button 
                            onClick={runCode} 
                            disabled={isRunning || challengeComplete}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-500"
                        >
                            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                            Execute
                        </Button>
                    </div>
                    <CardContent className="p-0 flex-1 relative">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full p-6 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-blue-100"
                            spellCheck="false"
                            disabled={challengeComplete}
                        />
                    </CardContent>
                </Card>

                {/* Console Output */}
                <div className="h-40 bg-black rounded-xl border border-slate-800 overflow-hidden flex flex-col font-mono text-sm">
                    <div className="px-4 py-2 bg-slate-900 flex items-center gap-2 border-b border-slate-800">
                        <Terminal className="h-4 w-4 text-slate-500" />
                        <span className="text-xs text-slate-500">Console</span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                        {error ? (
                            <div className="text-red-400 whitespace-pre-wrap">{error}</div>
                        ) : output ? (
                            <div className="text-emerald-400 whitespace-pre-wrap">{output}</div>
                        ) : (
                            <div className="text-slate-700 italic">No output yet. Run your code to see results.</div>
                        )}
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Completed */}
        {gameState === 'completed' && (
          <div className="text-center max-w-2xl mx-auto py-12">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                <Trophy className="h-24 w-24 mx-auto text-yellow-500 relative" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Course Certified!</h1>
            <p className="text-slate-400 mb-12">You have successfully mastered the fundamentals of C programming.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[
                  { label: 'Score', value: score, color: 'text-yellow-500' },
                  { label: 'Completed', value: `${challenges.length}/${challenges.length}`, color: 'text-emerald-500' },
                  { label: 'Accuracy', value: '100%', color: 'text-cyan-500' },
                  { label: 'Time', value: formatTime(1200 - timeLeft), color: 'text-blue-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={startGame} variant="outline" className="px-8 border-slate-800 hover:bg-slate-900">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake Exam
              </Button>
              <Button onClick={() => router.push('/games')} className="px-8 bg-blue-600 hover:bg-blue-500">
                Return to Campus
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}