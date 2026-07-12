export type ProjectStatus = 'draft' | 'editing' | 'published' | 'archived'
export type ConnectionStatus = 'connected' | 'warning' | 'failed'
export type UserStatus = 'active' | 'disabled'

export interface ScreenNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  component: string
  locked?: boolean
  groupId?: string
  rotate?: number
  props: Record<string, unknown>
}

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
  screenNodes: ScreenNode[]
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
  sceneNodes: SceneNodeData[]
  publishedFileUrl?: string
}

export interface ModelAsset {
  id: string
  name: string
  category: string
  description: string
  tags: string[]
  format: 'glb' | 'gltf'
  fileName: string
  filePath: string
  fileUrl: string
  fileSize: number
  updatedAt: string
}

export interface SceneNodeData {
  id: string
  name: string
  type: string
  sourceType?: 'procedural' | 'imported' | 'asset'
  assetId?: string
  sourceUrl?: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  props: Record<string, unknown>
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
  dataSourceId: string
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
