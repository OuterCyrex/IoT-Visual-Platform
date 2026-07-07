import mysql from 'mysql2/promise'
import { mysqlConfig } from './config.ts'
import type { DataSource } from '../types/platform.ts'

export const createMysqlConnection = async (withDatabase = true) =>
  mysql.createConnection({
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    user: mysqlConfig.user,
    password: mysqlConfig.password,
    database: withDatabase ? mysqlConfig.database : undefined,
  })

export const createMysqlConnectionForDataSource = async (source: DataSource) => {
  const [host, portText] = source.host.split(':')
  return mysql.createConnection({
    host: host || mysqlConfig.host,
    port: portText ? Number(portText) : mysqlConfig.port,
    user: mysqlConfig.user,
    password: mysqlConfig.password,
    database: source.database || mysqlConfig.database,
  })
}
