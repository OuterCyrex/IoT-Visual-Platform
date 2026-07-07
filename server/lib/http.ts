import type { IncomingMessage, ServerResponse } from 'node:http'
import type { PlatformUser } from '../types/platform.ts'

export interface RequestContext {
  req: IncomingMessage
  res: ServerResponse
  url: URL
  params: Record<string, string>
  body: unknown
  authUser?: PlatformUser | null
}

export interface RouteDefinition {
  method: string
  pattern: RegExp
  handler: (ctx: RequestContext) => void | Promise<void>
  permission?: string
}

export const sendJson = (res: ServerResponse, statusCode: number, payload: unknown) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload, null, 2))
}

export const sendNoContent = (res: ServerResponse) => {
  res.writeHead(204)
  res.end()
}

export const readJsonBody = async (req: IncomingMessage) => {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk))
  }

  if (chunks.length === 0) {
    return undefined
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? (JSON.parse(raw) as unknown) : undefined
}

export const notFound = (res: ServerResponse) => {
  sendJson(res, 404, { message: 'Route not found' })
}

export const badRequest = (res: ServerResponse, message: string) => {
  sendJson(res, 400, { message })
}

export const unauthorized = (res: ServerResponse, message = 'Unauthorized') => {
  sendJson(res, 401, { message })
}

export const forbidden = (res: ServerResponse, message = 'Forbidden') => {
  sendJson(res, 403, { message })
}
