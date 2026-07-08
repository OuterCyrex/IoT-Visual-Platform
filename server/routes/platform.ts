import { hashPassword, issueToken, verifyPassword } from '../lib/auth.ts'
import type { RouteDefinition } from '../lib/http.ts'
import { badRequest, sendJson, sendNoContent, unauthorized } from '../lib/http.ts'
import { createMysqlConnectionForDataSource } from '../lib/mysql.ts'
import {
  countUsersByRole,
  createDataSource,
  createDataset,
  createProject,
  createProjectMembership,
  createRole,
  createSceneProject,
  createScreenProject,
  createUser,
  deleteDataSource,
  deleteDataset,
  deleteProject,
  deleteProjectMembership,
  deleteRole,
  deleteSceneProject,
  deleteScreenProject,
  deleteUser,
  findUserByUsername,
  getProjectMembership,
  getStorageStatus,
  getUserById,
  listDataSources,
  listDatasets,
  listProjectMemberships,
  listProjectMembershipsByProject,
  listProjectMembershipsByUser,
  listProjects,
  listRoles,
  listSceneProjects,
  listScreenProjects,
  listUsers,
  loadState,
  resetState,
  saveState,
  updateDataSource,
  updateDataset,
  updateProject,
  updateProjectMembership,
  updateRole,
  updateSceneProject,
  updateScreenProject,
  updateUser,
} from '../lib/store.ts'
import { createId, includesText, nowText, pickQuery } from '../lib/utils.ts'
import type {
  DataSource,
  Dataset,
  ManagedProject,
  PlatformState,
  PlatformUser,
  ProjectMembership,
  RoleDefinition,
  SceneProject,
  ScreenNode,
  ScreenProject,
} from '../types/platform.ts'

const sanitizeUser = (user: PlatformUser) => {
  const { passwordHash: _passwordHash, ...safeUser } = user
  return safeUser
}

class RouteValidationError extends Error { }

const isScreenNode = (value: unknown): value is ScreenNode => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const node = value as Record<string, unknown>
  return (
    typeof node.id === 'string' &&
    typeof node.x === 'number' &&
    Number.isFinite(node.x) &&
    typeof node.y === 'number' &&
    Number.isFinite(node.y) &&
    typeof node.w === 'number' &&
    Number.isFinite(node.w) &&
    typeof node.h === 'number' &&
    Number.isFinite(node.h) &&
    typeof node.component === 'string' &&
    !!node.props &&
    typeof node.props === 'object' &&
    !Array.isArray(node.props)
  )
}

const parseScreenNodes = (value: unknown): ScreenNode[] => {
  if (value == null) {
    return []
  }

  if (!Array.isArray(value) || !value.every(isScreenNode)) {
    throw new RouteValidationError('screenNodes must be an array of screen node objects')
  }

  return JSON.parse(JSON.stringify(value)) as ScreenNode[]
}

const getDataSourceOrThrow = async (dataSourceId: unknown) => {
  if (typeof dataSourceId !== 'string' || !dataSourceId.trim()) {
    throw new RouteValidationError('dataSourceId is required')
  }

  const source = ((await listDataSources()) ?? []).find((item) => item.id === dataSourceId)
  if (!source) {
    throw new RouteValidationError('Referenced data source does not exist')
  }

  if (source.type !== 'MySQL' && source.type !== 'REST') {
    throw new RouteValidationError('Only MySQL and REST data sources are supported for datasets')
  }

  return source
}

const normalizeMysqlObjectName = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new RouteValidationError('tableName is required')
  }

  const parts = value
    .trim()
    .split('.')
    .map((item) => item.trim())
    .filter(Boolean)

  if (!parts.length || parts.length > 2) {
    throw new RouteValidationError('tableName must be a table name or schema.table')
  }

  for (const part of parts) {
    if (!/^[A-Za-z0-9_]+$/.test(part)) {
      throw new RouteValidationError('tableName contains invalid characters')
    }
  }

  return parts
}

const isSuperAdmin = (user: PlatformUser | null | undefined) => user?.role === 'Super Admin'

const applyKeywordFilter = <T>(items: T[], keyword: string, fields: Array<(item: T) => string>) => {
  if (!keyword) {
    return items
  }

  return items.filter((item) => fields.some((field) => includesText(field(item), keyword)))
}

const routeCollection = <T>(collectionKey: keyof PlatformState, fields: Array<(item: T) => string>) => {
  const base = `/api/${String(collectionKey)}`
  const detailPattern = new RegExp(`^${base}/(?<id>[^/]+)$`)

  const listRoute: RouteDefinition = {
    method: 'GET',
    pattern: new RegExp(`^${base}$`),
    handler: async ({ res, url }) => {
      const state = await loadState()
      const keyword = pickQuery(url, 'keyword')
      const items = state[collectionKey] as T[]
      sendJson(res, 200, { items: applyKeywordFilter(items, keyword, fields) })
    },
  }

  const createRoute: RouteDefinition = {
    method: 'POST',
    pattern: new RegExp(`^${base}$`),
    handler: async ({ res, body }) => {
      if (!body || typeof body !== 'object') {
        return badRequest(res, 'Request body is required')
      }

      const state = await loadState()
      const item = {
        ...(body as Record<string, unknown>),
        id: createId(String(collectionKey).slice(0, 3)),
        updatedAt: nowText(),
      } as T

        ; (state[collectionKey] as T[]).unshift(item)
      saveState(state)
      sendJson(res, 201, { item })
    },
  }

  const updateRoute: RouteDefinition = {
    method: 'PUT',
    pattern: detailPattern,
    handler: async ({ res, params, body }) => {
      if (!body || typeof body !== 'object') {
        return badRequest(res, 'Request body is required')
      }

      const state = await loadState()
      const items = state[collectionKey] as unknown as Array<T & { id: string }>
      const index = items.findIndex((item) => item.id === params.id)
      if (index === -1) {
        return sendJson(res, 404, { message: 'Item not found' })
      }

      const updatedItem = {
        ...items[index],
        ...(body as Record<string, unknown>),
        updatedAt: nowText(),
      }

      items[index] = updatedItem
      saveState(state)
      sendJson(res, 200, { item: updatedItem })
    },
  }

  const deleteRoute: RouteDefinition = {
    method: 'DELETE',
    pattern: detailPattern,
    handler: async ({ res, params }) => {
      const state = await loadState()
      const items = state[collectionKey] as unknown as Array<T & { id: string }>
      const nextItems = items.filter((item) => item.id !== params.id)
      if (nextItems.length === items.length) {
        return sendJson(res, 404, { message: 'Item not found' })
      }

      ; (state[collectionKey] as unknown as Array<T & { id: string }>) = nextItems
      saveState(state)
      sendNoContent(res)
    },
  }

  return [listRoute, createRoute, updateRoute, deleteRoute]
}

const resourceRouteCollection = <T extends { id: string; updatedAt: string }>(options: {
  base: string
  list: () => Promise<T[] | undefined>
  create: (item: T) => Promise<T | undefined>
  update: (id: string, patch: Partial<T>) => Promise<T | null | undefined>
  remove?: (id: string) => Promise<boolean | undefined>
  fields: Array<(item: T) => string>
  buildCreateItem: (body: Record<string, unknown>) => Promise<T> | T
  normalizePatch?: (id: string, body: Record<string, unknown>) => Promise<Partial<T>> | Partial<T>
}) => {
  const detailPattern = new RegExp(`^${options.base}/(?<id>[^/]+)$`)

  const listRoute: RouteDefinition = {
    method: 'GET',
    pattern: new RegExp(`^${options.base}$`),
    permission: options.base.includes('users')
      ? 'user:read'
      : options.base.includes('projects')
        ? 'project:read'
        : options.base.includes('screenProjects')
          ? 'screen:read'
          : options.base.includes('sceneProjects')
            ? 'scene:read'
            : options.base.includes('dataSources')
              ? 'data-source:read'
              : 'dataset:read',
    handler: async ({ res, url }) => {
      const keyword = pickQuery(url, 'keyword')
      const items = (await options.list()) ?? []
      const filtered = applyKeywordFilter(items, keyword, options.fields)
      sendJson(
        res,
        200,
        {
          items:
            options.base === '/api/users'
              ? filtered.map((item) => sanitizeUser(item as unknown as PlatformUser))
              : filtered,
        },
      )
    },
  }

  const detailRoute: RouteDefinition = {
    method: 'GET',
    pattern: detailPattern,
    permission: listRoute.permission,
    handler: async ({ res, params }) => {
      const items = (await options.list()) ?? []
      const item = items.find((entry) => entry.id === params.id)
      if (!item) {
        return sendJson(res, 404, { message: 'Item not found' })
      }

      sendJson(
        res,
        200,
        {
          item: options.base === '/api/users' ? sanitizeUser(item as unknown as PlatformUser) : item,
        },
      )
    },
  }

  const createRoute: RouteDefinition = {
    method: 'POST',
    pattern: new RegExp(`^${options.base}$`),
    permission: options.base.includes('users')
      ? 'user:write'
      : options.base.includes('projects')
        ? 'project:write'
        : options.base.includes('screenProjects')
          ? 'screen:write'
          : options.base.includes('sceneProjects')
            ? 'scene:write'
            : options.base.includes('dataSources')
              ? 'data-source:write'
              : 'dataset:write',
    handler: async ({ res, body }) => {
      if (!body || typeof body !== 'object') {
        return badRequest(res, 'Request body is required')
      }

      let item: T
      try {
        item = await options.buildCreateItem(body as Record<string, unknown>)
      } catch (error) {
        if (error instanceof RouteValidationError) {
          return sendJson(res, 400, { message: error.message })
        }
        throw error
      }
      const created = await options.create(item)
      const result = created ?? item
      sendJson(res, 201, { item: options.base === '/api/users' ? sanitizeUser(result as unknown as PlatformUser) : result })
    },
  }

  const updateRouteDef: RouteDefinition = {
    method: 'PUT',
    pattern: detailPattern,
    permission: createRoute.permission,
    handler: async ({ res, params, body }) => {
      if (!body || typeof body !== 'object') {
        return badRequest(res, 'Request body is required')
      }

      let patchBody: Partial<T>
      try {
        if (options.normalizePatch) {
          patchBody = await options.normalizePatch(params.id, body as Record<string, unknown>)
        } else {
          const rawPatch = { ...(body as Record<string, unknown>) }
          if (options.base === '/api/screenProjects' && 'screenNodes' in rawPatch) {
            rawPatch.screenNodes = parseScreenNodes(rawPatch.screenNodes)
          }
          patchBody = rawPatch as Partial<T>
        }
      } catch (error) {
        if (error instanceof RouteValidationError) {
          return sendJson(res, 400, { message: error.message })
        }
        throw error
      }

      let updated: T | null | undefined
      try {
        updated = await options.update(params.id, {
          ...patchBody,
          updatedAt: nowText(),
        })
      } catch (error) {
        if (error instanceof RouteValidationError) {
          return sendJson(res, 400, { message: error.message })
        }
        throw error
      }
      if (!updated) {
        return sendJson(res, 404, { message: 'Item not found' })
      }

      sendJson(res, 200, { item: options.base === '/api/users' ? sanitizeUser(updated as unknown as PlatformUser) : updated })
    },
  }

  const deleteRouteDef: RouteDefinition | null = options.remove
    ? {
        method: 'DELETE',
        pattern: detailPattern,
        permission: createRoute.permission,
        handler: async ({ res, params }) => {
          let ok: boolean | undefined
          try {
            ok = await options.remove!(params.id)
          } catch (error) {
            if (error instanceof RouteValidationError) {
              return sendJson(res, 400, { message: error.message })
            }
            throw error
          }
          if (!ok) {
            return sendJson(res, 404, { message: 'Item not found' })
          }
          sendNoContent(res)
        },
      }
    : null

  return [listRoute, detailRoute, createRoute, updateRouteDef, ...(deleteRouteDef ? [deleteRouteDef] : [])]
}

const authLoginRoute: RouteDefinition = {
  method: 'POST',
  pattern: /^\/api\/auth\/login$/,
  handler: async ({ res, body }) => {
    if (!body || typeof body !== 'object') {
      return badRequest(res, 'Request body is required')
    }

    const username = String((body as Record<string, unknown>).username ?? '')
    const password = String((body as Record<string, unknown>).password ?? '')
    if (!username || !password) {
      return badRequest(res, 'Username and password are required')
    }

    const user = await findUserByUsername(username)
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return unauthorized(res, 'Invalid credentials')
    }
    if (user.status !== 'active') {
      return unauthorized(res, 'User is disabled')
    }

    const roles = await listRoles()
    const role = roles?.find((item) => item.name === user.role)

    sendJson(res, 200, {
      token: issueToken(user),
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        phone: user.phone,
        status: user.status,
      },
      permissions: role?.permissions ?? [],
    })
  },
}

const authMeRoute: RouteDefinition = {
  method: 'GET',
  pattern: /^\/api\/auth\/me$/,
  handler: async ({ res, authUser }) => {
    if (!authUser) {
      return unauthorized(res)
    }

    const roles = await listRoles()
    const role = roles?.find((item) => item.name === authUser.role)

    sendJson(res, 200, {
      user: {
        id: authUser.id,
        username: authUser.username,
        displayName: authUser.displayName,
        role: authUser.role,
        phone: authUser.phone,
        status: authUser.status,
      },
      permissions: role?.permissions ?? [],
    })
  },
}

const testConnectionRoute: RouteDefinition = {
  method: 'POST',
  pattern: /^\/api\/(?:dataSources|data-sources)\/(?<id>[^/]+)\/test$/,
  permission: 'data-source:write',
  handler: async ({ res, params }) => {
    const source = ((await listDataSources()) ?? []).find((item) => item.id === params.id)
    if (!source) {
      return sendJson(res, 404, { message: 'Data source not found' })
    }

    if (source.type === 'MySQL') {
      try {
        const mysql = await import('mysql2/promise')
        const { mysqlConfig } = await import('../lib/config.ts')
        const [host, portText] = source.host.split(':')
        const connection = await mysql.createConnection({
          host: host || mysqlConfig.host,
          port: portText ? Number(portText) : mysqlConfig.port,
          user: mysqlConfig.user,
          password: mysqlConfig.password,
          database: source.database || mysqlConfig.database,
          connectTimeout: 3000, // 3s timeout
        })
        await connection.ping()
        await connection.end()

        sendJson(res, 200, {
          sourceId: source.id,
          reachable: true,
          checkedAt: nowText(),
          message: '测试链接成功',
        })
      } catch (error) {
        sendJson(res, 200, {
          sourceId: source.id,
          reachable: false,
          checkedAt: nowText(),
          message: error instanceof Error ? `Database connection failed: ${error.message}` : 'Connection test failed',
        })
      }
    } else if (source.type === 'REST') {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        await fetch(source.host, { signal: controller.signal })
        clearTimeout(timeoutId)
        sendJson(res, 200, {
          sourceId: source.id,
          reachable: true,
          checkedAt: nowText(),
          message: 'Connection test passed successfully (HTTP check)',
        })
      } catch (error) {
        sendJson(res, 200, {
          sourceId: source.id,
          reachable: false,
          checkedAt: nowText(),
          message: error instanceof Error ? `HTTP check failed: ${error.message}` : 'Connection test failed',
        })
      }
    } else {
      // MQTT or TCP ports
      try {
        const [host, portText] = source.host.split(':')
        const port = portText ? Number(portText) : 1883
        const net = await import('node:net')
        await new Promise<void>((resolvePromise, rejectPromise) => {
          const socket = net.createConnection({
            host: host || '127.0.0.1',
            port: port,
            timeout: 3000,
          })
          socket.on('connect', () => {
            socket.end()
            resolvePromise()
          })
          socket.on('error', (err) => {
            rejectPromise(err)
          })
          socket.on('timeout', () => {
            socket.destroy()
            rejectPromise(new Error('Connection timeout'))
          })
        })
        sendJson(res, 200, {
          sourceId: source.id,
          reachable: true,
          checkedAt: nowText(),
          message: 'Connection test passed successfully (TCP check)',
        })
      } catch (error) {
        sendJson(res, 200, {
          sourceId: source.id,
          reachable: false,
          checkedAt: nowText(),
          message: error instanceof Error ? `TCP port connection failed: ${error.message}` : 'Connection test failed',
        })
      }
    }
  },
}

const dataSourceTablesRoute: RouteDefinition = {
  method: 'GET',
  pattern: /^\/api\/(?:dataSources|data-sources)\/(?<id>[^/]+)\/tables$/,
  permission: 'data-source:read',
  handler: async ({ res, params }) => {
    const source = ((await listDataSources()) ?? []).find((item) => item.id === params.id)
    if (!source) {
      return sendJson(res, 404, { message: 'Data source not found' })
    }

    if (source.type !== 'MySQL') {
      return sendJson(res, 400, { message: 'Only MySQL data sources are supported for listing tables' })
    }

    try {
      const connection = await createMysqlConnectionForDataSource(source)
      try {
        const [rows] = await connection.query('SHOW TABLES')
        const tables = (rows as Array<Record<string, unknown>>).map((row) => String(Object.values(row)[0]))
        sendJson(res, 200, { tables })
      } finally {
        await connection.end()
      }
    } catch (error) {
      sendJson(res, 500, {
        message: 'Failed to fetch database tables',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
}

const deleteDataSourceRoute: RouteDefinition = {
  method: 'DELETE',
  pattern: /^\/api\/dataSources\/(?<id>[^/]+)$/,
  permission: 'data-source:write',
  handler: async ({ res, params }) => {
    const datasets = (await listDatasets()) ?? []
    const inUse = datasets.some((item) => item.dataSourceId === params.id)
    if (inUse) {
      return sendJson(res, 409, { message: 'Data source is referenced by datasets and cannot be deleted' })
    }

    const ok = await deleteDataSource(params.id)
    if (!ok) {
      return sendJson(res, 404, { message: 'Item not found' })
    }

    sendNoContent(res)
  },
}

const datasetPreviewRoute: RouteDefinition = {
  method: 'GET',
  pattern: /^\/api\/datasets\/(?<id>[^/]+)\/preview$/,
  permission: 'dataset:read',
  handler: async ({ res, params }) => {
    const dataset = ((await listDatasets()) ?? []).find((item) => item.id === params.id)
    if (!dataset) {
      return sendJson(res, 404, { message: 'Dataset not found' })
    }

    const source = await getDataSourceOrThrow(dataset.dataSourceId)

    if (source.type === 'MySQL') {
      const objectName = normalizeMysqlObjectName(dataset.tableName)
      const connection = await createMysqlConnectionForDataSource(source)

      try {
        const escapedObjectName = objectName.map((part) => connection.escapeId(part)).join('.')
        try {
          const [rows] = await connection.query(`SELECT * FROM ${escapedObjectName} LIMIT 20`)
          const previewRows = rows as Array<Record<string, unknown>>
          const columns = previewRows.length ? Object.keys(previewRows[0]) : []

          sendJson(res, 200, {
            datasetId: dataset.id,
            sourceId: source.id,
            sourceName: source.name,
            tableName: dataset.tableName,
            limit: 20,
            columns,
            rows: previewRows,
          })
        } catch (error) {
          return sendJson(res, 400, {
            message: error instanceof Error ? `Preview query failed: ${error.message}` : 'Preview query failed',
          })
        }
      } finally {
        await connection.end()
      }
    } else if (source.type === 'REST') {
      const urlStr = `${source.host}${dataset.tableName.startsWith('/') ? '' : '/'}${dataset.tableName}`
      try {
        let rows: any[] = []
        let useMock = urlStr.includes('factory.local') || urlStr.includes('example.local') || urlStr.includes('example.com')

        if (!useMock) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000)
            const response = await fetch(urlStr, { signal: controller.signal })
            clearTimeout(timeoutId)
            if (response.ok) {
              const data = await response.json()
              rows = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : (Array.isArray(data.data) ? data.data : []))
            } else {
              useMock = true
            }
          } catch (err) {
            useMock = true
          }
        }

        if (useMock) {
          // Generate beautiful mock REST API response depending on tableName
          if (dataset.tableName.includes('alarm') || dataset.tableName.includes('alert')) {
            rows = [
              { id: 101, timestamp: nowText(), device_id: 'REST-DEV-01', alarm_level: 'Critical', alarm_message: 'REST API: 轴承震动超限 (12mm/s)', status: 'Active' },
              { id: 102, timestamp: nowText(), device_id: 'REST-DEV-02', alarm_level: 'Warning', alarm_message: 'REST API: 进料速度过慢', status: 'Active' },
              { id: 103, timestamp: nowText(), device_id: 'REST-DEV-03', alarm_level: 'Info', alarm_message: 'REST API: 设备运行日志已同步', status: 'Resolved' },
            ]
          } else if (dataset.tableName.includes('asset')) {
            rows = [
              { id: 201, asset_code: 'REST-AST-01', name: '五轴数控机床', type: '加工中心', model: 'DMG-50', location: '2号车间B区', status: 'Running' },
              { id: 202, asset_code: 'REST-AST-02', name: '工业机械臂', type: '装配设备', model: 'KUKA-KR60', location: '3号车间A区', status: 'Standby' },
            ]
          } else {
            // Default mock REST energy data
            rows = [
              { id: 301, timestamp: nowText(), workshop_name: 'REST-A车间', electricity_kwh: 980.5, water_m3: 30.2, gas_m3: 85.0 },
              { id: 302, timestamp: nowText(), workshop_name: 'REST-B车间', electricity_kwh: 1200.2, water_m3: 15.0, gas_m3: 0.0 },
              { id: 303, timestamp: nowText(), workshop_name: 'REST-C车间', electricity_kwh: 540.8, water_m3: 40.5, gas_m3: 120.3 },
            ]
          }
        }

        const columns = rows.length ? Object.keys(rows[0]) : []
        sendJson(res, 200, {
          datasetId: dataset.id,
          sourceId: source.id,
          sourceName: source.name,
          tableName: dataset.tableName,
          limit: 20,
          columns,
          rows,
        })
      } catch (error) {
        sendJson(res, 500, {
          message: error instanceof Error ? `REST API query failed: ${error.message}` : 'REST API query failed',
        })
      }
    } else {
      sendJson(res, 400, { message: `Data source type ${source.type} is not supported for dataset queries` })
    }
  },
}

const resetPasswordRoute: RouteDefinition = {
  method: 'POST',
  pattern: /^\/api\/users\/(?<id>[^/]+)\/reset-password$/,
  permission: 'user:write',
  handler: async ({ res, params }) => {
    const user = await getUserById(params.id)
    if (!user) {
      return sendJson(res, 404, { message: 'User not found' })
    }

    const temporaryPassword = 'ChangeMe123!'
    const updated = await updateUser(params.id, {
      passwordHash: hashPassword(temporaryPassword),
      updatedAt: nowText(),
    })
    if (!updated) {
      return sendJson(res, 404, { message: 'User not found' })
    }

    sendJson(res, 200, {
      userId: user.id,
      temporaryPassword,
      resetAt: nowText(),
    })
  },
}

const roleResourceRoutes = resourceRouteCollection<RoleDefinition & { updatedAt: string }>({
  base: '/api/roles',
  list: async () => ((await listRoles()) ?? []).map((item) => ({ ...item, updatedAt: nowText() })),
  create: async (item) => {
    const created = await createRole({
      id: item.id,
      name: item.name,
      description: item.description,
      permissions: item.permissions,
    })
    return created ? { ...created, updatedAt: nowText() } : undefined
  },
  update: async (id, patch) => {
    const updated = await updateRole(id, patch)
    return updated ? { ...updated, updatedAt: nowText() } : null
  },
  remove: async (id) => {
    const roles = (await listRoles()) ?? []
    const role = roles.find((item) => item.id === id)
    if (!role) {
      return false
    }
    const usedCount = await countUsersByRole(role.name)
    if ((usedCount ?? 0) > 0) {
      throw new RouteValidationError('Role is assigned to users and cannot be deleted')
    }
    return deleteRole(id)
  },
  fields: [(item) => item.name, (item) => item.description, (item) => item.permissions.join(',')],
  buildCreateItem: (body) => ({
    id: createId('role'),
    name: String(body.name ?? ''),
    description: String(body.description ?? ''),
    permissions: Array.isArray(body.permissions) ? (body.permissions as string[]) : [],
    updatedAt: nowText(),
  }),
}).map((route) => ({
  ...route,
  permission: 'system:write',
}))

const projectRoutes = (() => {
  const base = '/api/projects'
  const detailPattern = /^\/api\/projects\/(?<id>[^/]+)$/

  const listRoute: RouteDefinition = {
    method: 'GET',
    pattern: /^\/api\/projects$/,
    permission: 'project:read',
    handler: async ({ res, url, authUser }) => {
      const keyword = pickQuery(url, 'keyword')
      const allProjects = (await listProjects()) ?? []
      let visibleProjects = allProjects

      if (!isSuperAdmin(authUser)) {
        const memberships = authUser ? ((await listProjectMembershipsByUser(authUser.id)) ?? []) : []
        const allowedProjectIds = new Set(memberships.map((item) => item.projectId))
        visibleProjects = allProjects.filter((item) => allowedProjectIds.has(item.id))
      }

      sendJson(res, 200, {
        items: applyKeywordFilter(visibleProjects, keyword, [
          (item) => item.name,
          (item) => item.group,
          (item) => item.owner,
          (item) => item.type,
        ]),
      })
    },
  }

  const createRoute: RouteDefinition = {
    method: 'POST',
    pattern: /^\/api\/projects$/,
    permission: 'project:write',
    handler: async ({ res, body, authUser }) => {
      if (!body || typeof body !== 'object') {
        return badRequest(res, 'Request body is required')
      }

      const item: ManagedProject = {
        id: createId('prj'),
        name: String((body as Record<string, unknown>).name ?? ''),
        type: ((body as Record<string, unknown>).type as ManagedProject['type']) ?? '2D',
        group: String((body as Record<string, unknown>).group ?? ''),
        owner: String((body as Record<string, unknown>).owner ?? ''),
        status: ((body as Record<string, unknown>).status as ManagedProject['status']) ?? 'draft',
        updatedAt: nowText(),
      }

      const created = await createProject(item)
      if (authUser && !isSuperAdmin(authUser)) {
        await createProjectMembership({
          id: createId('pm'),
          userId: authUser.id,
          projectId: item.id,
          accessLevel: 'owner',
        })
      }
      sendJson(res, 201, { item: created ?? item })
    },
  }

  const updateRoute: RouteDefinition = {
    method: 'PUT',
    pattern: detailPattern,
    permission: 'project:write',
    handler: async ({ res, params, body, authUser }) => {
      if (!body || typeof body !== 'object') {
        return badRequest(res, 'Request body is required')
      }

      if (!isSuperAdmin(authUser)) {
        const membership = authUser ? await getProjectMembership(authUser.id, params.id) : null
        if (!membership || !['editor', 'owner'].includes(membership.accessLevel)) {
          return sendJson(res, 403, { message: 'Missing project edit permission' })
        }
      }

      const updated = await updateProject(params.id, {
        ...(body as Partial<ManagedProject>),
        updatedAt: nowText(),
      })
      if (!updated) {
        return sendJson(res, 404, { message: 'Item not found' })
      }
      sendJson(res, 200, { item: updated })
    },
  }

  const deleteRoute: RouteDefinition = {
    method: 'DELETE',
    pattern: detailPattern,
    permission: 'project:write',
    handler: async ({ res, params, authUser }) => {
      if (!isSuperAdmin(authUser)) {
        const membership = authUser ? await getProjectMembership(authUser.id, params.id) : null
        if (!membership || membership.accessLevel !== 'owner') {
          return sendJson(res, 403, { message: 'Missing project owner permission' })
        }
      }

      const ok = await deleteProject(params.id)
      if (!ok) {
        return sendJson(res, 404, { message: 'Item not found' })
      }
      const memberships = (await listProjectMemberships()) ?? []
      await Promise.all(
        memberships
          .filter((item) => item.projectId === params.id)
          .map((item) => deleteProjectMembership(item.id)),
      )
      sendNoContent(res)
    },
  }

  return [listRoute, createRoute, updateRoute, deleteRoute]
})()

const ensureProjectOwnerOrAdmin = async (
  authUser: PlatformUser | null | undefined,
  projectId: string,
) => {
  if (isSuperAdmin(authUser)) {
    return true
  }

  const membership = authUser ? await getProjectMembership(authUser.id, projectId) : null
  return membership?.accessLevel === 'owner'
}

const projectMembershipRoutes: RouteDefinition[] = [
  {
    method: 'GET',
    pattern: /^\/api\/project-memberships$/,
    handler: async ({ res, url, authUser }) => {
      const projectId = pickQuery(url, 'projectId')
      if (!projectId) {
        return badRequest(res, 'projectId is required')
      }

      const allowed = await ensureProjectOwnerOrAdmin(authUser, projectId)
      if (!allowed) {
        return sendJson(res, 403, { message: 'Missing project owner permission' })
      }

      const items = (await listProjectMembershipsByProject(projectId)) ?? []
      sendJson(res, 200, { items })
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/project-memberships$/,
    handler: async ({ res, body, authUser }) => {
      if (!body || typeof body !== 'object') {
        return badRequest(res, 'Request body is required')
      }

      const projectId = String((body as Record<string, unknown>).projectId ?? '')
      const userId = String((body as Record<string, unknown>).userId ?? '')
      const accessLevel = ((body as Record<string, unknown>).accessLevel as ProjectMembership['accessLevel']) ?? 'viewer'
      if (!projectId || !userId) {
        return badRequest(res, 'projectId and userId are required')
      }

      const allowed = await ensureProjectOwnerOrAdmin(authUser, projectId)
      if (!allowed) {
        return sendJson(res, 403, { message: 'Missing project owner permission' })
      }

      const existing = await getProjectMembership(userId, projectId)
      if (existing) {
        return sendJson(res, 400, { message: 'Membership already exists' })
      }

      const membership: ProjectMembership = {
        id: createId('pm'),
        userId,
        projectId,
        accessLevel,
      }

      const created = await createProjectMembership(membership)
      sendJson(res, 201, { item: created ?? membership })
    },
  },
  {
    method: 'PUT',
    pattern: /^\/api\/project-memberships\/(?<id>[^/]+)$/,
    handler: async ({ res, params, body, authUser }) => {
      if (!body || typeof body !== 'object') {
        return badRequest(res, 'Request body is required')
      }

      const memberships = (await listProjectMemberships()) ?? []
      const current = memberships.find((item) => item.id === params.id)
      if (!current) {
        return sendJson(res, 404, { message: 'Membership not found' })
      }

      const allowed = await ensureProjectOwnerOrAdmin(authUser, current.projectId)
      if (!allowed) {
        return sendJson(res, 403, { message: 'Missing project owner permission' })
      }

      const updated = await updateProjectMembership(params.id, {
        accessLevel: ((body as Record<string, unknown>).accessLevel as ProjectMembership['accessLevel']) ?? current.accessLevel,
      })
      sendJson(res, 200, { item: updated ?? current })
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/project-memberships\/(?<id>[^/]+)$/,
    handler: async ({ res, params, authUser }) => {
      const memberships = (await listProjectMemberships()) ?? []
      const current = memberships.find((item) => item.id === params.id)
      if (!current) {
        return sendJson(res, 404, { message: 'Membership not found' })
      }

      const allowed = await ensureProjectOwnerOrAdmin(authUser, current.projectId)
      if (!allowed) {
        return sendJson(res, 403, { message: 'Missing project owner permission' })
      }

      const ok = await deleteProjectMembership(params.id)
      if (!ok) {
        return sendJson(res, 404, { message: 'Membership not found' })
      }
      sendNoContent(res)
    },
  },
]

const publishRoute = <T extends ScreenProject | SceneProject | ManagedProject>(
  collectionKey: 'screenProjects' | 'sceneProjects' | 'projects',
) => {
  return {
    method: 'POST',
    pattern: new RegExp(`^/api/${collectionKey}/(?<id>[^/]+)/publish$`),
    permission: collectionKey === 'screenProjects' ? 'screen:write' : collectionKey === 'sceneProjects' ? 'scene:write' : 'project:write',
    handler: async ({ res, params, body }) => {
      const state = await loadState()
      const items = state[collectionKey] as T[]
      const item = items.find((entry) => entry.id === params.id)
      if (!item) {
        return sendJson(res, 404, { message: 'Project not found' })
      }

      item.status = 'published'
      item.updatedAt = nowText()
      if ('publishedVersion' in item) {
        let customVersion = body && typeof body === 'object' ? String((body as Record<string, unknown>).version || '') : ''
        if (customVersion) {
          if (!customVersion.startsWith('v')) {
            customVersion = `v${customVersion}`
          }
          item.publishedVersion = customVersion
        } else {
          const current = item.publishedVersion
          if (!current || current === '未发布' || !current.startsWith('v')) {
            item.publishedVersion = 'v0.1'
          } else {
            const versionNumPart = current.slice(1)
            const versionFloat = parseFloat(versionNumPart)
            if (isNaN(versionFloat)) {
              item.publishedVersion = 'v0.1'
            } else {
              const decimals = versionNumPart.split('.')[1]?.length || 1
              const nextFloat = versionFloat + 0.1
              item.publishedVersion = `v${nextFloat.toFixed(decimals)}`
            }
          }
        }
      }

      saveState(state)
      sendJson(res, 200, { item })
    },
  } satisfies RouteDefinition
}

const cloneScreenRoute: RouteDefinition = {
  method: 'POST',
  pattern: /^\/api\/screenProjects\/(?<id>[^/]+)\/clone$/,
  permission: 'screen:write',
  handler: async ({ res, params }) => {
    const state = await loadState()
    const item = state.screenProjects.find((entry) => entry.id === params.id)
    if (!item) {
      return sendJson(res, 404, { message: 'Screen project not found' })
    }

    const cloned: ScreenProject = {
      ...item,
      id: createId('scr'),
      name: `${item.name}-副本`,
      status: 'draft',
      publishedVersion: '未发布',
      screenNodes: parseScreenNodes(item.screenNodes),
      updatedAt: nowText(),
    }

    state.screenProjects.unshift(cloned)
    saveState(state)
    sendJson(res, 201, { item: cloned })
  },
}

const summaryRoute: RouteDefinition = {
  method: 'GET',
  pattern: /^\/api\/summary$/,
  handler: async ({ res }) => {
    const state = await loadState()
    sendJson(res, 200, {
      screenProjects: state.screenProjects.length,
      sceneProjects: state.sceneProjects.length,
      dataSources: state.dataSources.length,
      datasets: state.datasets.length,
      users: state.users.length,
      projects: state.projects.length,
      roles: state.roles.length,
    })
  },
}

const storageRoute: RouteDefinition = {
  method: 'GET',
  pattern: /^\/api\/system\/storage$/,
  handler: async ({ res }) => {
    sendJson(res, 200, await getStorageStatus())
  },
}

const healthRoute: RouteDefinition = {
  method: 'GET',
  pattern: /^\/api\/health$/,
  handler: async ({ res }) => {
    sendJson(res, 200, {
      status: 'ok',
      timestamp: nowText(),
      storage: await getStorageStatus(),
    })
  },
}

const resetRoute: RouteDefinition = {
  method: 'POST',
  pattern: /^\/api\/debug\/reset$/,
  handler: async ({ res }) => {
    const state = await resetState()
    sendJson(res, 200, { message: 'State reset', state })
  },
}

export const routes: RouteDefinition[] = [
  healthRoute,
  authLoginRoute,
  authMeRoute,
  storageRoute,
  summaryRoute,

  // 2D Screen
  ...resourceRouteCollection<ScreenProject>({
    base: '/api/screenProjects',
    list: () => listScreenProjects(),
    create: (item) => createScreenProject(item),
    update: (id, patch) => updateScreenProject(id, patch),
    remove: (id) => deleteScreenProject(id),
    fields: [(item) => item.name, (item) => item.group, (item) => item.owner, (item) => item.scene],
    buildCreateItem: (body) => ({
      id: createId('scr'),
      name: String(body.name ?? ''),
      group: String(body.group ?? ''),
      scene: String(body.scene ?? ''),
      owner: String(body.owner ?? ''),
      status: (body.status as ScreenProject['status']) ?? 'draft',
      publishedVersion: String(body.publishedVersion ?? '未发布'),
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : [],
      screenNodes: parseScreenNodes(body.screenNodes),
      updatedAt: nowText(),
    }),
  }),

  // 3D Scene
  ...resourceRouteCollection<SceneProject>({
    base: '/api/sceneProjects',
    list: () => listSceneProjects(),
    create: (item) => createSceneProject(item),
    update: (id, patch) => updateSceneProject(id, patch),
    remove: (id) => deleteSceneProject(id),
    fields: [(item) => item.name, (item) => item.group, (item) => item.owner, (item) => item.engine],
    buildCreateItem: (body) => ({
      id: createId('scn'),
      name: String(body.name ?? ''),
      group: String(body.group ?? ''),
      owner: String(body.owner ?? ''),
      modelCount: Number(body.modelCount ?? 0),
      status: (body.status as SceneProject['status']) ?? 'draft',
      engine: String(body.engine ?? 'Three.js'),
      sceneNodes: Array.isArray(body.sceneNodes) ? body.sceneNodes : [],
      updatedAt: nowText(),
    }),
    normalizePatch: (id, body) => {
      const patch: Partial<SceneProject> = {}
      if ('name' in body) patch.name = String(body.name ?? '')
      if ('group' in body) patch.group = String(body.group ?? '')
      if ('owner' in body) patch.owner = String(body.owner ?? '')
      if ('modelCount' in body) patch.modelCount = Number(body.modelCount ?? 0)
      if ('status' in body) patch.status = body.status as SceneProject['status']
      if ('engine' in body) patch.engine = String(body.engine ?? 'Three.js')
      if ('sceneNodes' in body) patch.sceneNodes = Array.isArray(body.sceneNodes) ? body.sceneNodes : []
      patch.updatedAt = nowText()
      return patch
    }
  }),

  // Datasource
  ...resourceRouteCollection<DataSource>({
    base: '/api/dataSources',
    list: () => listDataSources(),
    create: (item) => createDataSource(item),
    update: (id, patch) => updateDataSource(id, patch),
    fields: [(item) => item.name, (item) => item.host, (item) => item.owner, (item) => item.type],
    buildCreateItem: (body) => ({
      id: createId('ds'),
      name: String(body.name ?? ''),
      type: (body.type as DataSource['type']) ?? 'MySQL',
      host: String(body.host ?? ''),
      database: String(body.database ?? ''),
      owner: String(body.owner ?? ''),
      status: (body.status as DataSource['status']) ?? 'connected',
      updatedAt: nowText(),
    }),
  }),
  testConnectionRoute,
  dataSourceTablesRoute,
  datasetPreviewRoute,

  ...resourceRouteCollection<Dataset>({
    base: '/api/datasets',
    list: () => listDatasets(),
    create: (item) => createDataset(item),
    update: (id, patch) => updateDataset(id, patch),
    remove: (id) => deleteDataset(id),
    fields: [(item) => item.name, (item) => item.sourceName, (item) => item.tableName],
    buildCreateItem: async (body) => {
      const source = await getDataSourceOrThrow(body.dataSourceId)
      return {
        id: createId('set'),
        name: String(body.name ?? ''),
        dataSourceId: source.id,
        sourceName: source.name,
        tableName: String(body.tableName ?? ''),
        refreshMode: (body.refreshMode as Dataset['refreshMode']) ?? 'manual',
        fieldCount: Number(body.fieldCount ?? 0),
        updatedAt: nowText(),
      }
    },
    normalizePatch: async (_id, body) => {
      const patch: Partial<Dataset> = { ...(body as Partial<Dataset>) }
      if ('dataSourceId' in body) {
        const source = await getDataSourceOrThrow(body.dataSourceId)
        patch.dataSourceId = source.id
        patch.sourceName = source.name
      }
      return patch
    },
  }),
  deleteDataSourceRoute,
  ...resourceRouteCollection<PlatformUser>({
    base: '/api/users',
    list: () => listUsers(),
    create: (item) => createUser(item),
    update: async (id, patch) => {
      if (patch.role) {
        const roles = await listRoles()
        const roleExists = (roles ?? []).some((item) => item.name === patch.role)
        if (!roleExists) {
          throw new RouteValidationError('Role does not exist')
        }
      }
      return updateUser(id, patch)
    },
    remove: (id) => deleteUser(id),
    fields: [(item) => item.username, (item) => item.displayName, (item) => item.phone, (item) => item.role],
    buildCreateItem: (body) => ({
      id: createId('usr'),
      username: String(body.username ?? ''),
      displayName: String(body.displayName ?? ''),
      role: String(body.role ?? ''),
      phone: String(body.phone ?? ''),
      passwordHash: hashPassword(String(body.password ?? 'ChangeMe123!')),
      status: (body.status as PlatformUser['status']) ?? 'active',
      updatedAt: nowText(),
    }),
  }),
  resetPasswordRoute,
  ...projectRoutes,
  ...projectMembershipRoutes,
  cloneScreenRoute,
  publishRoute<ScreenProject>('screenProjects'),
  publishRoute<SceneProject>('sceneProjects'),
  publishRoute<ManagedProject>('projects'),
  ...roleResourceRoutes,
  resetRoute,
]
