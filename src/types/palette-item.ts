export interface PaletteItem {
  label: string
  desc: string
  dotClass: string
  component: string
  defaultSize: {
    w: number
    h: number
  }
  defaultProps: Record<string, unknown>
}

export const PaletteList: PaletteItem[] = [
  {
    label: '矩形',
    desc: '基础容器',
    dotClass: 'bg-sky-500',
    component: 'rect',
    defaultSize: { w: 280, h: 160 },
    defaultProps: { text: '矩形容器' },
  },
  {
    label: '圆形',
    desc: '指标展示',
    dotClass: 'bg-emerald-500',
    component: 'circle',
    defaultSize: { w: 120, h: 120 },
    defaultProps: { text: '圆形指标' },
  },
  {
    label: '图表',
    desc: '图表占位',
    dotClass: 'bg-violet-500',
    component: 'chart',
    defaultSize: { w: 360, h: 240 },
    defaultProps: { text: '图表占位' },
  },
  {
    label: '文本',
    desc: '说明文字',
    dotClass: 'bg-amber-500',
    component: 'text',
    defaultSize: { w: 220, h: 56 },
    defaultProps: { text: '文本标题' },
  },
]
