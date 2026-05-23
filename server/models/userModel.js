import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['customer', 'admin', 'artist', 'staff'], default: 'customer' },
    phone: { type: String },
    location: { type: String },
    bio: { type: String },
    authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
    refreshToken: { type: String },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
