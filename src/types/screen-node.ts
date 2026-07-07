export interface ScreenNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  component: string
  props: {
    text?: string
    datasetId?: string
    xField?: string
    yField?: string
    refreshInterval?: number
    [key: string]: any
  }
}
