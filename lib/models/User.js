import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    // Accept Supabase UUIDs as strings
    _id: { type: String },
    name: { type: String, default: 'User' },
    profileImage: { type: String, default: null },
    grade: { type: String, default: null },
    role: { type: String, default: 'student' }
}, {
    timestamps: true,
    _id: false // Allow custom string _id if needed, but defining _id above works
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
