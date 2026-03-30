"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users,
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  Bell,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from 'recharts';
import { getTeacherClassStats, getRecentStudentActivity, getAssignments, createAssignment } from '@/lib/services/teacherService';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  const router = useRouter();

  const [classStats, setClassStats] = useState({
    totalStudents: 0,
    activeThisWeek: 0,
    averageProgress: 0,
    assignmentsCompleted: 0
  });

  const [recentStudents, setRecentStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New Assignment Form State
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    due_date: '',
    points_reward: 50
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [stats, activity, assignmentList] = await Promise.all([
        getTeacherClassStats(),
        getRecentStudentActivity(),
        getAssignments()
      ]);
      setClassStats(stats);
      setRecentStudents(activity);
      setAssignments(assignmentList);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInitializing) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user && user.role !== 'teacher' && user.role !== 'admin') {
      router.push('/student');
      return;
    }

    fetchData();
  }, [isInitializing, isAuthenticated, user, router]);


  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title) {
        toast.error("Title is required");
        return;
    }

    try {
        await createAssignment({
            ...newAssignment,
            teacher_id: user.id
        });
        toast.success("Assignment created!");
        setIsCreateModalOpen(false);
        setNewAssignment({
            title: '',
            description: '',
            subject: '',
            due_date: '',
            points_reward: 50
        });
        fetchData(); // Refresh list
    } catch (error) {
        toast.error("Failed to create assignment");
    }
  };

  const studentProgress = [
    { name: 'Week 1', Mathematics: 65, Science: 70, Technology: 45, Engineering: 55 },
    { name: 'Week 2', Mathematics: 68, Science: 75, Technology: 52, Engineering: 60 },
    { name: 'Week 3', Mathematics: 72, Science: 78, Technology: 58, Engineering: 65 },
    { name: 'Week 4', Mathematics: 75, Science: 82, Technology: 62, Engineering: 68 },
    { name: 'Week 5', Mathematics: 78, Science: 85, Technology: 68, Engineering: 72 },
  ];

  const subjectDistribution = [
    { name: 'Mathematics', value: 35, color: '#3B82F6' },
    { name: 'Science', value: 28, color: '#10B981' },
    { name: 'Technology', value: 22, color: '#8B5CF6' },
    { name: 'Engineering', value: 15, color: '#F59E0B' }
  ];

  const upcomingAssignments = [
    {
      id: 1,
      title: 'Mathematics Quiz - Algebra Basics',
      dueDate: '2024-01-25',
      studentsAssigned: 28,
      submitted: 15,
      subject: 'Mathematics'
    },
    {
      id: 2,
      title: 'Science Experiment - Chemical Reactions',
      dueDate: '2024-01-27',
      studentsAssigned: 28,
      submitted: 8,
      subject: 'Science'
    },
    {
      id: 3,
      title: 'Technology Project - Basic Programming',
      dueDate: '2024-01-20',
      studentsAssigned: 28,
      submitted: 3,
      subject: 'Technology'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-yellow-600 bg-yellow-100';
      case 'struggling':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'inactive':
        return <Clock className="h-4 w-4" />;
      case 'struggling':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('teacher.dashboard')}, {user?.name || user?.fullName || 'Teacher'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Monitor your students' progress and manage your class effectively
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{classStats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active This Week</p>
                  <p className="text-2xl font-bold">{classStats.activeThisWeek}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Progress</p>
                  <p className="text-2xl font-bold">{classStats.averageProgress}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assignments Done</p>
                  <p className="text-2xl font-bold">{classStats.assignmentsCompleted}</p>
                </div>
                <Award className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Class Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Class Progress Over Time
                  </CardTitle>
                  <CardDescription>
                    Weekly progress across all STEM subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={studentProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="Mathematics" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="Science" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="Technology" stroke="#8B5CF6" strokeWidth={2} />
                      <Line type="monotone" dataKey="Engineering" stroke="#F59E0B" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Subject Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Learning Activity Distribution
                  </CardTitle>
                  <CardDescription>
                    Student engagement by subject this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={subjectDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subjectDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Student Activity
                </CardTitle>
                <CardDescription>
                  Latest updates from your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Level {student.currentLevel} • {student.gamesCompleted} games completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{student.progress}% complete</p>
                          <p className="text-xs text-muted-foreground">Last active: {student.lastActive}</p>
                        </div>
                        <Badge className={getStatusColor(student.status)}>
                          {getStatusIcon(student.status)}
                          <span className="ml-1 capitalize">{student.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Management</CardTitle>
                    <CardDescription>
                      View and manage your students' progress
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-semibold">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Level {student.currentLevel} • {student.gamesCompleted} games
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(student.status)}>
                          {getStatusIcon(student.status)}
                          <span className="ml-1 capitalize">{student.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          Last active: {student.lastActive}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Assignment Management</CardTitle>
                    <CardDescription>
                      Create and track student assignments
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Assignment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Assignment</DialogTitle>
                        <DialogDescription>
                          Assign a new task to all students in your class.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateAssignment}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input 
                                id="title" 
                                value={newAssignment.title} 
                                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})} 
                                placeholder="Mathematics Quiz..." 
                                required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="subject">Subject</Label>
                            <UISelect 
                                value={newAssignment.subject} 
                                onValueChange={(v) => setNewAssignment({...newAssignment, subject: v})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                                    <SelectItem value="Science">Science</SelectItem>
                                    <SelectItem value="Technology">Technology</SelectItem>
                                    <SelectItem value="Engineering">Engineering</SelectItem>
                                </SelectContent>
                            </UISelect>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea 
                                id="description" 
                                value={newAssignment.description} 
                                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})} 
                                placeholder="Describe the task..." 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="due_date">Due Date</Label>
                              <Input 
                                id="due_date" 
                                type="date" 
                                value={newAssignment.due_date} 
                                onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})} 
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="points">Points Reward</Label>
                              <Input 
                                id="points" 
                                type="number" 
                                value={newAssignment.points_reward} 
                                onChange={(e) => setNewAssignment({...newAssignment, points_reward: parseInt(e.target.value)})} 
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Create Assignment</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.length > 0 ? assignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Due: {assignment.due_date || 'No date'} • Subject: {assignment.subject || 'STEM'}
                          </p>
                        </div>
                        <Badge variant="outline">
                          0/{classStats.totalStudents} submitted
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Submission Progress</span>
                          <span>0%</span>
                        </div>
                        <Progress 
                          value={0} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Submissions
                        </Button>
                        <Button variant="outline" size="sm">
                          Send Reminder
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                          Delete
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                      <p className="text-muted-foreground mb-4">No assignments created yet</p>
                      <Button variant="outline">Create your first assignment</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Class Performance Trends</CardTitle>
                  <CardDescription>
                    Monthly performance comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={studentProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="Mathematics" fill="#3B82F6" />
                      <Bar dataKey="Science" fill="#10B981" />
                      <Bar dataKey="Technology" fill="#8B5CF6" />
                      <Bar dataKey="Engineering" fill="#F59E0B" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Insights</CardTitle>
                  <CardDescription>
                    Key insights about your class
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Strong Performance</span>
                    </div>
                    <p className="text-sm text-green-700">
                      85% of students are consistently completing assignments on time
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Needs Attention</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Technology subject has lower engagement. Consider adding more interactive content
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Trending Up</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Science scores have improved by 15% over the last month
                    </p>
                  </div>

                  <Button variant="outline" className="w-full">
                    Generate Detailed Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}