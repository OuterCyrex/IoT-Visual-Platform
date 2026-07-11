import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createMysqlConnection } from '../lib/mysql.ts'

const sqlFile = resolve(process.cwd(), 'server/data/init.sql')

const splitStatements = (sql: string) => {
  const statements: string[] = []
  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index]
    const prev = sql[index - 1]

    if (char === "'" && prev !== '\\' && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
    } else if (char === '"' && prev !== '\\' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
    }

    if (char === ';' && !inSingleQuote && !inDoubleQuote) {
      const statement = current.trim()
      if (statement) {
        statements.push(statement)
      }
      current = ''
      continue
    }

    current += char
  }

  const tail = current.trim()
  if (tail) {
    statements.push(tail)
  }

  return statements
}

const run = async () => {
  const sql = await readFile(sqlFile, 'utf8')
  const statements = splitStatements(sql)
  const connection = await createMysqlConnection(false)

  try {
    for (const statement of statements) {
      await connection.query(statement)
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
