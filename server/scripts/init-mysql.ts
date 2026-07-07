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
          'INSERT INTO screen_projects (id, name, project_group, scene, owner, status, published_version, tags, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            project.id,
            project.name,
            project.group,
            project.scene,
            project.owner,
            project.status,
            project.publishedVersion,
            JSON.stringify(project.tags),
            project.updatedAt,
          ],
        )
      }

      for (const scene of seedState.sceneProjects) {
        await db.query(
          'INSERT INTO scene_projects (id, name, project_group, owner, model_count, status, engine, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [scene.id, scene.name, scene.group, scene.owner, scene.modelCount, scene.status, scene.engine, scene.updatedAt],
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
          'INSERT INTO datasets (id, name, source_name, table_name, refresh_mode, field_count, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            dataset.id,
            dataset.name,
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
