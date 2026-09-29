import { Router, type NextFunction, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { Activity, Team, User, Workout, activityTypes, fitnessLevels } from './models.js'

const router = Router()
const jwtSecret = process.env.JWT_SECRET || 'octofit-development-secret-change-me'
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production')
}
type AuthRequest = Request & { userId?: string }

function publicUser(user: { id: string; username: string; email: string; fitnessLevel: string; team?: unknown }) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fitnessLevel: user.fitnessLevel,
    team: user.team ?? null,
  }
}

function authenticate(request: AuthRequest, response: Response, next: NextFunction) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) {
    response.status(401).json({ error: 'Authentication required' })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload
    if (typeof payload.sub !== 'string') throw new Error('Invalid token')
    request.userId = payload.sub
    next()
  } catch {
    response.status(401).json({ error: 'Invalid or expired token' })
  }
}

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)
}

router.post('/users', async (request, response) => {
  const { username, email, password, fitnessLevel } = request.body
  if (!username || !email || !password || String(password).length < 8) {
    response.status(400).json({ error: 'username, email, and a password of at least 8 characters are required' })
    return
  }
  if (fitnessLevel && !fitnessLevels.includes(fitnessLevel)) {
    response.status(400).json({ error: 'Invalid fitness level' })
    return
  }

  const user = await User.create({
    username,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    fitnessLevel,
  })
  const token = jwt.sign({}, jwtSecret, { subject: user.id, expiresIn: '7d' })
  response.status(201).json({ user: publicUser(user), token })
})

router.post('/auth/login', async (request, response) => {
  const user = await User.findOne({ email: String(request.body.email).toLowerCase() }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(String(request.body.password || ''), user.passwordHash))) {
    response.status(401).json({ error: 'Invalid email or password' })
    return
  }
  const token = jwt.sign({}, jwtSecret, { subject: user.id, expiresIn: '7d' })
  response.json({ user: publicUser(user), token })
})

router.get('/users', async (_request, response) => {
  response.json(await User.find().select('-passwordHash').populate('team', 'name'))
})

router.get('/users/:id', async (request, response) => {
  if (!isValidId(request.params.id)) {
    response.status(400).json({ error: 'Invalid user id' })
    return
  }
  const user = await User.findById(request.params.id).select('-passwordHash').populate('team', 'name')
  if (!user) {
    response.status(404).json({ error: 'User not found' })
    return
  }
  response.json(user)
})

router.patch('/users/:id', authenticate, async (request: AuthRequest, response) => {
  if (request.userId !== request.params.id) {
    response.status(403).json({ error: 'You can only update your own profile' })
    return
  }
  const updates: Record<string, unknown> = {}
  if (request.body.username) updates.username = request.body.username
  if (request.body.fitnessLevel) {
    if (!fitnessLevels.includes(request.body.fitnessLevel)) {
      response.status(400).json({ error: 'Invalid fitness level' })
      return
    }
    updates.fitnessLevel = request.body.fitnessLevel
  }
  const user = await User.findByIdAndUpdate(request.params.id, updates, { new: true, runValidators: true })
    .select('-passwordHash')
    .populate('team', 'name')
  if (!user) {
    response.status(404).json({ error: 'User not found' })
    return
  }
  response.json(user)
})

router.get('/teams', async (_request, response) => {
  response.json(await Team.find().populate('members', 'username'))
})

router.post('/teams', authenticate, async (request: AuthRequest, response) => {
  const name = String(request.body.name || '').trim()
  if (!name) {
    response.status(400).json({ error: 'Team name is required' })
    return
  }
  const team = await Team.create({ name, description: request.body.description || '', members: [request.userId] })
  await User.findByIdAndUpdate(request.userId, { team: team.id })
  response.status(201).json(team)
})

router.post('/teams/:id/members', authenticate, async (request: AuthRequest, response) => {
  if (!isValidId(request.params.id)) {
    response.status(400).json({ error: 'Invalid team id' })
    return
  }
  const team = await Team.findByIdAndUpdate(
    request.params.id,
    { $addToSet: { members: request.userId } },
    { new: true, runValidators: true },
  ).populate('members', 'username')
  if (!team) {
    response.status(404).json({ error: 'Team not found' })
    return
  }
  await User.findByIdAndUpdate(request.userId, { team: team.id })
  response.json(team)
})

router.get('/activities', async (request, response) => {
  const filter = request.query.userId && isValidId(String(request.query.userId))
    ? { user: request.query.userId }
    : {}
  response.json(await Activity.find(filter).populate('user', 'username').sort({ completedAt: -1 }))
})

router.post('/activities', authenticate, async (request: AuthRequest, response) => {
  const { type, durationMinutes, distanceKm } = request.body
  if (!activityTypes.includes(type) || !Number.isFinite(Number(durationMinutes)) || Number(durationMinutes) < 1) {
    response.status(400).json({ error: 'A valid activity type and positive durationMinutes are required' })
    return
  }
  const activity = await Activity.create({
    user: request.userId,
    type,
    durationMinutes: Number(durationMinutes),
    distanceKm: distanceKm === undefined ? undefined : Number(distanceKm),
    points: Math.round(Number(durationMinutes)),
  })
  response.status(201).json(await activity.populate('user', 'username'))
})

router.get('/leaderboard', async (_request, response) => {
  const leaderboard = await Activity.aggregate([
    { $group: { _id: '$user', points: { $sum: '$points' }, activities: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { _id: 0, userId: '$user._id', username: '$user.username', points: 1, activities: 1 } },
    { $sort: { points: -1, username: 1 } },
  ])
  response.json(leaderboard)
})

router.get('/workouts', async (request, response) => {
  const fitnessLevel = String(request.query.fitnessLevel || '')
  const filter = fitnessLevels.includes(fitnessLevel as typeof fitnessLevels[number])
    ? { fitnessLevel }
    : {}
  response.json(await Workout.find(filter).sort({ durationMinutes: 1 }))
})

router.get('/workouts/recommendations/:userId', async (request, response) => {
  if (!isValidId(request.params.userId)) {
    response.status(400).json({ error: 'Invalid user id' })
    return
  }
  const user = await User.findById(request.params.userId)
  if (!user) {
    response.status(404).json({ error: 'User not found' })
    return
  }
  const recentActivities = await Activity.find({ user: user.id }).sort({ completedAt: -1 }).limit(3)
  const recentTypes = new Set(recentActivities.map((activity) => activity.type))
  const recommendations = await Workout.find({ fitnessLevel: user.fitnessLevel })
    .sort({ durationMinutes: 1 })
    .limit(20)
  recommendations.sort((first, second) => Number(recentTypes.has(first.activityType)) - Number(recentTypes.has(second.activityType)))
  response.json(recommendations.slice(0, 5))
})

router.post('/workouts', authenticate, async (request, response) => {
  const workout = await Workout.create(request.body)
  response.status(201).json(workout)
})

router.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ error: error.message })
    return
  }
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    response.status(409).json({ error: 'A record with that unique value already exists' })
    return
  }
  response.status(500).json({ error: 'Internal server error' })
})

export default router