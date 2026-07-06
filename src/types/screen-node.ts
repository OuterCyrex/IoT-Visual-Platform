export interface ScreenNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  component: string
  props: Record<string, unknown>
}
