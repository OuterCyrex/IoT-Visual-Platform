import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envFile = resolve(process.cwd(), '.env')

if (existsSync(envFile)) {
  const content = readFileSync(envFile, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

export type StorageMode = 'file' | 'mysql'

export interface MysqlConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

export const storageMode = (process.env.STORAGE_MODE ?? 'file') as StorageMode

export const mysqlConfig: MysqlConfig = {
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE ?? 'iot_visual_platform',
}

export const uploadsRoot = resolve(process.cwd(), process.env.UPLOADS_DIR ?? 'server/uploads')
export const modelUploadsDir = resolve(uploadsRoot, 'models')
export const sceneExportDir = resolve(uploadsRoot, 'scene-exports')
