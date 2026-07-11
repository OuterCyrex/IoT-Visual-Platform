import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createConnection } from 'node:net'
import { resolve } from 'node:path'
import { seedState } from '../data/seed.ts'
import { mysqlConfig, storageMode, type StorageMode } from './config.ts'
import { createMysqlConnection } from './mysql.ts'
import type {
  DataSource,
  Dataset,
  ManagedProject,
  ModelAsset,
  PlatformState,
  ProjectMembership,
  PlatformUser,
  RoleDefinition,
  SceneProject,
  ScreenNode,
  ScreenProject,
} from '../types/platform.ts'

export interface StorageAdapter {
  mode: StorageMode
  loadState: () => Promise<PlatformState>
  saveState: (state: PlatformState) => Promise<void>
  resetState: () => Promise<PlatformState>
  testConnection: () => Promise<{ ok: boolean; message: string }>
  listUsers?: () => Promise<PlatformUser[]>
  findUserByUsername?: (username: string) => Promise<PlatformUser | null>
  getUserById?: (id: string) => Promise<PlatformUser | null>
  listRoles?: () => Promise<RoleDefinition[]>
  createRole?: (role: RoleDefinition) => Promise<RoleDefinition>
  updateRole?: (id: string, patch: Partial<RoleDefinition>) => Promise<RoleDefinition | null>
  deleteRole?: (id: string) => Promise<boolean>
  countUsersByRole?: (roleName: string) => Promise<number>
  createUser?: (user: PlatformUser) => Promise<PlatformUser>
  updateUser?: (id: string, patch: Partial<PlatformUser>) => Promise<PlatformUser | null>
  deleteUser?: (id: string) => Promise<boolean>
  listProjects?: () => Promise<ManagedProject[]>
  createProject?: (project: ManagedProject) => Promise<ManagedProject>
  updateProject?: (id: string, patch: Partial<ManagedProject>) => Promise<ManagedProject | null>
  deleteProject?: (id: string) => Promise<boolean>
  listProjectMemberships?: () => Promise<ProjectMembership[]>
  listProjectMembershipsByUser?: (userId: string) => Promise<ProjectMembership[]>
  getProjectMembership?: (userId: string, projectId: string) => Promise<ProjectMembership | null>
  createProjectMembership?: (membership: ProjectMembership) => Promise<ProjectMembership>
  updateProjectMembership?: (id: string, patch: Partial<ProjectMembership>) => Promise<ProjectMembership | null>
  deleteProjectMembership?: (id: string) => Promise<boolean>
  listProjectMembershipsByProject?: (projectId: string) => Promise<ProjectMembership[]>
  listScreenProjects?: () => Promise<ScreenProject[]>
  createScreenProject?: (project: ScreenProject) => Promise<ScreenProject>
  updateScreenProject?: (id: string, patch: Partial<ScreenProject>) => Promise<ScreenProject | null>
  deleteScreenProject?: (id: string) => Promise<boolean>
  listSceneProjects?: () => Promise<SceneProject[]>
  createSceneProject?: (project: SceneProject) => Promise<SceneProject>
  updateSceneProject?: (id: string, patch: Partial<SceneProject>) => Promise<SceneProject | null>
  deleteSceneProject?: (id: string) => Promise<boolean>
  listModelAssets?: () => Promise<ModelAsset[]>
  createModelAsset?: (asset: ModelAsset) => Promise<ModelAsset>
  updateModelAsset?: (id: string, patch: Partial<ModelAsset>) => Promise<ModelAsset | null>
  deleteModelAsset?: (id: string) => Promise<boolean>
  listDataSources?: () => Promise<DataSource[]>
  createDataSource?: (source: DataSource) => Promise<DataSource>
  updateDataSource?: (id: string, patch: Partial<DataSource>) => Promise<DataSource | null>
  deleteDataSource?: (id: string) => Promise<boolean>
  listDatasets?: () => Promise<Dataset[]>
  createDataset?: (dataset: Dataset) => Promise<Dataset>
  updateDataset?: (id: string, patch: Partial<Dataset>) => Promise<Dataset | null>
  deleteDataset?: (id: string) => Promise<boolean>
}

const dataFile = resolve(process.cwd(), 'server/data/platform.json')
const mysqlFallbackFile = resolve(process.cwd(), 'server/data/mysql-state.json')

const cloneSeed = (): PlatformState => JSON.parse(JSON.stringify(seedState)) as PlatformState

const ensureStateFile = () => {
  if (!existsSync(dataFile)) {
    writeFileSync(dataFile, JSON.stringify(cloneSeed(), null, 2))
  }
}

const readFileState = (): PlatformState => {
  ensureStateFile()
  const raw = readFileSync(dataFile, 'utf8')
  return JSON.parse(raw) as PlatformState
}

const writeFileState = (state: PlatformState) => {
  writeFileSync(dataFile, JSON.stringify(state, null, 2))
}

const ensureMysqlFallback = () => {
  if (!existsSync(mysqlFallbackFile)) {
    writeFileSync(mysqlFallbackFile, JSON.stringify(cloneSeed(), null, 2))
  }
}

const readMysqlFallback = (): PlatformState => {
  ensureMysqlFallback()
  const raw = readFileSync(mysqlFallbackFile, 'utf8')
  return JSON.parse(raw) as PlatformState
}

const writeMysqlFallback = (state: PlatformState) => {
  writeFileSync(mysqlFallbackFile, JSON.stringify(state, null, 2))
}

const tcpCheck = () =>
  new Promise<{ ok: boolean; message: string }>((resolveCheck) => {
    const socket = createConnection({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
    })

    socket.setTimeout(2000)

    socket.on('connect', () => {
      socket.end()
      resolveCheck({
        ok: true,
        message: `TCP connection to ${mysqlConfig.host}:${mysqlConfig.port} succeeded`,
      })
    })

    socket.on('timeout', () => {
      socket.destroy()
      resolveCheck({
        ok: false,
        message: `TCP connection to ${mysqlConfig.host}:${mysqlConfig.port} timed out`,
      })
    })

    socket.on('error', (error) => {
      resolveCheck({
        ok: false,
        message: `TCP connection failed: ${error.message}`,
      })
    })
  })

const fileAdapter: StorageAdapter = {
  mode: 'file',
  async loadState() {
    return readFileState()
  },
  async saveState(state) {
    writeFileState(state)
  },
  async resetState() {
    const state = cloneSeed()
    writeFileState(state)
    return state
  },
  async testConnection() {
    ensureStateFile()
    return { ok: true, message: `Using local file storage at ${dataFile}` }
  },
  async listUsers() {
    return readFileState().users
  },
  async findUserByUsername(username) {
    return readFileState().users.find((item) => item.username === username) ?? null
  },
  async getUserById(id) {
    return readFileState().users.find((item) => item.id === id) ?? null
  },
  async listRoles() {
    return readFileState().roles
  },
  async createRole(role) {
    const state = readFileState()
    state.roles.unshift(role)
    writeFileState(state)
    return role
  },
  async updateRole(id, patch) {
    const state = readFileState()
    const index = state.roles.findIndex((item) => item.id === id)
    if (index === -1) {
      return null
    }
    state.roles[index] = { ...state.roles[index], ...patch }
    writeFileState(state)
    return state.roles[index]
  },
  async deleteRole(id) {
    const state = readFileState()
    const next = state.roles.filter((item) => item.id !== id)
    if (next.length === state.roles.length) {
      return false
    }
    state.roles = next
    writeFileState(state)
    return true
  },
  async countUsersByRole(roleName) {
    return readFileState().users.filter((item) => item.role === roleName).length
  },
  async createUser(user) {
    const state = readFileState()
    state.users.unshift(user)
    writeFileState(state)
    return user
  },
  async updateUser(id, patch) {
    const state = readFileState()
    const index = state.users.findIndex((item) => item.id === id)
    if (index === -1) {
      return null
    }
    state.users[index] = { ...state.users[index], ...patch }
    writeFileState(state)
    return state.users[index]
  },
  async deleteUser(id) {
    const state = readFileState()
    const next = state.users.filter((item) => item.id !== id)
    if (next.length === state.users.length) {
      return false
    }
    state.users = next
    writeFileState(state)
    return true
  },
  async listProjects() {
    return readFileState().projects
  },
  async createProject(project) {
    const state = readFileState()
    state.projects.unshift(project)
    writeFileState(state)
    return project
  },
  async updateProject(id, patch) {
    const state = readFileState()
    const index = state.projects.findIndex((item) => item.id === id)
    if (index === -1) {
      return null
    }
    state.projects[index] = { ...state.projects[index], ...patch }
    writeFileState(state)
    return state.projects[index]
  },
  async deleteProject(id) {
    const state = readFileState()
    const next = state.projects.filter((item) => item.id !== id)
    if (next.length === state.projects.length) {
      return false
    }
    state.projects = next
    writeFileState(state)
    return true
  },
  async listProjectMemberships() {
    return readFileState().projectMemberships ?? []
  },
  async listProjectMembershipsByUser(userId) {
    return (readFileState().projectMemberships ?? []).filter((item) => item.userId === userId)
  },
  async getProjectMembership(userId, projectId) {
    return (readFileState().projectMemberships ?? []).find(
      (item) => item.userId === userId && item.projectId === projectId,
    ) ?? null
  },
  async createProjectMembership(membership) {
    const state = readFileState()
    state.projectMemberships = [membership, ...(state.projectMemberships ?? [])]
    writeFileState(state)
    return membership
  },
  async updateProjectMembership(id, patch) {
    const state = readFileState()
    const index = (state.projectMemberships ?? []).findIndex((item) => item.id === id)
    if (index === -1) {
      return null
    }
    state.projectMemberships![index] = { ...state.projectMemberships![index], ...patch }
    writeFileState(state)
    return state.projectMemberships![index]
  },
  async deleteProjectMembership(id) {
    const state = readFileState()
    const next = (state.projectMemberships ?? []).filter((item) => item.id !== id)
    if (next.length === (state.projectMemberships ?? []).length) {
      return false
    }
    state.projectMemberships = next
    writeFileState(state)
    return true
  },
  async listProjectMembershipsByProject(projectId) {
    return (readFileState().projectMemberships ?? []).filter((item) => item.projectId === projectId)
  },
  async listScreenProjects() {
    return readFileState().screenProjects
  },
  async createScreenProject(project) {
    const state = readFileState()
    state.screenProjects.unshift(project)
    writeFileState(state)
    return project
  },
  async updateScreenProject(id, patch) {
    const state = readFileState()
    const index = state.screenProjects.findIndex((item) => item.id === id)
    if (index === -1) {
      return null
    }
    state.screenProjects[index] = { ...state.screenProjects[index], ...patch }
    writeFileState(state)
    return state.screenProjects[index]
  },
  async deleteScreenProject(id) {
    const state = readFileState()
    const next = state.screenProjects.filter((item) => item.id !== id)
    if (next.length === state.screenProjects.length) {
      return false
    }
    state.screenProjects = next
    writeFileState(state)
    return true
  },
  async listSceneProjects() {
    return readFileState().sceneProjects
  },
  async createSceneProject(project) {
    const state = readFileState()
    state.sceneProjects.unshift(project)
    writeFileState(state)
    return project
  },
  async updateSceneProject(id, patch) {
    const state = readFileState()
    const index = state.sceneProjects.findIndex((item) => item.id === id)
    if (index === -1) {
      return null
    }
    state.sceneProjects[index] = { ...state.sceneProjects[index], ...patch }
    writeFileState(state)
    return state.sceneProjects[index]
  },
  async deleteSceneProject(id) {
    const state = readFileState()
    const next = state.sceneProjects.filter((item) => item.id !== id)
    if (next.length === state.sceneProjects.length) {
      return false
    }
    state.sceneProjects = next
    writeFileState(state)
    return true
  },
  async listModelAssets() {
    return readFileState().modelAssets ?? []
  },
  async createModelAsset(asset) {
    const state = readFileState()
    state.modelAssets = [asset, ...(state.modelAssets ?? [])]
    writeFileState(state)
    return asset
  },
  async updateModelAsset(id, patch) {
    const state = readFileState()
    const assets = state.modelAssets ?? []
    const index = assets.findIndex((item) => item.id === id)
    if (index === -1) {
      return null
    }
    assets[index] = { ...assets[index], ...patch }
    state.modelAssets = assets
    writeFileState(state)
    return assets[index]
  },
  async deleteModelAsset(id) {
    const state = readFileState()
    const next = (state.modelAssets ?? []).filter((item) => item.id !== id)
    if (next.length === (state.modelAssets ?? []).length) {
      return false
    }
    state.modelAssets = next
    writeFileState(state)
    return true
  },
  async listDataSources() {
    return readFileState().dataSources
  },
  async createDataSource(source) {
    const state = readFileState()
    state.dataSources.unshift(source)
    writeFileState(state)
    return source
  },
  async updateDataSource(id, patch) {
    const state = readFileState()
    const index = state.dataSources.findIndex((item) => item.id === id)
    if (index === -1) {
      return null
    }
    state.dataSources[index] = { ...state.dataSources[index], ...patch }
    writeFileState(state)
    return state.dataSources[index]
  },
  async deleteDataSource(id) {
    const state = readFileState()
    const next = state.dataSources.filter((item) => item.id !== id)
    if (next.length === state.dataSources.length) {
      return false
    }
    state.dataSources = next
    writeFileState(state)
    return true
  },
  async listDatasets() {
    return readFileState().datasets
  },
  async createDataset(dataset) {
    const state = readFileState()
    state.datasets.unshift(dataset)
    writeFileState(state)
    return dataset
  },
  async updateDataset(id, patch) {
    const state = readFileState()
    const index = state.datasets.findIndex((item) => item.id === id)
    if (index === -1) {
      return null
    }
    state.datasets[index] = { ...state.datasets[index], ...patch }
    writeFileState(state)
    return state.datasets[index]
  },
  async deleteDataset(id) {
    const state = readFileState()
    const next = state.datasets.filter((item) => item.id !== id)
    if (next.length === state.datasets.length) {
      return false
    }
    state.datasets = next
    writeFileState(state)
    return true
  },
}

const parseJson = <T>(value: unknown, fallback: T): T => {
  if (typeof value === 'string') {
    return JSON.parse(value) as T
  }
  if (value == null) {
    return fallback
  }
  return value as T
}

const readStateFromMysql = async (): Promise<PlatformState> => {
  const connection = await createMysqlConnection(true)

  try {
    const [rolesRows] = await connection.query(
      'SELECT id, name, description, permissions, updated_at FROM roles ORDER BY name',
    )
    const [userRows] = await connection.query(
      'SELECT id, username, display_name, role, phone, status, updated_at FROM users ORDER BY username',
    )
    const [projectRows] = await connection.query(
      'SELECT id, name, type, project_group, owner, status, updated_at FROM projects ORDER BY name',
    )
    const [screenRows] = await connection.query(
      'SELECT id, name, project_group, scene, owner, status, published_version, tags, screen_nodes, updated_at FROM screen_projects ORDER BY name',
    )
    const [sceneRows] = await connection.query(
      'SELECT id, name, project_group, owner, model_count, status, engine, scene_nodes, updated_at FROM scene_projects ORDER BY name',
    )
    let modelAssetRows: Array<Record<string, unknown>> = []
    try {
      const [rows] = await connection.query(
        'SELECT id, name, category, description, tags, format, file_name, file_path, file_url, file_size, updated_at FROM model_assets ORDER BY updated_at DESC',
      )
      modelAssetRows = rows as Array<Record<string, unknown>>
    } catch {
      modelAssetRows = []
    }
    const [sourceRows] = await connection.query(
      'SELECT id, name, type, host, database_name, owner, status, updated_at FROM data_sources ORDER BY name',
    )
    const [datasetRows] = await connection.query(
      'SELECT id, name, data_source_id, source_name, table_name, refresh_mode, field_count, updated_at FROM datasets ORDER BY name',
    )

    return {
      roles: (rolesRows as Array<Record<string, unknown>>).map(
        (row): RoleDefinition => ({
          id: String(row.id),
          name: String(row.name),
          description: String(row.description),
          permissions: parseJson<string[]>(row.permissions, []),
        }),
      ),
      users: (userRows as Array<Record<string, unknown>>).map(
        (row): PlatformUser => ({
          id: String(row.id),
          username: String(row.username),
          displayName: String(row.display_name),
          role: String(row.role),
          phone: String(row.phone),
          status: row.status as PlatformUser['status'],
          updatedAt: String(row.updated_at),
        }),
      ),
      projects: (projectRows as Array<Record<string, unknown>>).map(
        (row): ManagedProject => ({
          id: String(row.id),
          name: String(row.name),
          type: row.type as ManagedProject['type'],
          group: String(row.project_group),
          owner: String(row.owner),
          status: row.status as ManagedProject['status'],
          updatedAt: String(row.updated_at),
        }),
      ),
      screenProjects: (screenRows as Array<Record<string, unknown>>).map(
        (row): ScreenProject => ({
          id: String(row.id),
          name: String(row.name),
          group: String(row.project_group),
          scene: String(row.scene),
          owner: String(row.owner),
          status: row.status as ScreenProject['status'],
          publishedVersion: String(row.published_version),
          tags: parseJson<string[]>(row.tags, []),
          screenNodes: parseJson<ScreenNode[]>(row.screen_nodes, []),
          updatedAt: String(row.updated_at),
        }),
      ),
      sceneProjects: (sceneRows as Array<Record<string, unknown>>).map(
        (row): SceneProject => ({
          id: String(row.id),
          name: String(row.name),
          group: String(row.project_group),
          owner: String(row.owner),
          modelCount: Number(row.model_count),
          status: row.status as SceneProject['status'],
          engine: String(row.engine),
          sceneNodes: parseJson<any[]>(row.scene_nodes, []),
          updatedAt: String(row.updated_at),
        }),
      ),
      modelAssets: modelAssetRows.map(
        (row): ModelAsset => ({
          id: String(row.id),
          name: String(row.name),
          category: String(row.category ?? ''),
          description: String(row.description ?? ''),
          tags: parseJson<string[]>(row.tags, []),
          format: row.format as ModelAsset['format'],
          fileName: String(row.file_name ?? ''),
          filePath: String(row.file_path ?? ''),
          fileUrl: String(row.file_url ?? ''),
          fileSize: Number(row.file_size ?? 0),
          updatedAt: String(row.updated_at ?? ''),
        }),
      ),
      dataSources: (sourceRows as Array<Record<string, unknown>>).map(
        (row): DataSource => ({
          id: String(row.id),
          name: String(row.name),
          type: row.type as DataSource['type'],
          host: String(row.host),
          database: String(row.database_name),
          owner: String(row.owner),
          status: row.status as DataSource['status'],
          updatedAt: String(row.updated_at),
        }),
      ),
      datasets: (datasetRows as Array<Record<string, unknown>>).map(
        (row): Dataset => ({
          id: String(row.id),
          name: String(row.name),
          dataSourceId: String(row.data_source_id),
          sourceName: String(row.source_name),
          tableName: String(row.table_name),
          refreshMode: row.refresh_mode as Dataset['refreshMode'],
          fieldCount: Number(row.field_count),
          updatedAt: String(row.updated_at),
        }),
      ),
    }
  } finally {
    await connection.end()
  }
}

const replaceTable = async <T>(
  connection: Awaited<ReturnType<typeof createMysqlConnection>>,
  tableName: string,
  columns: string[],
  values: T[],
  mapper: (item: T) => unknown[],
) => {
  await connection.query(`DELETE FROM ${tableName}`)
  if (values.length === 0) {
    return
  }

  const placeholders = `(${columns.map(() => '?').join(', ')})`
  const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values
    .map(() => placeholders)
    .join(', ')}`
  const args = values.flatMap((item) => mapper(item))
  await connection.query(sql, args)
}

const writeStateToMysql = async (state: PlatformState) => {
  const connection = await createMysqlConnection(true)

  try {
    await connection.beginTransaction()

    await replaceTable(connection, 'roles', ['id', 'name', 'description', 'permissions'], state.roles, (item) => [
      item.id,
      item.name,
      item.description,
      JSON.stringify(item.permissions),
    ])

    await replaceTable(
      connection,
      'users',
      ['id', 'username', 'display_name', 'role', 'phone', 'status', 'updated_at'],
      state.users,
      (item) => [item.id, item.username, item.displayName, item.role, item.phone, item.status, item.updatedAt],
    )

    await replaceTable(
      connection,
      'projects',
      ['id', 'name', 'type', 'project_group', 'owner', 'status', 'updated_at'],
      state.projects,
      (item) => [item.id, item.name, item.type, item.group, item.owner, item.status, item.updatedAt],
    )

    await replaceTable(
      connection,
      'screen_projects',
      ['id', 'name', 'project_group', 'scene', 'owner', 'status', 'published_version', 'tags', 'screen_nodes', 'updated_at'],
      state.screenProjects,
      (item) => [
        item.id,
        item.name,
        item.group,
        item.scene,
        item.owner,
        item.status,
        item.publishedVersion,
        JSON.stringify(item.tags),
        JSON.stringify(item.screenNodes),
        item.updatedAt,
      ],
    )

    await replaceTable(
      connection,
      'scene_projects',
      ['id', 'name', 'project_group', 'owner', 'model_count', 'status', 'engine', 'scene_nodes', 'updated_at'],
      state.sceneProjects,
      (item) => [
        item.id,
        item.name,
        item.group,
        item.owner,
        item.modelCount,
        item.status,
        item.engine,
        JSON.stringify((item as any).sceneNodes || []),
        item.updatedAt,
      ],
    )

    try {
      await replaceTable(
        connection,
        'model_assets',
        ['id', 'name', 'category', 'description', 'tags', 'format', 'file_name', 'file_path', 'file_url', 'file_size', 'updated_at'],
        state.modelAssets ?? [],
        (item) => [
          item.id,
          item.name,
          item.category,
          item.description,
          JSON.stringify(item.tags),
          item.format,
          item.fileName,
          item.filePath,
          item.fileUrl,
          item.fileSize,
          item.updatedAt,
        ],
      )
    } catch {
      // Keep MySQL mode backward compatible when the model_assets table has not been migrated yet.
    }

    await replaceTable(
      connection,
      'data_sources',
      ['id', 'name', 'type', 'host', 'database_name', 'owner', 'status', 'updated_at'],
      state.dataSources,
      (item) => [
        item.id,
        item.name,
        item.type,
        item.host,
        item.database,
        item.owner,
        item.status,
        item.updatedAt,
      ],
    )

    await replaceTable(
      connection,
      'datasets',
      ['id', 'name', 'data_source_id', 'source_name', 'table_name', 'refresh_mode', 'field_count', 'updated_at'],
      state.datasets,
      (item) => [
        item.id,
        item.name,
        item.dataSourceId,
        item.sourceName,
        item.tableName,
        item.refreshMode,
        item.fieldCount,
        item.updatedAt,
      ],
    )

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    await connection.end()
  }
}

const mysqlAdapter: StorageAdapter = {
  mode: 'mysql',
  async loadState() {
    try {
      return await readStateFromMysql()
    } catch {
      return readMysqlFallback()
    }
  },
  async saveState(state) {
    writeMysqlFallback(state)
    await writeStateToMysql(state)
  },
  async resetState() {
    const state = cloneSeed()
    writeMysqlFallback(state)
    await writeStateToMysql(state)
    return state
  },
  async testConnection() {
    const tcp = await tcpCheck()
    if (!tcp.ok) {
      return tcp
    }

    try {
      const connection = await createMysqlConnection(true)
      await connection.query('SELECT 1')
      await connection.end()

      return {
        ok: true,
        message: `Connected to MySQL at ${mysqlConfig.user}@${mysqlConfig.host}:${mysqlConfig.port}/${mysqlConfig.database}`,
      }
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? `MySQL connection failed: ${error.message}`
            : 'MySQL connection failed',
      }
    }
  },
  async listUsers() {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, username, display_name, role, phone, password_hash, status, updated_at FROM users ORDER BY username',
      )
      return (rows as Array<Record<string, unknown>>).map(
        (row): PlatformUser => ({
          id: String(row.id),
          username: String(row.username),
          displayName: String(row.display_name),
          role: String(row.role),
          phone: String(row.phone),
          passwordHash: row.password_hash ? String(row.password_hash) : undefined,
          status: row.status as PlatformUser['status'],
          updatedAt: String(row.updated_at),
        }),
      )
    } finally {
      await connection.end()
    }
  },
  async findUserByUsername(username) {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, username, display_name, role, phone, password_hash, status, updated_at FROM users WHERE username = ? LIMIT 1',
        [username],
      )
      const row = (rows as Array<Record<string, unknown>>)[0]
      if (!row) {
        return null
      }
      return {
        id: String(row.id),
        username: String(row.username),
        displayName: String(row.display_name),
        role: String(row.role),
        phone: String(row.phone),
        passwordHash: row.password_hash ? String(row.password_hash) : undefined,
        status: row.status as PlatformUser['status'],
        updatedAt: String(row.updated_at),
      }
    } finally {
      await connection.end()
    }
  },
  async getUserById(id) {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, username, display_name, role, phone, password_hash, status, updated_at FROM users WHERE id = ? LIMIT 1',
        [id],
      )
      const row = (rows as Array<Record<string, unknown>>)[0]
      if (!row) {
        return null
      }
      return {
        id: String(row.id),
        username: String(row.username),
        displayName: String(row.display_name),
        role: String(row.role),
        phone: String(row.phone),
        passwordHash: row.password_hash ? String(row.password_hash) : undefined,
        status: row.status as PlatformUser['status'],
        updatedAt: String(row.updated_at),
      }
    } finally {
      await connection.end()
    }
  },
  async listRoles() {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, name, description, permissions FROM roles ORDER BY name',
      )
      return (rows as Array<Record<string, unknown>>).map(
        (row): RoleDefinition => ({
          id: String(row.id),
          name: String(row.name),
          description: String(row.description),
          permissions: parseJson<string[]>(row.permissions, []),
        }),
      )
    } finally {
      await connection.end()
    }
  },
  async createRole(role) {
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'INSERT INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)',
        [role.id, role.name, role.description, JSON.stringify(role.permissions)],
      )
      return role
    } finally {
      await connection.end()
    }
  },
  async updateRole(id, patch) {
    const current = (await this.listRoles?.())?.find((item) => item.id === id) ?? null
    if (!current) {
      return null
    }
    const next = { ...current, ...patch }
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'UPDATE roles SET name = ?, description = ?, permissions = ? WHERE id = ?',
        [next.name, next.description, JSON.stringify(next.permissions), id],
      )
      return next
    } finally {
      await connection.end()
    }
  },
  async deleteRole(id) {
    const connection = await createMysqlConnection(true)
    try {
      const [result] = await connection.query('DELETE FROM roles WHERE id = ?', [id])
      return Number((result as { affectedRows?: number }).affectedRows ?? 0) > 0
    } finally {
      await connection.end()
    }
  },
  async countUsersByRole(roleName) {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query('SELECT COUNT(*) AS count FROM users WHERE role = ?', [roleName])
      return Number((rows as Array<{ count: number | string }>)[0]?.count ?? 0)
    } finally {
      await connection.end()
    }
  },
  async createUser(user) {
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'INSERT INTO users (id, username, display_name, role, phone, password_hash, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.username, user.displayName, user.role, user.phone, user.passwordHash ?? '', user.status, user.updatedAt],
      )
      return user
    } finally {
      await connection.end()
    }
  },
  async updateUser(id, patch) {
    const current = (await this.listUsers?.())?.find((item) => item.id === id) ?? null
    if (!current) {
      return null
    }
    const next = { ...current, ...patch }
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'UPDATE users SET username = ?, display_name = ?, role = ?, phone = ?, password_hash = ?, status = ?, updated_at = ? WHERE id = ?',
        [next.username, next.displayName, next.role, next.phone, next.passwordHash ?? '', next.status, next.updatedAt, id],
      )
      return next
    } finally {
      await connection.end()
    }
  },
  async deleteUser(id) {
    const connection = await createMysqlConnection(true)
    try {
      const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id])
      return Number((result as { affectedRows?: number }).affectedRows ?? 0) > 0
    } finally {
      await connection.end()
    }
  },
  async listProjects() {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, name, type, project_group, owner, status, updated_at FROM projects ORDER BY name',
      )
      return (rows as Array<Record<string, unknown>>).map(
        (row): ManagedProject => ({
          id: String(row.id),
          name: String(row.name),
          type: row.type as ManagedProject['type'],
          group: String(row.project_group),
          owner: String(row.owner),
          status: row.status as ManagedProject['status'],
          updatedAt: String(row.updated_at),
        }),
      )
    } finally {
      await connection.end()
    }
  },
  async createProject(project) {
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'INSERT INTO projects (id, name, type, project_group, owner, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [project.id, project.name, project.type, project.group, project.owner, project.status, project.updatedAt],
      )
      return project
    } finally {
      await connection.end()
    }
  },
  async updateProject(id, patch) {
    const current = (await this.listProjects?.())?.find((item) => item.id === id) ?? null
    if (!current) {
      return null
    }
    const next = { ...current, ...patch }
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'UPDATE projects SET name = ?, type = ?, project_group = ?, owner = ?, status = ?, updated_at = ? WHERE id = ?',
        [next.name, next.type, next.group, next.owner, next.status, next.updatedAt, id],
      )
      return next
    } finally {
      await connection.end()
    }
  },
  async deleteProject(id) {
    const connection = await createMysqlConnection(true)
    try {
      const [result] = await connection.query('DELETE FROM projects WHERE id = ?', [id])
      return Number((result as { affectedRows?: number }).affectedRows ?? 0) > 0
    } finally {
      await connection.end()
    }
  },
  async listProjectMemberships() {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, user_id, project_id, access_level FROM project_memberships ORDER BY id',
      )
      return (rows as Array<Record<string, unknown>>).map(
        (row): ProjectMembership => ({
          id: String(row.id),
          userId: String(row.user_id),
          projectId: String(row.project_id),
          accessLevel: row.access_level as ProjectMembership['accessLevel'],
        }),
      )
    } finally {
      await connection.end()
    }
  },
  async listProjectMembershipsByUser(userId) {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, user_id, project_id, access_level FROM project_memberships WHERE user_id = ? ORDER BY id',
        [userId],
      )
      return (rows as Array<Record<string, unknown>>).map(
        (row): ProjectMembership => ({
          id: String(row.id),
          userId: String(row.user_id),
          projectId: String(row.project_id),
          accessLevel: row.access_level as ProjectMembership['accessLevel'],
        }),
      )
    } finally {
      await connection.end()
    }
  },
  async getProjectMembership(userId, projectId) {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, user_id, project_id, access_level FROM project_memberships WHERE user_id = ? AND project_id = ? LIMIT 1',
        [userId, projectId],
      )
      const row = (rows as Array<Record<string, unknown>>)[0]
      if (!row) {
        return null
      }
      return {
        id: String(row.id),
        userId: String(row.user_id),
        projectId: String(row.project_id),
        accessLevel: row.access_level as ProjectMembership['accessLevel'],
      }
    } finally {
      await connection.end()
    }
  },
  async createProjectMembership(membership) {
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'INSERT INTO project_memberships (id, user_id, project_id, access_level) VALUES (?, ?, ?, ?)',
        [membership.id, membership.userId, membership.projectId, membership.accessLevel],
      )
      return membership
    } finally {
      await connection.end()
    }
  },
  async updateProjectMembership(id, patch) {
    const memberships = await this.listProjectMemberships?.()
    const current = memberships?.find((item) => item.id === id) ?? null
    if (!current) {
      return null
    }
    const next = { ...current, ...patch }
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'UPDATE project_memberships SET user_id = ?, project_id = ?, access_level = ? WHERE id = ?',
        [next.userId, next.projectId, next.accessLevel, id],
      )
      return next
    } finally {
      await connection.end()
    }
  },
  async deleteProjectMembership(id) {
    const connection = await createMysqlConnection(true)
    try {
      const [result] = await connection.query('DELETE FROM project_memberships WHERE id = ?', [id])
      return Number((result as { affectedRows?: number }).affectedRows ?? 0) > 0
    } finally {
      await connection.end()
    }
  },
  async listProjectMembershipsByProject(projectId) {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, user_id, project_id, access_level FROM project_memberships WHERE project_id = ? ORDER BY id',
        [projectId],
      )
      return (rows as Array<Record<string, unknown>>).map(
        (row): ProjectMembership => ({
          id: String(row.id),
          userId: String(row.user_id),
          projectId: String(row.project_id),
          accessLevel: row.access_level as ProjectMembership['accessLevel'],
        }),
      )
    } finally {
      await connection.end()
    }
  },
  async listScreenProjects() {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, name, project_group, scene, owner, status, published_version, tags, screen_nodes, updated_at FROM screen_projects ORDER BY name',
      )
      return (rows as Array<Record<string, unknown>>).map(
        (row): ScreenProject => ({
          id: String(row.id),
          name: String(row.name),
          group: String(row.project_group),
          scene: String(row.scene),
          owner: String(row.owner),
          status: row.status as ScreenProject['status'],
          publishedVersion: String(row.published_version),
          tags: parseJson<string[]>(row.tags, []),
          screenNodes: parseJson<ScreenNode[]>(row.screen_nodes, []),
          updatedAt: String(row.updated_at),
        }),
      )
    } finally {
      await connection.end()
    }
  },
  async createScreenProject(project) {
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'INSERT INTO screen_projects (id, name, project_group, scene, owner, status, published_version, tags, screen_nodes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          project.id,
          project.name,
          project.group,
          project.scene,
          project.owner,
          project.status,
          project.publishedVersion,
          JSON.stringify(project.tags),
          JSON.stringify(project.screenNodes),
          project.updatedAt,
        ],
      )
      return project
    } finally {
      await connection.end()
    }
  },
  async updateScreenProject(id, patch) {
    const current = (await this.listScreenProjects?.())?.find((item) => item.id === id) ?? null
    if (!current) {
      return null
    }
    const next = { ...current, ...patch }
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'UPDATE screen_projects SET name = ?, project_group = ?, scene = ?, owner = ?, status = ?, published_version = ?, tags = ?, screen_nodes = ?, updated_at = ? WHERE id = ?',
        [
          next.name,
          next.group,
          next.scene,
          next.owner,
          next.status,
          next.publishedVersion,
          JSON.stringify(next.tags),
          JSON.stringify(next.screenNodes),
          next.updatedAt,
          id,
        ],
      )
      return next
    } finally {
      await connection.end()
    }
  },
  async deleteScreenProject(id) {
    const connection = await createMysqlConnection(true)
    try {
      const [result] = await connection.query('DELETE FROM screen_projects WHERE id = ?', [id])
      return Number((result as { affectedRows?: number }).affectedRows ?? 0) > 0
    } finally {
      await connection.end()
    }
  },
  async listSceneProjects() {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, name, project_group, owner, model_count, status, engine, scene_nodes, updated_at FROM scene_projects ORDER BY name',
      )
      return (rows as Array<Record<string, unknown>>).map(
        (row): SceneProject => ({
          id: String(row.id),
          name: String(row.name),
          group: String(row.project_group),
          owner: String(row.owner),
          modelCount: Number(row.model_count),
          status: row.status as SceneProject['status'],
          engine: String(row.engine),
          sceneNodes: parseJson<any[]>(row.scene_nodes, []),
          updatedAt: String(row.updated_at),
        }),
      )
    } finally {
      await connection.end()
    }
  },
  async createSceneProject(project) {
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'INSERT INTO scene_projects (id, name, project_group, owner, model_count, status, engine, scene_nodes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          project.id,
          project.name,
          project.group,
          project.owner,
          project.modelCount,
          project.status,
          project.engine,
          JSON.stringify(project.sceneNodes || []),
          project.updatedAt
        ],
      )
      return project
    } finally {
      await connection.end()
    }
  },
  async updateSceneProject(id, patch) {
    const current = (await this.listSceneProjects?.())?.find((item) => item.id === id) ?? null
    if (!current) {
      return null
    }
    const next = { ...current, ...patch }
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'UPDATE scene_projects SET name = ?, project_group = ?, owner = ?, model_count = ?, status = ?, engine = ?, scene_nodes = ?, updated_at = ? WHERE id = ?',
        [
          next.name,
          next.group,
          next.owner,
          next.modelCount,
          next.status,
          next.engine,
          JSON.stringify(next.sceneNodes || []),
          next.updatedAt,
          id
        ],
      )
      return next
    } finally {
      await connection.end()
    }
  },
  async deleteSceneProject(id) {
    const connection = await createMysqlConnection(true)
    try {
      const [result] = await connection.query('DELETE FROM scene_projects WHERE id = ?', [id])
      return Number((result as { affectedRows?: number }).affectedRows ?? 0) > 0
    } finally {
      await connection.end()
    }
  },
  async listModelAssets() {
    const connection = await createMysqlConnection(true)
    try {
      try {
        const [rows] = await connection.query(
          'SELECT id, name, category, description, tags, format, file_name, file_path, file_url, file_size, updated_at FROM model_assets ORDER BY updated_at DESC',
        )
        return (rows as Array<Record<string, unknown>>).map(
          (row): ModelAsset => ({
            id: String(row.id),
            name: String(row.name),
            category: String(row.category ?? ''),
            description: String(row.description ?? ''),
            tags: parseJson<string[]>(row.tags, []),
            format: row.format as ModelAsset['format'],
            fileName: String(row.file_name ?? ''),
            filePath: String(row.file_path ?? ''),
            fileUrl: String(row.file_url ?? ''),
            fileSize: Number(row.file_size ?? 0),
            updatedAt: String(row.updated_at ?? ''),
          }),
        )
      } catch {
        return readMysqlFallback().modelAssets ?? []
      }
    } finally {
      await connection.end()
    }
  },
  async createModelAsset(asset) {
    const connection = await createMysqlConnection(true)
    try {
      try {
        await connection.query(
          'INSERT INTO model_assets (id, name, category, description, tags, format, file_name, file_path, file_url, file_size, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            asset.id,
            asset.name,
            asset.category,
            asset.description,
            JSON.stringify(asset.tags),
            asset.format,
            asset.fileName,
            asset.filePath,
            asset.fileUrl,
            asset.fileSize,
            asset.updatedAt,
          ],
        )
      } catch {
        const state = readMysqlFallback()
        state.modelAssets = [asset, ...(state.modelAssets ?? [])]
        writeMysqlFallback(state)
      }
      return asset
    } finally {
      await connection.end()
    }
  },
  async updateModelAsset(id, patch) {
    const current = (await this.listModelAssets?.())?.find((item) => item.id === id) ?? null
    if (!current) {
      return null
    }
    const next = { ...current, ...patch }
    const connection = await createMysqlConnection(true)
    try {
      try {
        await connection.query(
          'UPDATE model_assets SET name = ?, category = ?, description = ?, tags = ?, format = ?, file_name = ?, file_path = ?, file_url = ?, file_size = ?, updated_at = ? WHERE id = ?',
          [
            next.name,
            next.category,
            next.description,
            JSON.stringify(next.tags),
            next.format,
            next.fileName,
            next.filePath,
            next.fileUrl,
            next.fileSize,
            next.updatedAt,
            id,
          ],
        )
      } catch {
        const state = readMysqlFallback()
        const assets = state.modelAssets ?? []
        const index = assets.findIndex((item) => item.id === id)
        if (index !== -1) {
          assets[index] = next
          state.modelAssets = assets
          writeMysqlFallback(state)
        }
      }
      return next
    } finally {
      await connection.end()
    }
  },
  async deleteModelAsset(id) {
    const connection = await createMysqlConnection(true)
    try {
      try {
        const [result] = await connection.query('DELETE FROM model_assets WHERE id = ?', [id])
        return Number((result as { affectedRows?: number }).affectedRows ?? 0) > 0
      } catch {
        const state = readMysqlFallback()
        const next = (state.modelAssets ?? []).filter((item) => item.id !== id)
        if (next.length === (state.modelAssets ?? []).length) {
          return false
        }
        state.modelAssets = next
        writeMysqlFallback(state)
        return true
      }
    } finally {
      await connection.end()
    }
  },
  async listDataSources() {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, name, type, host, database_name, owner, status, updated_at FROM data_sources ORDER BY name',
      )
      return (rows as Array<Record<string, unknown>>).map(
        (row): DataSource => ({
          id: String(row.id),
          name: String(row.name),
          type: row.type as DataSource['type'],
          host: String(row.host),
          database: String(row.database_name),
          owner: String(row.owner),
          status: row.status as DataSource['status'],
          updatedAt: String(row.updated_at),
        }),
      )
    } finally {
      await connection.end()
    }
  },
  async createDataSource(source) {
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'INSERT INTO data_sources (id, name, type, host, database_name, owner, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [source.id, source.name, source.type, source.host, source.database, source.owner, source.status, source.updatedAt],
      )
      return source
    } finally {
      await connection.end()
    }
  },
  async updateDataSource(id, patch) {
    const current = (await this.listDataSources?.())?.find((item) => item.id === id) ?? null
    if (!current) {
      return null
    }
    const next = { ...current, ...patch }
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'UPDATE data_sources SET name = ?, type = ?, host = ?, database_name = ?, owner = ?, status = ?, updated_at = ? WHERE id = ?',
        [next.name, next.type, next.host, next.database, next.owner, next.status, next.updatedAt, id],
      )
      return next
    } finally {
      await connection.end()
    }
  },
  async deleteDataSource(id) {
    const connection = await createMysqlConnection(true)
    try {
      const [result] = await connection.query('DELETE FROM data_sources WHERE id = ?', [id])
      return Number((result as { affectedRows?: number }).affectedRows ?? 0) > 0
    } finally {
      await connection.end()
    }
  },
  async listDatasets() {
    const connection = await createMysqlConnection(true)
    try {
      const [rows] = await connection.query(
        'SELECT id, name, data_source_id, source_name, table_name, refresh_mode, field_count, updated_at FROM datasets ORDER BY name',
      )
      return (rows as Array<Record<string, unknown>>).map(
        (row): Dataset => ({
          id: String(row.id),
          name: String(row.name),
          dataSourceId: String(row.data_source_id),
          sourceName: String(row.source_name),
          tableName: String(row.table_name),
          refreshMode: row.refresh_mode as Dataset['refreshMode'],
          fieldCount: Number(row.field_count),
          updatedAt: String(row.updated_at),
        }),
      )
    } finally {
      await connection.end()
    }
  },
  async createDataset(dataset) {
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'INSERT INTO datasets (id, name, data_source_id, source_name, table_name, refresh_mode, field_count, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          dataset.id,
          dataset.name,
          dataset.dataSourceId,
          dataset.sourceName,
          dataset.tableName,
          dataset.refreshMode,
          dataset.fieldCount,
          dataset.updatedAt,
        ],
      )
      return dataset
    } finally {
      await connection.end()
    }
  },
  async updateDataset(id, patch) {
    const current = (await this.listDatasets?.())?.find((item) => item.id === id) ?? null
    if (!current) {
      return null
    }
    const next = { ...current, ...patch }
    const connection = await createMysqlConnection(true)
    try {
      await connection.query(
        'UPDATE datasets SET name = ?, data_source_id = ?, source_name = ?, table_name = ?, refresh_mode = ?, field_count = ?, updated_at = ? WHERE id = ?',
        [next.name, next.dataSourceId, next.sourceName, next.tableName, next.refreshMode, next.fieldCount, next.updatedAt, id],
      )
      return next
    } finally {
      await connection.end()
    }
  },
  async deleteDataset(id) {
    const connection = await createMysqlConnection(true)
    try {
      const [result] = await connection.query('DELETE FROM datasets WHERE id = ?', [id])
      return Number((result as { affectedRows?: number }).affectedRows ?? 0) > 0
    } finally {
      await connection.end()
    }
  },
}

const adapter = storageMode === 'mysql' ? mysqlAdapter : fileAdapter

export const getStorageAdapter = () => adapter
export const loadState = () => adapter.loadState()
export const saveState = (state: PlatformState) => adapter.saveState(state)
export const resetState = () => adapter.resetState()
export const listUsers = () => adapter.listUsers?.()
export const findUserByUsername = (username: string) => adapter.findUserByUsername?.(username)
export const getUserById = (id: string) => adapter.getUserById?.(id)
export const listRoles = () => adapter.listRoles?.()
export const createRole = (role: RoleDefinition) => adapter.createRole?.(role)
export const updateRole = (id: string, patch: Partial<RoleDefinition>) => adapter.updateRole?.(id, patch)
export const deleteRole = (id: string) => adapter.deleteRole?.(id)
export const countUsersByRole = (roleName: string) => adapter.countUsersByRole?.(roleName)
export const createUser = (user: PlatformUser) => adapter.createUser?.(user)
export const updateUser = (id: string, patch: Partial<PlatformUser>) => adapter.updateUser?.(id, patch)
export const deleteUser = (id: string) => adapter.deleteUser?.(id)
export const listProjects = () => adapter.listProjects?.()
export const createProject = (project: ManagedProject) => adapter.createProject?.(project)
export const updateProject = (id: string, patch: Partial<ManagedProject>) => adapter.updateProject?.(id, patch)
export const deleteProject = (id: string) => adapter.deleteProject?.(id)
export const listProjectMemberships = () => adapter.listProjectMemberships?.()
export const listProjectMembershipsByUser = (userId: string) => adapter.listProjectMembershipsByUser?.(userId)
export const getProjectMembership = (userId: string, projectId: string) =>
  adapter.getProjectMembership?.(userId, projectId)
export const createProjectMembership = (membership: ProjectMembership) =>
  adapter.createProjectMembership?.(membership)
export const updateProjectMembership = (id: string, patch: Partial<ProjectMembership>) =>
  adapter.updateProjectMembership?.(id, patch)
export const deleteProjectMembership = (id: string) => adapter.deleteProjectMembership?.(id)
export const listProjectMembershipsByProject = (projectId: string) =>
  adapter.listProjectMembershipsByProject?.(projectId)
export const listScreenProjects = () => adapter.listScreenProjects?.()
export const createScreenProject = (project: ScreenProject) => adapter.createScreenProject?.(project)
export const updateScreenProject = (id: string, patch: Partial<ScreenProject>) =>
  adapter.updateScreenProject?.(id, patch)
export const deleteScreenProject = (id: string) => adapter.deleteScreenProject?.(id)
export const listSceneProjects = () => adapter.listSceneProjects?.()
export const createSceneProject = (project: SceneProject) => adapter.createSceneProject?.(project)
export const updateSceneProject = (id: string, patch: Partial<SceneProject>) =>
  adapter.updateSceneProject?.(id, patch)
export const deleteSceneProject = (id: string) => adapter.deleteSceneProject?.(id)
export const listModelAssets = () => adapter.listModelAssets?.()
export const createModelAsset = (asset: ModelAsset) => adapter.createModelAsset?.(asset)
export const updateModelAsset = (id: string, patch: Partial<ModelAsset>) =>
  adapter.updateModelAsset?.(id, patch)
export const deleteModelAsset = (id: string) => adapter.deleteModelAsset?.(id)
export const listDataSources = () => adapter.listDataSources?.()
export const createDataSource = (source: DataSource) => adapter.createDataSource?.(source)
export const updateDataSource = (id: string, patch: Partial<DataSource>) => adapter.updateDataSource?.(id, patch)
export const deleteDataSource = (id: string) => adapter.deleteDataSource?.(id)
export const listDatasets = () => adapter.listDatasets?.()
export const createDataset = (dataset: Dataset) => adapter.createDataset?.(dataset)
export const updateDataset = (id: string, patch: Partial<Dataset>) => adapter.updateDataset?.(id, patch)
export const deleteDataset = (id: string) => adapter.deleteDataset?.(id)
export const getStorageStatus = async () => ({
  mode: adapter.mode,
  ...(await adapter.testConnection()),
})
