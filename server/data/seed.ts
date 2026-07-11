import type { PlatformState } from '../types/platform.ts'
import { hashPassword } from '../lib/auth.ts'

export const seedState: PlatformState = {
  screenProjects: [
    {
      id: 'scr-001',
      name: '新能源超级工厂集成控制大屏',
      group: '能源中心',
      scene: '园区驾驶舱',
      owner: '李工',
      updatedAt: '2026-07-11 11:00',
      status: 'published',
      publishedVersion: 'v2.0.0',
      tags: ['超级工厂', '实时监控', 'OEE'],
      screenNodes: [
        {
          id: 'node-title',
          x: 200,
          y: 15,
          w: 1520,
          h: 70,
          component: 'text',
          props: {
            text: 'GigaFactory 新能源汽车智造超级工厂数智化集成监控中心'
          }
        },
        {
          id: 'node-oee',
          x: 40,
          y: 100,
          w: 420,
          h: 220,
          component: 'metricCard',
          props: {
            text: '整厂综合运营效能 OEE',
            datasetId: 'set-oee-metrics',
            xField: 'desc',
            yField: 'oee_percent',
            refreshInterval: 5000
          }
        },
        {
          id: 'node-progress',
          x: 40,
          y: 350,
          w: 420,
          h: 220,
          component: 'progressBar',
          props: {
            text: '今日产量计划达成率',
            datasetId: 'set-production-progress',
            xField: 'task_name',
            yField: 'progress_percent',
            refreshInterval: 5000
          }
        },
        {
          id: 'node-ranking',
          x: 40,
          y: 600,
          w: 420,
          h: 440,
          component: 'rankingList',
          props: {
            text: '车间效率 OEE 排行',
            datasetId: 'set-workshop-oee',
            xField: 'workshop',
            yField: 'oee',
            refreshInterval: 5000
          }
        },
        {
          id: 'node-alerts',
          x: 480,
          y: 100,
          w: 960,
          h: 470,
          component: 'alertList',
          props: {
            text: '智能工厂设备健康告警流',
            datasetId: 'set-active-alarms',
            xField: 'message',
            yField: 'level',
            refreshInterval: 5000
          }
        },
        {
          id: 'node-vibration',
          x: 480,
          y: 600,
          w: 960,
          h: 440,
          component: 'chart',
          props: {
            text: '关键主轴与泵机物理振动遥测 (mm/s)',
            datasetId: 'set-equipment-vibration',
            xField: 'device',
            yField: 'vibration',
            refreshInterval: 5000
          }
        },
        {
          id: 'node-energy',
          x: 1460,
          y: 100,
          w: 420,
          h: 470,
          component: 'pieChart',
          props: {
            text: '各工艺车间用电负荷占比 (kWh)',
            datasetId: 'set-energy-distribution',
            xField: 'workshop',
            yField: 'kwh',
            refreshInterval: 5000
          }
        },
        {
          id: 'node-throughput',
          x: 1460,
          y: 600,
          w: 420,
          h: 440,
          component: 'lineChart',
          props: {
            text: '1号压铸机主轴温度实时监控 (MQTT)',
            datasetId: 'set-ev-mqtt',
            xField: 'timestamp',
            yField: 'temperature',
            refreshInterval: 0
          }
        }
      ],
    },
    {
      id: 'scr-002',
      name: '注塑产线监控大屏',
      group: '生产车间',
      scene: '制造执行',
      owner: '王敏',
      updatedAt: '2026-07-04 11:20',
      status: 'editing',
      publishedVersion: 'v0.9.2',
      tags: ['产线', 'OEE'],
      screenNodes: [],
    },
    {
      id: 'scr-003',
      name: '环保排放监测',
      group: '安全环保',
      scene: '环保监管',
      owner: '赵宁',
      updatedAt: '2026-07-02 09:45',
      status: 'draft',
      publishedVersion: '未发布',
      tags: ['环保', '告警'],
      screenNodes: [],
    },
    {
      id: 'scr-004',
      name: '智算中心101号机房运行大屏',
      group: '数据中心',
      scene: '101号机房',
      owner: '李工',
      updatedAt: '2026-07-11 18:30',
      status: 'published',
      publishedVersion: 'v1.0.0',
      tags: ['数据中心', '机房平面图', '设备遥测'],
      screenNodes: [
        {
          id: 'node-title',
          x: 200,
          y: 15,
          w: 1520,
          h: 70,
          component: 'text',
          props: { text: 'GigaData 智算数据中心 101 号核心机房运行总览' }
        },
        {
          id: 'node-time',
          x: 40,
          y: 15,
          w: 360,
          h: 80,
          component: 'timeWeather',
          props: { text: '系统时间与环境天气' }
        },
        {
          id: 'node-pue',
          x: 40,
          y: 110,
          w: 380,
          h: 180,
          component: 'metricCard',
          props: { text: '机房实时 PUE 能效比', datasetId: '', xField: '实时能效', yField: '1.24' }
        },
        {
          id: 'node-soc',
          x: 40,
          y: 310,
          w: 380,
          h: 180,
          component: 'ringProgress',
          props: { text: '备用储能电量 SoC', datasetId: 'set-production-progress', xField: 'task_name', yField: 'progress_percent', refreshInterval: 5000 }
        },
        {
          id: 'node-humidity',
          x: 40,
          y: 510,
          w: 380,
          h: 240,
          component: 'pieChart',
          props: { text: '机柜区域热载荷比例', datasetId: 'set-energy-distribution', xField: 'workshop', yField: 'kwh', refreshInterval: 5000 }
        },
        {
          id: 'node-floorplan-box',
          x: 450,
          y: 110,
          w: 620,
          h: 640,
          component: 'borderBox',
          props: { text: '101 号核心机房物理设备布局' }
        },
        {
          id: 'dev-rack-a01',
          x: 480,
          y: 170,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: 'A-01 机柜', deviceType: 'rack', status: 'running' }
        },
        {
          id: 'dev-rack-a02',
          x: 610,
          y: 170,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: 'A-02 核心机柜 (MQTT)', deviceType: 'rack', status: 'running', datasetId: 'set-ev-mqtt', xField: 'timestamp', yField: 'temperature', refreshInterval: 0 }
        },
        {
          id: 'dev-rack-a03',
          x: 740,
          y: 170,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: 'A-03 机柜', deviceType: 'rack', status: 'running' }
        },
        {
          id: 'dev-chiller-01',
          x: 880,
          y: 170,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: '1号精密空调', deviceType: 'chiller', status: 'running' }
        },
        {
          id: 'dev-rack-b01',
          x: 480,
          y: 330,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: 'B-01 机柜', deviceType: 'rack', status: 'running' }
        },
        {
          id: 'dev-rack-b02',
          x: 610,
          y: 330,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: 'B-02 备用机柜', deviceType: 'rack', status: 'warning' }
        },
        {
          id: 'dev-rack-b03',
          x: 740,
          y: 330,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: 'B-03 机柜', deviceType: 'rack', status: 'running' }
        },
        {
          id: 'dev-chiller-02',
          x: 880,
          y: 330,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: '2号精密空调', deviceType: 'chiller', status: 'running' }
        },
        {
          id: 'dev-transformer',
          x: 480,
          y: 490,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: '1号变压器', deviceType: 'transformer', status: 'running' }
        },
        {
          id: 'dev-cabinet',
          x: 610,
          y: 490,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: '高压配电柜', deviceType: 'cabinet', status: 'running' }
        },
        {
          id: 'dev-ups',
          x: 740,
          y: 490,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: 'UPS 机组', deviceType: 'ups', status: 'running' }
        },
        {
          id: 'dev-generator',
          x: 880,
          y: 490,
          w: 120,
          h: 140,
          component: 'topologyDevice',
          props: { text: '应急柴油发电机', deviceType: 'generator', status: 'stopped' }
        },
        {
          id: 'node-alerts',
          x: 40,
          y: 770,
          w: 1030,
          h: 270,
          component: 'alertList',
          props: { text: '智算机房动力与安全告警日志流', datasetId: 'set-active-alarms', xField: 'message', yField: 'level', refreshInterval: 5000 }
        },
        {
          id: 'node-power-line',
          x: 1100,
          y: 110,
          w: 780,
          h: 280,
          component: 'lineChart',
          props: { text: '机房总用电负荷逐时趋势 (kW)', datasetId: 'set-hourly-throughput', xField: 'hour', yField: 'count', refreshInterval: 5000 }
        },
        {
          id: 'node-vibration-chart',
          x: 1100,
          y: 410,
          w: 780,
          h: 310,
          component: 'chart',
          props: { text: '核心节点机架出风口温度监控 (℃)', datasetId: 'set-equipment-vibration', xField: 'device', yField: 'vibration', refreshInterval: 5000 }
        },
        {
          id: 'node-cooling-flow',
          x: 1100,
          y: 740,
          w: 780,
          h: 300,
          component: 'scrollTable',
          props: { text: '各机架集群温度与负荷清单', datasetId: 'set-workshop-oee', xField: 'workshop', yField: 'oee', refreshInterval: 5000 }
        }
      ],
    },
    {
      id: 'scr-005',
      name: '智慧矿山管控平台',
      group: '矿山中心',
      scene: '主斜井及采区',
      owner: '系统管理员',
      updatedAt: '2026-07-11 17:41',
      status: 'published',
      publishedVersion: 'v10.3',
      tags: ['智慧矿山', '流光流程图', '安全监管'],
      screenNodes: [
        {
          id: 'node-title',
          x: 200,
          y: 15,
          w: 1520,
          h: 70,
          component: 'text',
          props: { text: '智慧矿山管控平台' }
        },
        {
          id: 'node-time',
          x: 40,
          y: 15,
          w: 360,
          h: 80,
          component: 'timeWeather',
          props: { text: '系统时间与环境天气' }
        },
        {
          id: 'node-env-box',
          x: 40,
          y: 110,
          w: 380,
          h: 220,
          component: 'borderBox',
          props: { text: '矿山环境监测 (Environment)' }
        },
        {
          id: 'node-env-temp',
          x: 60,
          y: 150,
          w: 160,
          h: 75,
          component: 'metricCard',
          props: { text: '温度', yField: '29.8°C' }
        },
        {
          id: 'node-env-humidity',
          x: 240,
          y: 150,
          w: 160,
          h: 75,
          component: 'metricCard',
          props: { text: '湿度', yField: '40%' }
        },
        {
          id: 'node-env-co2',
          x: 60,
          y: 235,
          w: 160,
          h: 75,
          component: 'metricCard',
          props: { text: 'CO2浓度', yField: '15 mg/m³' }
        },
        {
          id: 'node-env-wind',
          x: 240,
          y: 235,
          w: 160,
          h: 75,
          component: 'metricCard',
          props: { text: '井下风速', yField: '2.8 m/s' }
        },
        {
          id: 'node-safety-box',
          x: 40,
          y: 350,
          w: 380,
          h: 240,
          component: 'borderBox',
          props: { text: '安全监管与隐患排查' }
        },
        {
          id: 'node-safety-ring',
          x: 60,
          y: 400,
          w: 160,
          h: 160,
          component: 'ringProgress',
          props: { text: '本班安全率', yField: '75' }
        },
        {
          id: 'node-safety-status',
          x: 240,
          y: 400,
          w: 160,
          h: 160,
          component: 'metricCard',
          props: { text: '排查隐患 (正常率)', yField: '75%' }
        },
        {
          id: 'node-energy-line',
          x: 40,
          y: 610,
          w: 380,
          h: 430,
          component: 'lineChart',
          props: { text: '周动力用电负荷趋势 (kWh)', datasetId: 'set-hourly-throughput', xField: 'hour', yField: 'count', refreshInterval: 5000 }
        },
        {
          id: 'node-process-map',
          x: 440,
          y: 110,
          w: 1040,
          h: 640,
          component: 'mineProcessMap',
          props: { text: '等距智能采矿输送物料流', datasetId: 'set-ev-mqtt', xField: 'timestamp', yField: 'value', refreshInterval: 0 }
        },
        {
          id: 'node-alarms-table',
          x: 440,
          y: 770,
          w: 1040,
          h: 270,
          component: 'alertList',
          props: { text: '井下有毒气体及瓦斯实时监测告警', datasetId: 'set-active-alarms', xField: 'message', yField: 'level', refreshInterval: 5000 }
        },
        {
          id: 'node-control-box',
          x: 1500,
          y: 110,
          w: 380,
          h: 220,
          component: 'borderBox',
          props: { text: '通风/排水/防瓦斯系统状态' }
        },
        {
          id: 'node-control-grid',
          x: 1520,
          y: 150,
          w: 340,
          h: 160,
          component: 'statusGrid',
          props: { text: '集控系统运行状态', datasetId: 'set-workshop-oee', xField: 'workshop', yField: 'oee', refreshInterval: 5000 }
        },
        {
          id: 'node-inspection-pie',
          x: 1500,
          y: 350,
          w: 380,
          h: 240,
          component: 'pieChart',
          props: { text: '日巡检计划达成率 (57%)', datasetId: 'set-production-progress', xField: 'task_name', yField: 'progress_percent', refreshInterval: 5000 }
        },
        {
          id: 'node-tonnage-bar',
          x: 1500,
          y: 610,
          w: 380,
          h: 430,
          component: 'chart',
          props: { text: '分时装车矿石吞吐量 (t)', datasetId: 'set-hourly-throughput', xField: 'hour', yField: 'count', refreshInterval: 5000 }
        }
      ],
    },
  ],
  sceneProjects: [
    {
      id: 'scn-001',
      name: '智慧工厂 3D 巡检',
      group: '三维工厂',
      owner: '陈凯',
      modelCount: 18,
      updatedAt: '2026-07-05 16:10',
      status: 'published',
      engine: 'Three.js',
      sceneNodes: [],
    },
    {
      id: 'scn-002',
      name: '泵站设备数字孪生',
      group: '设备中心',
      owner: '周璇',
      modelCount: 9,
      updatedAt: '2026-07-03 14:40',
      status: 'editing',
      engine: 'Three.js',
      sceneNodes: [],
    },
    {
      id: 'scn-003',
      name: '仓储 AGV 调度场景',
      group: '物流中心',
      owner: '杨帆',
      modelCount: 12,
      updatedAt: '2026-07-01 10:30',
      status: 'draft',
      engine: 'Three.js',
      sceneNodes: [],
    },
  ],
  modelAssets: [],
  dataSources: [
    {
      id: 'ds-001',
      name: '生产 MySQL 主库',
      type: 'MySQL',
      host: '10.10.2.15:3306',
      database: 'factory_prod',
      owner: 'DBA 组',
      updatedAt: '2026-07-05 19:00',
      status: 'connected',
    },
    {
      id: 'ds-002',
      name: '告警 MQTT Broker',
      type: 'MQTT',
      host: '10.10.8.20:1883',
      database: 'topic:/alarm/#',
      owner: '平台组',
      updatedAt: '2026-07-05 12:10',
      status: 'warning',
    },
    {
      id: 'ds-003',
      name: '超级工厂 REST API',
      type: 'REST',
      host: 'http://localhost:5000',
      database: '/assets',
      owner: '集成组',
      updatedAt: '2026-07-11 11:00',
      status: 'connected',
    },
    {
      id: 'ds-ev-mqtt',
      name: '公共测试 MQTT 代理',
      type: 'MQTT',
      host: 'broker.emqx.io:1883',
      database: 'factory/telemetry/erasernoob',
      owner: '系统管理员',
      updatedAt: '2026-07-11 12:00',
      status: 'connected',
    },
  ],
  datasets: [
    {
      id: 'set-001',
      name: '车间实时能耗',
      dataSourceId: 'ds-001',
      sourceName: '生产 MySQL 主库',
      tableName: 'energy_realtime_view',
      refreshMode: '5 min',
      fieldCount: 14,
      updatedAt: '2026-07-05 17:12',
    },
    {
      id: 'set-002',
      name: '设备告警流',
      dataSourceId: 'ds-002',
      sourceName: '告警 MQTT Broker',
      tableName: 'topic:/alarm/#',
      refreshMode: 'real-time',
      fieldCount: 8,
      updatedAt: '2026-07-05 13:44',
    },
    {
      id: 'set-003',
      name: '设备资产清单',
      dataSourceId: 'ds-003',
      sourceName: '超级工厂 REST API',
      tableName: 'assets',
      refreshMode: 'manual',
      fieldCount: 11,
      updatedAt: '2026-07-03 09:05',
    },
    {
      id: 'set-oee-metrics',
      name: '综合指标数据集',
      dataSourceId: 'ds-003',
      sourceName: '超级工厂 REST API',
      tableName: 'factory/metrics',
      refreshMode: '5 min',
      fieldCount: 5,
      updatedAt: '2026-07-11 11:00',
    },
    {
      id: 'set-production-progress',
      name: '产量进度数据集',
      dataSourceId: 'ds-003',
      sourceName: '超级工厂 REST API',
      tableName: 'factory/production-progress',
      refreshMode: '5 min',
      fieldCount: 5,
      updatedAt: '2026-07-11 11:00',
    },
    {
      id: 'set-workshop-oee',
      name: '车间效率数据集',
      dataSourceId: 'ds-003',
      sourceName: '超级工厂 REST API',
      tableName: 'factory/workshop-oee',
      refreshMode: '5 min',
      fieldCount: 3,
      updatedAt: '2026-07-11 11:00',
    },
    {
      id: 'set-energy-distribution',
      name: '能耗分配数据集',
      dataSourceId: 'ds-003',
      sourceName: '超级工厂 REST API',
      tableName: 'factory/energy-distribution',
      refreshMode: '5 min',
      fieldCount: 3,
      updatedAt: '2026-07-11 11:00',
    },
    {
      id: 'set-hourly-throughput',
      name: '每小时产量数据集',
      dataSourceId: 'ds-003',
      sourceName: '超级工厂 REST API',
      tableName: 'factory/production-trend',
      refreshMode: '5 min',
      fieldCount: 3,
      updatedAt: '2026-07-11 11:00',
    },
    {
      id: 'set-equipment-vibration',
      name: '设备遥测数据集',
      dataSourceId: 'ds-003',
      sourceName: '超级工厂 REST API',
      tableName: 'factory/equipment-vibration',
      refreshMode: '5 min',
      fieldCount: 3,
      updatedAt: '2026-07-11 11:00',
    },
    {
      id: 'set-active-alarms',
      name: "实时告警数据集",
      dataSourceId: "ds-003",
      sourceName: "超级工厂 REST API",
      tableName: "factory/alarms",
      refreshMode: "5 min",
      fieldCount: 3,
      updatedAt: "2026-07-11 11:00"
    },
    {
      id: 'set-ev-mqtt',
      name: "设备实时遥测 (MQTT)",
      dataSourceId: "ds-ev-mqtt",
      sourceName: "公共测试 MQTT 代理",
      tableName: "factory/telemetry/erasernoob",
      refreshMode: "real-time",
      fieldCount: 6,
      updatedAt: "2026-07-11 12:00"
    }
  ],
  users: [
    {
      id: 'usr-001',
      username: 'admin',
      displayName: '系统管理员',
      role: 'Super Admin',
      phone: '13800000001',
      updatedAt: '2026-07-05 20:00',
      status: 'active',
      passwordHash: hashPassword('Admin@123'),
    },
    {
      id: 'usr-002',
      username: 'li.gong',
      displayName: '李工',
      role: 'Screen Designer',
      phone: '13800000012',
      updatedAt: '2026-07-04 18:45',
      status: 'active',
      passwordHash: hashPassword('Screen@123'),
    },
    {
      id: 'usr-003',
      username: 'zhou.xuan',
      displayName: '周璇',
      role: 'Scene Editor',
      phone: '13800000029',
      updatedAt: '2026-07-02 16:30',
      status: 'disabled',
      passwordHash: hashPassword('Scene@123'),
    },
  ],
  projects: [
    {
      id: 'prj-001',
      name: '能源驾驶舱',
      type: '2D',
      group: '能源中心',
      owner: '李工',
      updatedAt: '2026-07-05 18:30',
      status: 'published',
    },
    {
      id: 'prj-002',
      name: '智慧工厂三维漫游',
      type: '3D',
      group: '三维工厂',
      owner: '陈凯',
      updatedAt: '2026-07-05 16:10',
      status: 'published',
    },
    {
      id: 'prj-003',
      name: '安全环保监测',
      type: '2D',
      group: '安全环保',
      owner: '赵宁',
      updatedAt: '2026-07-02 09:45',
      status: 'draft',
    },
  ],
  roles: [
    {
      id: 'role-001',
      name: 'Super Admin',
      description: '拥有平台全量管理权限。',
      permissions: [
        'screen:read',
        'screen:write',
        'scene:read',
        'scene:write',
        'data-source:read',
        'data-source:write',
        'dataset:read',
        'dataset:write',
        'user:read',
        'user:write',
        'project:read',
        'project:write',
        'system:write',
      ],
    },
    {
      id: 'role-002',
      name: 'Screen Designer',
      description: '负责 2D 大屏项目的设计、预览和发布。',
      permissions: ['screen:read', 'screen:write', 'dataset:read', 'project:read'],
    },
    {
      id: 'role-003',
      name: 'Scene Editor',
      description: '负责 3D 场景和模型管理。',
      permissions: ['scene:read', 'scene:write', 'dataset:read', 'project:read'],
    },
    {
      id: 'role-004',
      name: 'Data Operator',
      description: '负责数据源维护、连通性测试和数据集建模。',
      permissions: ['data-source:read', 'data-source:write', 'dataset:read', 'dataset:write'],
    },
  ],
  projectMemberships: [
    { id: 'pm-001', userId: 'usr-002', projectId: 'prj-001', accessLevel: 'owner' },
    { id: 'pm-002', userId: 'usr-002', projectId: 'prj-003', accessLevel: 'viewer' },
    { id: 'pm-003', userId: 'usr-003', projectId: 'prj-002', accessLevel: 'owner' },
  ],
}
