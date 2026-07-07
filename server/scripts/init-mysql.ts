import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createMysqlConnection } from '../lib/mysql.ts'
import { seedState } from '../data/seed.ts'

const sqlFile = resolve(process.cwd(), 'server/data/init.sql')

const run = async () => {
  const sql = await readFile(sqlFile, 'utf8')
  const statements = sql
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)

  const connection = await createMysqlConnection(false)

  try {
    for (const statement of statements) {
      await connection.query(statement)
    }

    const db = await createMysqlConnection(true)
    try {
      const [passwordColumnRows] = await db.query(
        `SELECT COUNT(*) AS count
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'users'
           AND COLUMN_NAME = 'password_hash'`,
      )
      const passwordColumnExists = Number(
        (passwordColumnRows as Array<{ count: number | string }>)[0]?.count ?? 0,
      )

      if (!passwordColumnExists) {
        await db.query("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '' AFTER phone")
      }

      const [screenNodesColumnRows] = await db.query(
        `SELECT COUNT(*) AS count
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'screen_projects'
           AND COLUMN_NAME = 'screen_nodes'`,
      )
      const screenNodesColumnExists = Number(
        (screenNodesColumnRows as Array<{ count: number | string }>)[0]?.count ?? 0,
      )

      if (!screenNodesColumnExists) {
        await db.query("ALTER TABLE screen_projects ADD COLUMN screen_nodes TEXT NOT NULL AFTER tags")
        await db.query("UPDATE screen_projects SET screen_nodes = '[]' WHERE screen_nodes = '' OR screen_nodes IS NULL")
      }

      const [sceneNodesColumnRows] = await db.query(
        `SELECT COUNT(*) AS count
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'scene_projects'
           AND COLUMN_NAME = 'scene_nodes'`,
      )
      const sceneNodesColumnExists = Number(
        (sceneNodesColumnRows as Array<{ count: number | string }>)[0]?.count ?? 0,
      )

      if (!sceneNodesColumnExists) {
        await db.query("ALTER TABLE scene_projects ADD COLUMN scene_nodes TEXT NOT NULL AFTER engine")
        await db.query("UPDATE scene_projects SET scene_nodes = '[]' WHERE scene_nodes = '' OR scene_nodes IS NULL")
      }

      const [datasetDataSourceIdRows] = await db.query(
        `SELECT COUNT(*) AS count
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'datasets'
           AND COLUMN_NAME = 'data_source_id'`,
      )
      const datasetDataSourceIdExists = Number(
        (datasetDataSourceIdRows as Array<{ count: number | string }>)[0]?.count ?? 0,
      )

      if (!datasetDataSourceIdExists) {
        await db.query("ALTER TABLE datasets ADD COLUMN data_source_id VARCHAR(64) NOT NULL AFTER name")
        await db.query(
          `UPDATE datasets d
           JOIN data_sources s ON s.name = d.source_name
           SET d.data_source_id = s.id
           WHERE d.data_source_id = '' OR d.data_source_id IS NULL`,
        )
      }

      await db.beginTransaction()

      await db.query('DELETE FROM roles')
      await db.query('DELETE FROM users')
      await db.query('DELETE FROM projects')
      await db.query('DELETE FROM screen_projects')
      await db.query('DELETE FROM scene_projects')
      await db.query('DELETE FROM data_sources')
      await db.query('DELETE FROM datasets')
      await db.query('DELETE FROM project_memberships')

      for (const role of seedState.roles) {
        await db.query(
          'INSERT INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)',
          [role.id, role.name, role.description, JSON.stringify(role.permissions)],
        )
      }

      for (const user of seedState.users) {
        await db.query(
          'INSERT INTO users (id, username, display_name, role, phone, password_hash, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            user.id,
            user.username,
            user.displayName,
            user.role,
            user.phone,
            user.passwordHash ?? '',
            user.status,
            user.updatedAt,
          ],
        )
      }

      for (const project of seedState.projects) {
        await db.query(
          'INSERT INTO projects (id, name, type, project_group, owner, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [project.id, project.name, project.type, project.group, project.owner, project.status, project.updatedAt],
        )
      }

      for (const project of seedState.screenProjects) {
        await db.query(
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
      }

      for (const scene of seedState.sceneProjects) {
        await db.query(
          'INSERT INTO scene_projects (id, name, project_group, owner, model_count, status, engine, scene_nodes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [scene.id, scene.name, scene.group, scene.owner, scene.modelCount, scene.status, scene.engine, JSON.stringify(scene.sceneNodes || []), scene.updatedAt],
        )
      }

      for (const source of seedState.dataSources) {
        await db.query(
          'INSERT INTO data_sources (id, name, type, host, database_name, owner, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [source.id, source.name, source.type, source.host, source.database, source.owner, source.status, source.updatedAt],
        )
      }

      for (const dataset of seedState.datasets) {
        await db.query(
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
      }

      for (const membership of seedState.projectMemberships ?? []) {
        await db.query(
          'INSERT INTO project_memberships (id, user_id, project_id, access_level) VALUES (?, ?, ?, ?)',
          [membership.id, membership.userId, membership.projectId, membership.accessLevel],
        )
      }

      await db.commit()

      // Seed separate factory_prod database tables
      await db.query('USE factory_prod')
      await db.query('DELETE FROM energy_realtime_view')
      await db.query('DELETE FROM device_alarm_stream')
      await db.query('DELETE FROM device_assets')

      // Insert energy data
      const energyData = [
        ['2026-07-07 10:00:00', '1号注塑车间', 1245.50, 45.20, 120.00],
        ['2026-07-07 10:00:00', '2号冲压车间', 3420.80, 12.50, 0.00],
        ['2026-07-07 10:00:00', '3号总装车间', 850.20, 85.00, 450.50],
        ['2026-07-07 11:00:00', '1号注塑车间', 1290.10, 48.00, 115.00],
        ['2026-07-07 11:00:00', '2号冲压车间', 3510.40, 13.00, 0.00],
        ['2026-07-07 11:00:00', '3号总装车间', 890.70, 89.20, 460.00],
      ]
      for (const row of energyData) {
        await db.query(
          'INSERT INTO energy_realtime_view (timestamp, workshop_name, electricity_kwh, water_m3, gas_m3) VALUES (?, ?, ?, ?, ?)',
          row
        )
      }

      // Insert alarm data
      const alarmData = [
        ['2026-07-07 11:15:00', 'DEV-MOLD-01', '1号注塑机', 'Warning', '模具温度偏高 (85°C)', 'Active'],
        ['2026-07-07 11:20:00', 'DEV-PUMP-04', '4号循环水泵', 'Critical', '电机过载停机', 'Active'],
        ['2026-07-07 10:30:00', 'DEV-COMP-02', '2号空压机', 'Info', '排气压力达到阈值上限', 'Resolved'],
      ]
      for (const row of alarmData) {
        await db.query(
          'INSERT INTO device_alarm_stream (timestamp, device_id, device_name, alarm_level, alarm_message, status) VALUES (?, ?, ?, ?, ?, ?)',
          row
        )
      }

      // Insert asset data
      const assetData = [
        ['AST-MOLD-001', '双色注塑机', '生产设备', 'ENG-320T', '1号车间A区', 'Running'],
        ['AST-MOLD-002', '高速注塑机', '生产设备', 'ENG-180T', '1号车间B区', 'Standby'],
        ['AST-PUMP-004', '离心冷却水泵', '辅助动力', 'WP-75KW', '动力站房', 'Maintenance'],
        ['AST-COMP-002', '螺杆式空压机', '气动系统', 'AC-110KW', '空压机房', 'Running'],
      ]
      for (const row of assetData) {
        await db.query(
          'INSERT INTO device_assets (asset_code, name, type, model, location, status) VALUES (?, ?, ?, ?, ?, ?)',
          row
        )
      }
    } catch (error) {
      await db.rollback()
      throw error
    } finally {
      await db.end()
    }

    console.log('MySQL init completed successfully.')
  } finally {
    await connection.end()
  }
}

run().catch((error) => {
  console.error('MySQL init failed:', error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
