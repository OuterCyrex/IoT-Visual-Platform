import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { forbidden, unauthorized } from './lib/http.ts'
import { roleHasPermission, verifyToken } from './lib/auth.ts'
import { getUserById, listRoles } from './lib/store.ts'
import { routes } from './routes/platform.ts'

const port = Number(process.env.API_PORT ?? 4000)
const host = process.env.API_HOST ?? '127.0.0.1'

const app = express()

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Parse JSON payloads
app.use(express.json())

// Standard morgan dev logging middleware
app.use(morgan('dev'))

// Register routes
for (const route of routes) {
  const method = route.method.toLowerCase()
  if (method !== 'get' && method !== 'post' && method !== 'put' && method !== 'delete' && method !== 'patch') {
    continue
  }

  app[method](route.pattern, async (req, res) => {
    const matched = req.path.match(route.pattern)
    const params = matched?.groups ?? {}
    const url = new URL(req.originalUrl, `http://localhost:${port}`)

    // Handle body compatibility (undefined if empty/no content)
    let body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined

    // Authenticate user
    const authHeader = req.headers.authorization
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
    const tokenPayload = bearerToken ? verifyToken(bearerToken) : null
    const authUser = tokenPayload ? await getUserById(tokenPayload.userId) : null
    const roles = await listRoles()
    const authRole = roles?.find((role) => role.name === authUser?.role)

    // Authorization
    if (route.permission) {
      if (!authUser) {
        unauthorized(res)
        return
      }
      if (authUser.status !== 'active') {
        forbidden(res, 'User is disabled')
        return
      }
      if (!roleHasPermission(authRole, route.permission)) {
        forbidden(res, `Missing permission: ${route.permission}`)
        return
      }
    }

    try {
      await route.handler({
        req,
        res,
        url,
        params,
        body,
        authUser,
      })
    } catch (error) {
      console.error(`[API Error] ${req.method} ${req.path}:`, error)
      res.status(500).json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  })
}

// Fallback 404 for unhandled requests
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.listen(port, host, () => {
  console.log(`IoT Visual Platform API listening on http://${host}:${port}`)
})

