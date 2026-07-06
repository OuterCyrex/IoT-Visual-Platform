export type ProjectStatus = 'draft' | 'editing' | 'published' | 'archived'
export type ConnectionStatus = 'connected' | 'warning' | 'failed'
export type UserStatus = 'active' | 'disabled'

export interface ScreenProject {
  id: string
  name: string
  group: string
  scene: string
  owner: string
  updatedAt: string
  status: ProjectStatus
  publishedVersion: string
  tags: string[]
}

export interface SceneProject {
  id: string
  name: string
  group: string
  owner: string
  modelCount: number
  updatedAt: string
  status: ProjectStatus
  engine: string
}

export interface DataSource {
  id: string
  name: string
  type: 'MySQL' | 'MQTT' | 'REST'
  host: string
  database: string
  owner: string
  updatedAt: string
  status: ConnectionStatus
}

export interface Dataset {
  id: string
  name: string
  sourceName: string
  tableName: string
  refreshMode: 'manual' | '5 min' | 'real-time'
  fieldCount: number
  updatedAt: string
}

export interface PlatformUser {
  id: string
  username: string
  displayName: string
  role: string
  phone: string
  updatedAt: string
  status: UserStatus
}

export interface ManagedProject {
  id: string
  name: string
  type: '2D' | '3D'
  group: string
  owner: string
  updatedAt: string
  status: ProjectStatus
}
