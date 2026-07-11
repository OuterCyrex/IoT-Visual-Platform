import request from '../utils/request'
import type { Dataset, SceneProject, ScreenProject } from '../types/platform'
import type { ScreenNode } from '../types/screen-node'

export interface ListResponse<T> {
  items: T[]
}

export interface DetailResponse<T> {
  item: T
}

export interface DatasetPreview {
  columns: string[]
  rows: Record<string, unknown>[]
  sourceType?: string
  sourceHost?: string
  tableName?: string
}

export interface PublishScreenPayload {
  version?: string
}

export interface CreateScreenProjectPayload {
  name: string
  group: string
  scene: string
  owner: string
}

export async function listScreenProjects() {
  return request.get<ListResponse<ScreenProject>, ListResponse<ScreenProject>>('/api/screenProjects')
}

export async function getScreenProject(projectId: string) {
  return request.get<DetailResponse<ScreenProject>, DetailResponse<ScreenProject>>(`/api/screenProjects/${projectId}`)
}

export async function createScreenProject(payload: CreateScreenProjectPayload) {
  return request.post<DetailResponse<ScreenProject>, DetailResponse<ScreenProject>>('/api/screenProjects', {
    ...payload,
    status: 'draft',
    publishedVersion: '未发布',
    tags: [],
    screenNodes: [],
  })
}

export async function updateScreenProject(projectId: string, project: ScreenProject, nodes: ScreenNode[]) {
  return request.put<DetailResponse<ScreenProject>, DetailResponse<ScreenProject>>(`/api/screenProjects/${projectId}`, {
    ...project,
    screenNodes: nodes,
    status: 'editing',
  })
}

export async function saveScreenProjectDraft(projectId: string, project: ScreenProject, nodes: ScreenNode[]) {
  return request.put<DetailResponse<ScreenProject>, DetailResponse<ScreenProject>>(`/api/screenProjects/${projectId}`, {
    ...project,
    screenNodes: nodes,
  })
}

export async function publishScreenProject(projectId: string, payload: PublishScreenPayload = {}) {
  return request.post<DetailResponse<ScreenProject>, DetailResponse<ScreenProject>>(
    `/api/screenProjects/${projectId}/publish`,
    payload
  )
}

export async function cloneScreenProject(projectId: string) {
  return request.post<DetailResponse<ScreenProject>, DetailResponse<ScreenProject>>(`/api/screenProjects/${projectId}/clone`)
}

export async function deleteScreenProject(projectId: string) {
  return request.delete<void, void>(`/api/screenProjects/${projectId}`)
}

export async function listSceneProjects() {
  return request.get<ListResponse<SceneProject>, ListResponse<SceneProject>>('/api/sceneProjects')
}

export async function listDatasets() {
  return request.get<ListResponse<Dataset>, ListResponse<Dataset>>('/api/datasets')
}

export async function previewDataset(datasetId: string) {
  return request.get<DatasetPreview, DatasetPreview>(`/api/datasets/${datasetId}/preview`)
}
