import mysql from 'mysql2/promise'
import { mysqlConfig } from './config.ts'

export const createMysqlConnection = async (withDatabase = true) =>
  mysql.createConnection({
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    user: mysqlConfig.user,
    password: mysqlConfig.password,
    database: withDatabase ? mysqlConfig.database : undefined,
  })
