import type { Request, Response } from 'express'
import type { PlatformUser } from '../types/platform.ts'

export interface RequestContext {
  req: Request
  res: Response
  url: URL
  params: Record<string, string>
  body: any
  authUser?: PlatformUser | null
}

export interface RouteDefinition {
  method: string
  pattern: RegExp
  handler: (ctx: RequestContext) => void | Promise<void>
  permission?: string
}

export const sendJson = (res: Response, statusCode: number, payload: unknown) => {
  res.status(statusCode).json(payload)
}

export const sendNoContent = (res: Response) => {
  res.status(204).end()
}

export const notFound = (res: Response) => {
  sendJson(res, 404, { message: 'Route not found' })
}

export const badRequest = (res: Response, message: string) => {
  sendJson(res, 400, { message })
}

export const unauthorized = (res: Response, message = 'Unauthorized') => {
  sendJson(res, 401, { message })
}

export const forbidden = (res: Response, message = 'Forbidden') => {
  sendJson(res, 403, { message })
}

