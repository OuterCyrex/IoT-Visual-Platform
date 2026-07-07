import { createServer } from 'node:http'
import { notFound, readJsonBody, sendJson } from './lib/http.ts'
import { forbidden, unauthorized } from './lib/http.ts'
import { roleHasPermission, verifyToken } from './lib/auth.ts'
import { getUserById, listRoles } from './lib/store.ts'
import { routes } from './routes/platform.ts'

const port = Number(process.env.API_PORT ?? 4000)
const host = process.env.API_HOST ?? '127.0.0.1'

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (!req.url || !req.method) {
    sendJson(res, 400, { message: 'Invalid request' })
    return
  }

  const url = new URL(req.url, `http://localhost:${port}`)
  const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readJsonBody(req) : undefined
  const authHeader = req.headers.authorization
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const tokenPayload = bearerToken ? verifyToken(bearerToken) : null
  const authUser = tokenPayload ? await getUserById(tokenPayload.userId) : null
  const roles = await listRoles()
  const authRole = roles?.find((role) => role.name === authUser?.role)

  for (const route of routes) {
    if (route.method !== req.method) {
      continue
    }

    const matched = url.pathname.match(route.pattern)
    if (!matched) {
      continue
    }

    try {
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

      await route.handler({
        req,
        res,
        url,
        params: matched.groups ?? {},
        body,
        authUser,
      })
    } catch (error) {
      sendJson(res, 500, {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      })
    }
    return
  }

  notFound(res)
})

server.listen(port, host, () => {
  console.log(`IoT Visual Platform API listening on http://${host}:${port}`)
})
