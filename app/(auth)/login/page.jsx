'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ButtonLoader } from '@/components/ui/loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLoading } from '@/contexts/LoadingContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGameStore } from '@/stores/useGameStore';
import { Eye, EyeOff, Shield, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { FaBookOpen as BookOpen } from 'react-icons/fa';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, continueAsGuest } = useAuthStore();
  const { syncLocalDataToSupabase } = useGameStore();
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));

    // Clear role error when user selects a role
    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsLoading(true);
    startLoading('Authenticating...', 'dots', true);

    try {
      if (formData.email && formData.password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        // Sync local guest data to Supabase after successful login
        if (data?.user) {
          await syncLocalDataToSupabase(data.user.id);
        }

        toast.success(`Welcome back!`);
        
        // Ensure we stop any login-specific loading before letting the AuthContext take over
        stopLoading();
        router.push('/student');
      } else {
        toast.error('Please fill in all fields');
        stopLoading();
      }
    } catch (error) {
      console.error("DEBUG: Login Error:", error);
      const msg = error.message || 'Login failed';
      if (msg.toLowerCase().includes('email')) {
        toast.error(`${msg}. Make sure you have signed up and verified your email.`);
      } else {
        toast.error(msg);
      }
      stopLoading();
    } finally {
      setIsLoading(false);
    }


  };

  const handleGuestLogin = () => {
    continueAsGuest();
    toast.success('Continuing as Guest. Your progress will be saved locally!');
    router.push('/student');
  };

  const handleDemoLogin = async (role) => {
    setFormData({
      email: `demo.${role}@udaya.com`,
      password: 'demo123',
      role: role
    });

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `demo.${role}@udaya.com`,
        password: 'demo123',
      });

      if (error) {
        toast.error("Demo accounts require configuring Supabase. Please set up your .env.local and create demo users.");
        stopLoading();
        setIsLoading(false);
        return;
      }

      toast.success(`Welcome! Logged in as Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`);

      switch (role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'teacher':
          router.push('/teacher');
          break;
        default:
          router.push('/student');
      }
    } catch (err) {
      toast.error('Demo login failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex items-center justify-center p-4 rural-pattern">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">UDAYA</h1>
          <p className="text-muted-foreground">Empowering Rural Education Through Gaming</p>
        </div>

        <Card className="glass-effect shadow-xl">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to continue your STEM learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <ButtonLoader />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-primary/50 hover:bg-primary/5" 
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                Play as Guest
              </Button>
            </form>

            {/* Demo Login Button */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Quick Demo Access
              </p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('student')}
                  className="text-xs w-full max-w-xs"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  Try as Demo Student
                </Button>
              </div>
            </div>


            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}