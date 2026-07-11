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
      {
        label: '数据卡',
        desc: '单值指标卡片',
        nodeType: 'basic',
        dotClass: 'bg-cyan-500',
        component: 'metricCard',
        defaultSize: {
          w: 320,
          h: 180,
        },
        defaultProps: {
          text: '核心指标',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
      {
        label: '进度条',
        desc: '进度状态展示',
        nodeType: 'basic',
        dotClass: 'bg-orange-500',
        component: 'progressBar',
        defaultSize: {
          w: 320,
          h: 160,
        },
        defaultProps: {
          text: '执行进度',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
      {
        label: '边框装饰',
        desc: '科技感面板边框容器',
        nodeType: 'basic',
        dotClass: 'bg-indigo-500',
        component: 'borderBox',
        defaultSize: {
          w: 320,
          h: 240,
        },
        defaultProps: {
          text: '边框容器',
        },
      },
      {
        label: '时间天气',
        desc: '系统时钟与环境天气',
        nodeType: 'basic',
        dotClass: 'bg-amber-400',
        component: 'timeWeather',
        defaultSize: {
          w: 360,
          h: 80,
        },
        defaultProps: {
          text: '时间天气看板',
        },
      },
    ],
  },
  {
    label: '图表',
    items: [
      {
        label: '柱状图',
        desc: '数据统计图表',
        nodeType: 'chart',
        dotClass: 'bg-violet-500',
        component: 'chart',
        defaultSize: {
          w: 360,
          h: 240,
        },
        defaultProps: {
          text: '柱状图',
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
        label: '饼图',
        desc: '比例展示',
        nodeType: 'chart',
        dotClass: 'bg-cyan-500',
        component: 'pieChart',
        defaultSize: {
          w: 420,
          h: 240,
        },
        defaultProps: {
          text: '饼图',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
      {
        label: '排行榜',
        desc: 'TOP 列表展示',
        nodeType: 'chart',
        dotClass: 'bg-fuchsia-500',
        component: 'rankingList',
        defaultSize: {
          w: 360,
          h: 320,
        },
        defaultProps: {
          text: '排行看板',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
      {
        label: '告警列表',
        desc: '事件告警展示',
        nodeType: 'chart',
        dotClass: 'bg-rose-500',
        component: 'alertList',
        defaultSize: {
          w: 360,
          h: 320,
        },
        defaultProps: {
          text: '告警列表',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
      {
        label: '仪表盘',
        desc: '指标刻度盘展示',
        nodeType: 'chart',
        dotClass: 'bg-cyan-500',
        component: 'gauge',
        defaultSize: {
          w: 320,
          h: 240,
        },
        defaultProps: {
          text: '仪表盘',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
      {
        label: '状态网格',
        desc: '多设备运行状态指示',
        nodeType: 'chart',
        dotClass: 'bg-emerald-500',
        component: 'statusGrid',
        defaultSize: {
          w: 360,
          h: 240,
        },
        defaultProps: {
          text: '设备状态网格',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
      {
        label: '雷达图',
        desc: '多维数据特征对比',
        nodeType: 'chart',
        dotClass: 'bg-violet-500',
        component: 'radarChart',
        defaultSize: {
          w: 360,
          h: 280,
        },
        defaultProps: {
          text: '多维特征雷达图',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
      {
        label: '横向柱状图',
        desc: '横向对比统计图表',
        nodeType: 'chart',
        dotClass: 'bg-blue-500',
        component: 'horizontalBar',
        defaultSize: {
          w: 360,
          h: 240,
        },
        defaultProps: {
          text: '横向排行图表',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
      {
        label: '环形进度仪',
        desc: '圆环比例进度展示',
        nodeType: 'chart',
        dotClass: 'bg-cyan-500',
        component: 'ringProgress',
        defaultSize: {
          w: 240,
          h: 240,
        },
        defaultProps: {
          text: '环形进度仪',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
      {
        label: '滚动日志表',
        desc: '多列动态列表展示',
        nodeType: 'chart',
        dotClass: 'bg-emerald-500',
        component: 'scrollTable',
        defaultSize: {
          w: 380,
          h: 300,
        },
        defaultProps: {
          text: '实时运行日志表',
          datasetId: '',
          xField: '',
          yField: '',
          refreshInterval: 0,
        },
      },
    ],
  },
]
