import { hashPassword, issueToken, verifyPassword } from '../lib/auth.ts'
import type { RouteDefinition } from '../lib/http.ts'
import { badRequest, sendJson, sendNoContent, unauthorized } from '../lib/http.ts'
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import multer from 'multer'
import { modelUploadsDir, sceneExportDir } from '../lib/config.ts'
import { createMysqlConnectionForDataSource } from '../lib/mysql.ts'
import {
  countUsersByRole,
  createModelAsset,
  createDataSource,
  createDataset,
  createProject,
  createProjectMembership,
  createRole,
  createSceneProject,
  createScreenProject,
  createUser,
  deleteModelAsset,
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
  listModelAssets,
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
  ModelAsset,
  PlatformState,
  PlatformUser,
  ProjectMembership,
  RoleDefinition,
  SceneProject,
  ScreenNode,
  ScreenProject,
} from '../types/platform.ts'

const virtualServerRoomSource: DataSource = {
  id: 'ds-virtual-server-room',
  name: '机房实时 Mock REST',
  type: 'REST',
  host: 'http://factory.local/mock',
  database: '/server-room',
  owner: 'System',
  status: 'connected',
  updatedAt: '2026-07-11 00:00',
}

const virtualServerRoomDatasets: Dataset[] = [
  {
    id: 'set-server-room-live',
    name: '机房设备实时数据',
    dataSourceId: virtualServerRoomSource.id,
    sourceName: virtualServerRoomSource.name,
    tableName: 'server-room/live',
    refreshMode: 'real-time',
    fieldCount: 9,
    updatedAt: '2026-07-11 00:00',
  },
]

const buildServerRoomLiveRows = () => {
  const nowMs = Date.now()
  const drift = Math.sin(nowMs / 4000)
  const swing = Math.cos(nowMs / 5200)
  const rows: Array<Record<string, unknown>> = []

  const rackZones = ['A列', 'B列', 'C列', 'D列']
  rackZones.forEach((zone, zoneIndex) => {
    for (let i = 1; i <= 8; i += 1) {
      const code = `${zone.charAt(0).toLowerCase()}${String(i).padStart(2, '0')}`
      const phase = zoneIndex * 0.45 + i * 0.12
      rows.push({
        id: `rack-${code}`,
        device: `rack-${code}`,
        name: `${zone}-${String(i).padStart(2, '0')} 机柜`,
        zone,
        status: zoneIndex === 1 && i === 5 ? 'warning' : zoneIndex === 3 && i === 8 ? 'idle' : 'running',
        intake_temp: Number((22.4 + drift * 1.1 + phase * 0.15).toFixed(1)),
        outlet_temp: Number((29.8 + swing * 1.9 + phase * 0.22).toFixed(1)),
        power_kw: Number((4.8 + zoneIndex * 0.7 + i * 0.18 + drift * 0.55).toFixed(2)),
        humidity: Number((44.5 + swing * 1.6 + zoneIndex * 0.45).toFixed(1)),
        timestamp: nowText(),
      })
    }
  })

  for (let i = 1; i <= 4; i += 1) {
    rows.push({
      id: `cooling-${String(i).padStart(2, '0')}`,
      device: `cooling-${String(i).padStart(2, '0')}`,
      name: `${i}号精密空调`,
      zone: '制冷区',
      status: i === 2 && swing > 0.72 ? 'warning' : 'running',
      supply_temp: Number((18.1 + i * 0.15 + drift * 0.85).toFixed(1)),
      return_temp: Number((26.4 + i * 0.2 + swing * 1.25).toFixed(1)),
      airflow: Number((7800 + i * 220 + drift * 360).toFixed(0)),
      load_percent: Number((56 + i * 3 + swing * 6.5).toFixed(1)),
      timestamp: nowText(),
    })
  }

  for (let i = 1; i <= 2; i += 1) {
    rows.push({
      id: `ups-${String(i).padStart(2, '0')}`,
      device: `ups-${String(i).padStart(2, '0')}`,
      name: `${i}号 UPS 机组`,
      zone: '动力区',
      status: i === 1 && drift > 0.82 ? 'warning' : 'running',
      load_percent: Number((48 + i * 4 + drift * 8).toFixed(1)),
      battery_soc: Number((95 - i * 1.8 - Math.abs(swing) * 3.6).toFixed(1)),
      output_kw: Number((36 + i * 6.8 + swing * 3.2).toFixed(1)),
      timestamp: nowText(),
    })

    rows.push({
      id: `pdu-${String(i).padStart(2, '0')}`,
      device: `pdu-${String(i).padStart(2, '0')}`,
      name: `${i}号列头柜 PDU`,
      zone: '动力区',
      status: 'running',
      load_percent: Number((44 + i * 3 + swing * 5.5).toFixed(1)),
      current_amp: Number((152 + i * 11 + drift * 10).toFixed(1)),
      voltage: Number((220 + swing * 1.8).toFixed(1)),
      timestamp: nowText(),
    })

    rows.push({
      id: `power-${String(i).padStart(2, '0')}`,
      device: `power-${String(i).padStart(2, '0')}`,
      name: `${i}号动力柜`,
      zone: '配电区',
      status: 'running',
      load_percent: Number((50 + i * 4 + drift * 4).toFixed(1)),
      current_amp: Number((180 + i * 15 + swing * 8).toFixed(1)),
      voltage: Number((380 + drift * 3).toFixed(1)),
      timestamp: nowText(),
    })
  }

  return rows
}

const buildServerRoomClosedLoopRows = () => {
  const nowMs = Date.now()
  const drift = Math.sin(nowMs / 4200)
  const swing = Math.cos(nowMs / 6100)
  const pulse = (Math.sin(nowMs / 3000) + 1) / 2
  const rows: Array<Record<string, unknown>> = []

  const rackGroups = [
    { zone: 'A', feed: 'a', cooling: 'a', basePower: 5.1 },
    { zone: 'B', feed: 'a', cooling: 'a', basePower: 5.6 },
    { zone: 'C', feed: 'b', cooling: 'b', basePower: 6.0 },
    { zone: 'D', feed: 'b', cooling: 'b', basePower: 6.4 },
  ]

  const feedPower = { a: 0, b: 0 }
  const coldAislePower = { a: 0, b: 0 }
  const coldAisleTemps = { a: [] as number[], b: [] as number[] }
  let totalPowerKw = 0

  rackGroups.forEach((group, groupIndex) => {
    for (let i = 1; i <= 8; i += 1) {
      const suffix = `${group.zone.toLowerCase()}${String(i).padStart(2, '0')}`
      const phase = groupIndex * 0.38 + i * 0.17
      const powerKw = Number((group.basePower + i * 0.22 + drift * 0.5 + swing * 0.18).toFixed(2))
      const intakeTemp = Number((21.8 + phase * 0.22 + pulse * 1.1).toFixed(1))
      const outletTemp = Number((intakeTemp + 6.4 + Math.abs(swing) * 1.7 + i * 0.08).toFixed(1))
      const humidity = Number((45.5 + groupIndex * 0.6 + swing * 1.8).toFixed(1))
      const hotRack = (group.zone === 'B' && i === 5) || (group.zone === 'D' && i === 7 && pulse > 0.55)
      const alarmLevel = hotRack ? 'warning' : 'normal'
      const status = hotRack ? 'warning' : 'running'
      const alarmMessage = hotRack ? 'Inlet temperature rising' : 'Normal'

      rows.push({
        id: `rack-${suffix}`,
        device: `rack-${suffix}`,
        name: `Rack ${group.zone}-${String(i).padStart(2, '0')}`,
        zone: `row-${group.zone}`,
        power_feed: group.feed,
        cooling_loop: group.cooling,
        status,
        alarm_level: alarmLevel,
        alarm_message: alarmMessage,
        intake_temp: intakeTemp,
        outlet_temp: outletTemp,
        power_kw: powerKw,
        humidity,
        timestamp: nowText(),
      })

      feedPower[group.feed] += powerKw
      coldAislePower[group.cooling] += powerKw
      coldAisleTemps[group.cooling].push(intakeTemp)
      totalPowerKw += powerKw
    }
  })

  const buswayALoadKw = Number((feedPower.a * 1.03).toFixed(2))
  const buswayBLoadKw = Number((feedPower.b * 1.03).toFixed(2))
  const totalUpsOutputKw = Number((buswayALoadKw + buswayBLoadKw + 8.6).toFixed(2))
  const totalCoolingLoadPercent = Number((58 + totalPowerKw / 14 + swing * 3.4).toFixed(1))
  const avgColdAisleATemp = coldAisleTemps.a.reduce((sum, value) => sum + value, 0) / coldAisleTemps.a.length
  const avgColdAisleBTemp = coldAisleTemps.b.reduce((sum, value) => sum + value, 0) / coldAisleTemps.b.length
  const coldAisleStatusA = avgColdAisleATemp > 24.5 ? 'warning' : 'running'
  const coldAisleStatusB = avgColdAisleBTemp > 24.8 ? 'warning' : 'running'
  const totalAlarmCount = rows.filter((row) => row.alarm_level === 'warning' || row.alarm_level === 'critical').length

  rows.push({
    id: 'substation-main',
    device: 'substation-main',
    name: 'Substation Main',
    zone: 'power-entry',
    status: totalPowerKw > 210 ? 'warning' : 'running',
    alarm_level: totalPowerKw > 220 ? 'critical' : totalPowerKw > 210 ? 'warning' : 'normal',
    alarm_message: totalPowerKw > 220 ? 'Incoming feeder nearing capacity' : 'Normal',
    input_kw: Number((totalUpsOutputKw + totalCoolingLoadPercent * 0.62 + 12).toFixed(1)),
    voltage: Number((398 + drift * 2.8).toFixed(1)),
    current_amp: Number((332 + totalPowerKw * 0.72 + swing * 9).toFixed(1)),
    power_factor: Number((0.97 - Math.abs(drift) * 0.02).toFixed(2)),
    frequency_hz: Number((50 + swing * 0.04).toFixed(2)),
    timestamp: nowText(),
  })

  ;[
    { id: 'busway-a', loadKw: buswayALoadKw, aisleTemp: avgColdAisleATemp, status: coldAisleStatusA },
    { id: 'busway-b', loadKw: buswayBLoadKw, aisleTemp: avgColdAisleBTemp, status: coldAisleStatusB },
  ].forEach((item, index) => {
    rows.push({
      id: item.id,
      device: item.id,
      name: item.id.toUpperCase(),
      zone: 'busway',
      status: item.status,
      alarm_level: item.status === 'warning' ? 'warning' : 'normal',
      alarm_message: item.status === 'warning' ? 'Busway temperature elevated' : 'Normal',
      load_percent: Number((item.loadKw / 110 * 100).toFixed(1)),
      current_amp: Number((168 + item.loadKw * 1.85 + index * 6).toFixed(1)),
      voltage: Number((230 + swing * 1.6).toFixed(1)),
      bus_temp: Number((31.6 + item.aisleTemp * 0.18 + pulse * 3.2).toFixed(1)),
      timestamp: nowText(),
    })
  })

  ;[
    { id: 'power-01', loadKw: buswayALoadKw, currentOffset: 0 },
    { id: 'power-02', loadKw: buswayBLoadKw, currentOffset: 12 },
  ].forEach((item) => {
    const loadPercent = Number((item.loadKw / 125 * 100).toFixed(1))
    rows.push({
      id: item.id,
      device: item.id,
      name: item.id.toUpperCase(),
      zone: 'power-room',
      status: loadPercent > 78 ? 'warning' : 'running',
      alarm_level: loadPercent > 85 ? 'critical' : loadPercent > 78 ? 'warning' : 'normal',
      alarm_message: loadPercent > 78 ? 'Power cabinet load rising' : 'Normal',
      input_kw: Number((item.loadKw + 3.6).toFixed(1)),
      load_percent: loadPercent,
      current_amp: Number((182 + item.loadKw * 1.52 + item.currentOffset + drift * 8).toFixed(1)),
      voltage: Number((380 + drift * 2.6).toFixed(1)),
      cabinet_temp: Number((28.8 + loadPercent * 0.07 + pulse * 1.4).toFixed(1)),
      timestamp: nowText(),
    })
  })

  ;[
    { id: 'ups-01', outputKw: Number((buswayALoadKw + 4.2).toFixed(1)), batteryLoss: 0 },
    { id: 'ups-02', outputKw: Number((buswayBLoadKw + 4.4).toFixed(1)), batteryLoss: 1.8 },
  ].forEach((item, index) => {
    const loadPercent = Number((item.outputKw / 96 * 100).toFixed(1))
    const batterySoc = Number((96 - item.batteryLoss - pulse * 3.4 - index * 1.2).toFixed(1))
    rows.push({
      id: item.id,
      device: item.id,
      name: item.id.toUpperCase(),
      zone: 'ups-room',
      status: loadPercent > 72 || batterySoc < 90 ? 'warning' : 'running',
      alarm_level: loadPercent > 82 ? 'critical' : loadPercent > 72 || batterySoc < 90 ? 'warning' : 'normal',
      alarm_message: batterySoc < 90 ? 'Battery discharge margin reduced' : loadPercent > 72 ? 'UPS load elevated' : 'Normal',
      output_kw: item.outputKw,
      load_percent: loadPercent,
      battery_soc: batterySoc,
      backup_min: Number((22 - loadPercent * 0.08 - index * 1.5).toFixed(1)),
      timestamp: nowText(),
    })
  })

  ;[
    { id: 'pdu-01', loadKw: buswayALoadKw * 0.98 },
    { id: 'pdu-02', loadKw: buswayBLoadKw * 0.98 },
  ].forEach((item, index) => {
    const loadPercent = Number((item.loadKw / 90 * 100).toFixed(1))
    rows.push({
      id: item.id,
      device: item.id,
      name: item.id.toUpperCase(),
      zone: 'distribution',
      status: loadPercent > 76 ? 'warning' : 'running',
      alarm_level: loadPercent > 84 ? 'critical' : loadPercent > 76 ? 'warning' : 'normal',
      alarm_message: loadPercent > 76 ? 'PDU branch nearing threshold' : 'Normal',
      load_percent: loadPercent,
      current_amp: Number((146 + item.loadKw * 1.22 + drift * 7 + index * 4).toFixed(1)),
      voltage: Number((220 + swing * 1.3).toFixed(1)),
      branch_temp: Number((30.4 + loadPercent * 0.06 + pulse * 1.2).toFixed(1)),
      timestamp: nowText(),
    })
  })

  ;[
    { id: 'cold-aisle-a', avgTemp: avgColdAisleATemp, powerKw: coldAislePower.a, humidityOffset: 0.8 },
    { id: 'cold-aisle-b', avgTemp: avgColdAisleBTemp, powerKw: coldAislePower.b, humidityOffset: 1.2 },
  ].forEach((item) => {
    rows.push({
      id: item.id,
      device: item.id,
      name: item.id.toUpperCase(),
      zone: 'cooling-loop',
      status: item.avgTemp > 24.7 ? 'warning' : 'running',
      alarm_level: item.avgTemp > 25.3 ? 'critical' : item.avgTemp > 24.7 ? 'warning' : 'normal',
      alarm_message: item.avgTemp > 24.7 ? 'Cold aisle supply temperature high' : 'Normal',
      aisle_temp: Number(item.avgTemp.toFixed(1)),
      humidity: Number((46.2 + item.humidityOffset + swing * 1.4).toFixed(1)),
      airflow: Number((16200 + item.powerKw * 23 + drift * 240).toFixed(0)),
      timestamp: nowText(),
    })
  })

  for (let i = 1; i <= 4; i += 1) {
    const linkedPower = i <= 2 ? coldAislePower.a : coldAislePower.b
    const loadPercent = Number((52 + linkedPower / 10 + i * 2.4 + swing * 2.8).toFixed(1))
    const returnTemp = Number((25.9 + linkedPower * 0.032 + pulse * 1.5 + i * 0.18).toFixed(1))
    rows.push({
      id: `cooling-${String(i).padStart(2, '0')}`,
      device: `cooling-${String(i).padStart(2, '0')}`,
      name: `Cooling-${String(i).padStart(2, '0')}`,
      zone: 'precision-cooling',
      status: loadPercent > 74 || (i === 2 && pulse > 0.72) ? 'warning' : 'running',
      alarm_level: loadPercent > 82 ? 'critical' : loadPercent > 74 || (i === 2 && pulse > 0.72) ? 'warning' : 'normal',
      alarm_message: i === 2 && pulse > 0.72 ? 'Compressor stage shifted to high load' : loadPercent > 74 ? 'Cooling load elevated' : 'Normal',
      supply_temp: Number((18.2 + drift * 0.7 + i * 0.12).toFixed(1)),
      return_temp: returnTemp,
      airflow: Number((7600 + linkedPower * 18 + i * 140 + swing * 180).toFixed(0)),
      load_percent: loadPercent,
      cop: Number((3.4 - loadPercent * 0.008 + swing * 0.06).toFixed(2)),
      timestamp: nowText(),
    })
  }

  rows.push({
    id: 'ops-desk',
    device: 'ops-desk',
    name: 'Ops Desk',
    zone: 'monitoring',
    status: totalAlarmCount > 0 ? 'attention' : 'running',
    alarm_level: totalAlarmCount > 3 ? 'warning' : 'normal',
    alarm_message: totalAlarmCount > 0 ? 'Active alarms require inspection' : 'All systems normal',
    pue: Number((1.42 + totalCoolingLoadPercent / 260 + pulse * 0.03).toFixed(2)),
    active_alarms: totalAlarmCount,
    total_power_kw: Number(totalPowerKw.toFixed(1)),
    timestamp: nowText(),
  })

  return rows
}

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

  // if (source.type !== 'MySQL' && source.type !== 'REST' && source.type !== 'MQTT') {
  //   throw new RouteValidationError('Only MySQL and REST data sources are supported for datasets')
  // }

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

const ensureUploadDirs = () => {
  mkdirSync(modelUploadsDir, { recursive: true })
  mkdirSync(sceneExportDir, { recursive: true })
}

ensureUploadDirs()

const modelUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, modelUploadsDir)
    },
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase()
      cb(null, `${createId('ast')}${ext}`)
    },
  }),
})

const normalizeTextArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return []
  }
  return value.map((item) => String(item).trim()).filter(Boolean)
}

const buildSceneExportPayload = (project: SceneProject) => ({
  version: '1.0.0',
  exportedAt: nowText(),
  project: {
    name: project.name,
    group: project.group,
    owner: project.owner,
    engine: project.engine,
    status: project.status,
    modelCount: project.modelCount,
  },
  sceneNodes: project.sceneNodes ?? [],
})

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
    if (params.id === 'set-server-room-live') {
      const rows = buildServerRoomClosedLoopRows()
      return sendJson(res, 200, {
        datasetId: 'set-server-room-live',
        sourceId: virtualServerRoomSource.id,
        sourceName: virtualServerRoomSource.name,
        sourceType: virtualServerRoomSource.type,
        sourceHost: virtualServerRoomSource.host,
        tableName: 'server-room/live',
        limit: 20,
        columns: Object.keys(rows[0]),
        rows,
      })
    }

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
            sourceType: source.type,
            sourceHost: source.host,
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
    } else if (source.type === 'MQTT') {
      const topic = dataset.tableName || 'factory/telemetry/device-01'
      const columns = ['id', 'topic', 'value', 'temperature', 'status', 'timestamp']
      const rows: any[] = []
      sendJson(res, 200, {
        datasetId: dataset.id,
        sourceId: source.id,
        sourceName: source.name,
        sourceType: source.type,
        sourceHost: source.host,
        tableName: topic,
        limit: 20,
        columns,
        rows
      })
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
          sourceType: source.type,
          sourceHost: source.host,
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

const modelAssetRoutes: RouteDefinition[] = [
  {
    method: 'GET',
    pattern: /^\/api\/model-assets$/,
    permission: 'scene:read',
    handler: async ({ res, url }) => {
      const keyword = pickQuery(url, 'keyword')
      const items = (await listModelAssets()) ?? []
      const filtered = applyKeywordFilter(items, keyword, [
        (item) => item.name,
        (item) => item.category,
        (item) => item.description,
        (item) => item.tags.join(','),
      ])
      sendJson(res, 200, { items: filtered })
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/model-assets$/,
    permission: 'scene:write',
    handler: async ({ req, res }) => {
      const uploadResult = await new Promise<{ file?: Express.Multer.File; fields: Record<string, unknown> }>((resolve, reject) => {
        modelUpload.single('file')(req, res, (error) => {
          if (error) {
            reject(error)
            return
          }
          resolve({
            file: req.file ?? undefined,
            fields: req.body as Record<string, unknown>,
          })
        })
      })

      const payload = uploadResult.fields
      const uploadedFile = uploadResult.file
      const rawFileName = String(uploadedFile?.originalname ?? '').trim()
      const rawName = String(payload.name ?? '').trim()
      const ext = extname(rawFileName).toLowerCase()
      if (!rawFileName || !['.glb', '.gltf'].includes(ext)) {
        return badRequest(res, 'Only .glb and .gltf files are supported')
      }
      if (!uploadedFile) {
        return badRequest(res, 'Model file is required')
      }

      const fileNameOnDisk = basename(uploadedFile.path)
      const id = fileNameOnDisk.replace(ext, '')

      const item: ModelAsset = {
        id,
        name: rawName || basename(rawFileName, ext),
        category: String(payload.category ?? 'Uncategorized').trim() || 'Uncategorized',
        description: String(payload.description ?? '').trim(),
        tags:
          typeof payload.tags === 'string'
            ? String(payload.tags).split(',').map((item) => item.trim()).filter(Boolean)
            : normalizeTextArray(payload.tags),
        format: ext === '.glb' ? 'glb' : 'gltf',
        fileName: rawFileName,
        filePath: `/uploads/models/${fileNameOnDisk}`,
        fileUrl: `/uploads/models/${fileNameOnDisk}`,
        fileSize: uploadedFile.size,
        updatedAt: nowText(),
      }

      const created = await createModelAsset(item)
      sendJson(res, 201, { item: created ?? item })
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/model-assets\/(?<id>[^/]+)$/,
    permission: 'scene:write',
    handler: async ({ res, params }) => {
      const assets = (await listModelAssets()) ?? []
      const current = assets.find((item) => item.id === params.id)
      if (!current) {
        return sendJson(res, 404, { message: 'Model asset not found' })
      }

      const projects = (await listSceneProjects()) ?? []
      const inUse = projects.some((project) =>
        (project.sceneNodes ?? []).some((node: any) => node?.assetId === current.id),
      )
      if (inUse) {
        return sendJson(res, 409, { message: 'Model asset is used by scenes and cannot be deleted' })
      }

      const ok = await deleteModelAsset(params.id)
      if (!ok) {
        return sendJson(res, 404, { message: 'Model asset not found' })
      }

      if (current.fileUrl.startsWith('/uploads/models/')) {
        const fileDiskPath = join(modelUploadsDir, current.fileUrl.replace('/uploads/models/', ''))
        try {
          unlinkSync(fileDiskPath)
        } catch {
          // Ignore missing files so metadata deletion still succeeds.
        }
      }

      sendNoContent(res)
    },
  },
]

const sceneExportRoute: RouteDefinition = {
  method: 'GET',
  pattern: /^\/api\/sceneProjects\/(?<id>[^/]+)\/export$/,
  permission: 'scene:read',
  handler: async ({ res, params }) => {
    const items = (await listSceneProjects()) ?? []
    const item = items.find((entry) => entry.id === params.id)
    if (!item) {
      return sendJson(res, 404, { message: 'Project not found' })
    }

    ensureUploadDirs()
    const payload = buildSceneExportPayload(item)
    const fileName = `${item.name.replace(/[^\w\u4e00-\u9fa5-]+/g, '_') || item.id}-${Date.now()}.json`
    const diskPath = join(sceneExportDir, fileName)
    writeFileSync(diskPath, JSON.stringify(payload, null, 2), 'utf8')

    sendJson(res, 200, {
      fileName,
      fileUrl: `/uploads/scene-exports/${fileName}`,
      payload,
    })
  },
}

const createScenePublishedFileRoute = (): RouteDefinition => ({
  method: 'POST',
  pattern: /^\/api\/sceneProjects\/(?<id>[^/]+)\/publish-file$/,
  permission: 'scene:write',
  handler: async ({ res, params }) => {
    const items = (await listSceneProjects()) ?? []
    const item = items.find((entry) => entry.id === params.id)
    if (!item) {
      return sendJson(res, 404, { message: 'Project not found' })
    }

    ensureUploadDirs()
    const payload = buildSceneExportPayload(item)
    const fileName = `${item.id}-published.json`
    const diskPath = join(sceneExportDir, fileName)
    writeFileSync(diskPath, JSON.stringify(payload, null, 2), 'utf8')

    const publishedFileUrl = `/uploads/scene-exports/${fileName}`
    const updated = await updateSceneProject(item.id, {
      status: 'published',
      publishedFileUrl,
      updatedAt: nowText(),
    })

    sendJson(res, 200, {
      item: updated ?? { ...item, status: 'published', publishedFileUrl },
      fileUrl: publishedFileUrl,
    })
  },
})

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
    buildCreateItem: async (body) => {
      let importedSceneNodes: any[] = []
      if ('importedSceneJson' in body && body.importedSceneJson) {
        const rawImported = body.importedSceneJson
        const parsed = typeof rawImported === 'string' ? JSON.parse(rawImported) : rawImported
        if (!parsed || typeof parsed !== 'object') {
          throw new RouteValidationError('importedSceneJson is invalid')
        }
        const rawNodes = (parsed as Record<string, unknown>).sceneNodes
        if (rawNodes != null && !Array.isArray(rawNodes)) {
          throw new RouteValidationError('sceneNodes in importedSceneJson must be an array')
        }
        importedSceneNodes = Array.isArray(rawNodes) ? rawNodes : []
      }

      const explicitSceneNodes = Array.isArray(body.sceneNodes) ? body.sceneNodes : null
      const sceneNodes =
        explicitSceneNodes && explicitSceneNodes.length > 0
          ? explicitSceneNodes
          : importedSceneNodes.length > 0
            ? importedSceneNodes
            : explicitSceneNodes ?? []

      return {
        id: createId('scn'),
        name: String(body.name ?? ''),
        group: String(body.group ?? ''),
        owner: String(body.owner ?? ''),
        modelCount: sceneNodes.length > 0 ? sceneNodes.length : Number(body.modelCount ?? 0),
        status: (body.status as SceneProject['status']) ?? 'draft',
        engine: String(body.engine ?? 'Three.js'),
        sceneNodes,
        publishedFileUrl: String(body.publishedFileUrl ?? ''),
        updatedAt: nowText(),
      }
    },
    normalizePatch: (id, body) => {
      const patch: Partial<SceneProject> = {}
      if ('name' in body) patch.name = String(body.name ?? '')
      if ('group' in body) patch.group = String(body.group ?? '')
      if ('owner' in body) patch.owner = String(body.owner ?? '')
      if ('modelCount' in body) patch.modelCount = Number(body.modelCount ?? 0)
      if ('status' in body) patch.status = body.status as SceneProject['status']
      if ('engine' in body) patch.engine = String(body.engine ?? 'Three.js')
      if ('sceneNodes' in body) patch.sceneNodes = Array.isArray(body.sceneNodes) ? body.sceneNodes : []
      if ('publishedFileUrl' in body) patch.publishedFileUrl = String(body.publishedFileUrl ?? '')
      patch.updatedAt = nowText()
      return patch
    }
  }),
  ...modelAssetRoutes,
  sceneExportRoute,
  createScenePublishedFileRoute(),

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
    list: async () => {
      const items = (await listDatasets()) ?? []
      const exists = items.some((item) => item.id === 'set-server-room-live')
      return exists ? items : [...virtualServerRoomDatasets, ...items]
    },
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
