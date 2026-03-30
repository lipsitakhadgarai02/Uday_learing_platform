import { supabase } from '@/lib/supabase';

// Profiles
export async function createProfile(userId, profileData) {
    console.log('Inserting profile for:', userId, profileData);
    const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, ...profileData }])
        .select()
        .single();

    if (error) {
        console.error('Error creating profile - Message:', error.message);
        console.error('Error creating profile - Code:', error.code);
        console.error('Error creating profile - Details:', error.details);
        console.error('Error creating profile - Hint:', error.hint);
        console.error('Full Error Object:', JSON.stringify(error));
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
        console.error('Error fetching profile - Message:', error.message);
        console.error('Error fetching profile - Code:', error.code);
        console.error('Error fetching profile - Details:', error.details);
        console.error('Error fetching profile - Hint:', error.hint);
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
        console.error('Error saving score - Message:', error.message);
        console.error('Error saving score - Code:', error.code);
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
        console.error('Error fetching leaderboard - Message:', error.message);
        console.error('Error fetching leaderboard - Code:', error.code);
        throw error;
    }
    return data;
}

// Admin
export async function getAllProfiles() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all profiles:', error);
        throw error;
    }
    return data;
}

export async function updateUserRole(userId, newRole) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
    return data;
}
