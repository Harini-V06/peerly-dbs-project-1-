import mysql from 'mysql2/promise'
import type { Pool } from 'mysql2/promise'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST ?? 'localhost',
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: process.env.MYSQL_DATABASE ?? 'peerly',
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true,
    })
  }
  return pool
}
