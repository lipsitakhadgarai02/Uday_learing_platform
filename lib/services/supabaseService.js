import { supabase } from '@/lib/supabase';

// Profiles
export async function createProfile(userId, profileData) {
    const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, ...profileData }])
        .select()
        .single();

    if (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
    return data;
}

export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
    return data;
}

// Leaderboard
export async function saveScore(userId, score) {
    const { data, error } = await supabase
        .from('leaderboard')
        .insert([{ user_id: userId, score }])
        .select();

    if (error) {
        console.error('Error saving score:', error);
        throw error;
    }
    return data;
}

export async function getLeaderboard(limit = 10) {
    const { data, error } = await supabase
        .from('leaderboard')
        .select('score, created_at, profiles(name, profileImage, grade)')
        .order('score', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
    return data;
}
