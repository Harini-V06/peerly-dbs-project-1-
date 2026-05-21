import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'
import { getPool } from './db'
import type { RowDataPacket } from 'mysql2'

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const d = data as { email: string; password: string }
    return { email: d.email, password: d.password }
  })
  .handler(async ({ data }) => {
    const [rows] = await getPool().execute<RowDataPacket[]>(
      'SELECT student_id, name FROM Student WHERE email = ? AND password = ?',
      [data.email, data.password]
    )
    if (!rows.length) throw new Error('Invalid email or password')
    setCookie('peerly_uid', String(rows[0].student_id), {
      httpOnly: true,
      maxAge: 86400,
      path: '/',
      sameSite: 'lax',
    } as any)
    return { student_id: rows[0].student_id as number, name: rows[0].name as string }
  })

export const logoutFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    deleteCookie('peerly_uid', { path: '/' } as any)
    return { ok: true }
  })

export const getSessionFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const uid = getCookie('peerly_uid')
    if (!uid) return null
    const id = parseInt(uid, 10)
    return isNaN(id) ? null : id
  })
