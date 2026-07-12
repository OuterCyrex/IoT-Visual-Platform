export interface ScreenNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  component: string
  locked?: boolean
  groupId?: string
  rotate?: number
  props: {
    text?: string
    datasetId?: string
    xField?: string
    yField?: string
    refreshInterval?: number
    [key: string]: any
  }
}

