import express from 'express'
import cors from 'cors'
import './config/database.js'
import apiRouter from './routes.js'
import { startServer } from './server.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api', apiRouter)

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error)
  const status = typeof error === 'object' && error !== null && 'status' in error
    ? Number(error.status)
    : 500
  response.status(status).json({ error: status === 500 ? 'Internal server error' : 'Request failed' })
})

startServer(app)