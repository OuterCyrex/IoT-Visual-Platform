import type { PaletteItem } from '../types/palette-item'
import type { ScreenNode } from '../types/screen-node'

export const DATASET_DRIVEN_COMPONENTS = [
  'chart',
  'lineChart',
  'pieChart',
  'metricCard',
  'progressBar',
  'rankingList',
  'alertList',
  'gauge',
  'statusGrid',
  'radarChart',
  'horizontalBar',
  'ringProgress',
  'scrollTable',
  'topologyDevice',
  'mineProcessMap',
] as const

export const DUAL_FIELD_COMPONENTS = [
  'chart',
  'lineChart',
  'pieChart',
  'rankingList',
  'alertList',
  'gauge',
  'statusGrid',
  'radarChart',
  'horizontalBar',
  'ringProgress',
] as const
export const SINGLE_VALUE_COMPONENTS = ['text', 'metricCard', 'progressBar', 'topologyDevice', 'mineProcessMap'] as const
export const LABEL_FIELD_COMPONENTS = ['metricCard', 'progressBar'] as const

export function createScreenNode(template: PaletteItem, x: number, y: number): ScreenNode {
  return {
    id: crypto.randomUUID(),
    component: template.component,
    x,
    y,
    w: template.defaultSize.w,
    h: template.defaultSize.h,
    props: structuredClone(template.defaultProps),
  }
}

export function normalizeScreenNodes(value: unknown): ScreenNode[] {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return Array.isArray(value) ? (value as ScreenNode[]) : []
}

export function resetNodeDatasetBinding(node: ScreenNode) {
  node.props.xField = ''
  node.props.yField = ''
  node.props.refreshInterval = 0
}

export function getNodeDatasetId(node: ScreenNode) {
  return typeof node.props.datasetId === 'string' ? node.props.datasetId : ''
}

export function getNodeRefreshInterval(node: ScreenNode) {
  return Number(node.props.refreshInterval || 0)
}

export function supportsDatasetRows(component: string) {
  return DATASET_DRIVEN_COMPONENTS.includes(component as (typeof DATASET_DRIVEN_COMPONENTS)[number])
}
