export interface PaletteItem {
  label: string
  desc: string
  nodeType: string
  dotClass: string
  component: string
  defaultSize: {
    w: number
    h: number
  }
  defaultProps: Record<string, unknown>
}

export interface PaletteGroup {
  label: string
  items: PaletteItem[]
}

export const PaletteList: PaletteGroup[] = [
  {
    label: '基础组件',
    items: [
      {
        label: '矩形',
        desc: '基础容器',
        nodeType: 'basic',
        dotClass: 'bg-sky-500',
        component: 'rect',
        defaultSize: {
          w: 280,
          h: 160,
        },
        defaultProps: {
          text: '矩形容器',
        },
      },
      {
        label: '圆形',
        desc: '指标展示',
        nodeType: 'basic',
        dotClass: 'bg-emerald-500',
        component: 'circle',
        defaultSize: {
          w: 120,
          h: 120,
        },
        defaultProps: {
          text: '圆形指标',
        },
      },
      {
        label: '文本',
        desc: '说明文字',
        nodeType: 'basic',
        dotClass: 'bg-amber-500',
        component: 'text',
        defaultSize: {
          w: 220,
          h: 56,
        },
        defaultProps: {
          text: '文本标题',
        },
      },
    ],
  },

  {
    label: '图表',
    items: [
      {
        label: '条形图',
        desc: '数据统计图表',
        nodeType: 'chart',
        dotClass: 'bg-violet-500',
        component: 'chart',
        defaultSize: {
          w: 360,
          h: 240,
        },
        defaultProps: {
          text: '条形图',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
      {
        label: '折线图',
        desc: '趋势变化展示',
        nodeType: 'chart',
        dotClass: 'bg-cyan-500',
        component: 'lineChart',
        defaultSize: {
          w: 420,
          h: 240,
        },
        defaultProps: {
          text: '折线趋势图',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },      
      {
        label: '饼状图',
        desc: '比例展示',
        nodeType: 'chart',
        dotClass: 'bg-cyan-500',
        component: 'pieChart',
        defaultSize: {
          w: 420,
          h: 240,
        },
        defaultProps: {
          text: '饼状图',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
    ],
  },
]
