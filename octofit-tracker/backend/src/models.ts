import mongoose, { Schema } from 'mongoose'

const fitnessLevels = ['beginner', 'intermediate', 'advanced'] as const
const activityTypes = ['running', 'walking', 'strength', 'cycling', 'other'] as const

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  fitnessLevel: { type: String, enum: fitnessLevels, default: 'beginner' },
  team: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
}, { timestamps: true })

const teamSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true, default: '' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: activityTypes, required: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  distanceKm: { type: Number, min: 0 },
  points: { type: Number, min: 0, default: 0 },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true })

const workoutSchema = new Schema({
  title: { type: String, required: true, trim: true },
  activityType: { type: String, enum: activityTypes, required: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  fitnessLevel: { type: String, enum: fitnessLevels, required: true },
  description: { type: String, required: true, trim: true },
}, { timestamps: true })

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema)
export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema)
export const Workout = mongoose.models.Workout || mongoose.model('Workout', workoutSchema)

export { activityTypes, fitnessLevels }