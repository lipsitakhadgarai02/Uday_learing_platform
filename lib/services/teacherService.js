import { supabase } from '@/lib/supabase';

export async function getTeacherClassStats() {
    // In a real app, you'd filter by teacher's class or school
    // For now, we'll get stats for all students
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('total_points, level, streak')
        .eq('role', 'student');

    if (error) throw error;

    const { count: assignmentsCount, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true });

    if (assignmentsError) throw assignmentsError;

    const totalStudents = profiles.length;
    // Average progress based on level (assuming level 10 is 100%)
    const averageProgress = totalStudents > 0 
        ? Math.round(profiles.reduce((acc, p) => acc + Math.min((p.level || 1) * 10, 100), 0) / totalStudents)
        : 0;

    return {
        totalStudents,
        activeThisWeek: profiles.filter(p => p.streak > 0).length,
        averageProgress,
        assignmentsCompleted: assignmentsCount || 0
    };
}

export async function getRecentStudentActivity() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('updated_at', { ascending: false })
        .limit(10);

    if (error) throw error;
    
    return profiles.map(p => ({
        id: p.id,
        name: p.name || 'Student',
        lastActive: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Recently',
        progress: Math.min(Math.round((p.total_points || 0) / 10), 100),
        currentLevel: p.level || 1,
        gamesCompleted: Math.floor((p.total_points || 0) / 100),
        status: (p.streak || 0) > 0 ? 'active' : 'inactive'
    }));
}

export async function createAssignment(assignmentData) {
    const { data, error } = await supabase
        .from('assignments')
        .insert([assignmentData])
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function getAssignments() {
    const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}
