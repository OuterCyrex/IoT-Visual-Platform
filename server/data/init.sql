CREATE DATABASE IF NOT EXISTS iot_visual_platform
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS factory_prod
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE iot_visual_platform;

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  permissions TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(128) NOT NULL UNIQUE,
  display_name VARCHAR(128) NOT NULL,
  role VARCHAR(128) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  updated_at VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(16) NOT NULL,
  project_group VARCHAR(128) NOT NULL,
  owner VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  updated_at VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS screen_projects (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  project_group VARCHAR(128) NOT NULL,
  scene VARCHAR(128) NOT NULL,
  owner VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  published_version VARCHAR(64) NOT NULL,
  tags TEXT NOT NULL,
  screen_nodes TEXT NOT NULL,
  updated_at VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS scene_projects (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  project_group VARCHAR(128) NOT NULL,
  owner VARCHAR(128) NOT NULL,
  model_count INT NOT NULL,
  status VARCHAR(32) NOT NULL,
  engine VARCHAR(64) NOT NULL,
  scene_nodes TEXT NOT NULL,
  updated_at VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS data_sources (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(32) NOT NULL,
  host VARCHAR(255) NOT NULL,
  database_name VARCHAR(255) NOT NULL,
  owner VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  updated_at VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS datasets (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  data_source_id VARCHAR(64) NOT NULL,
  source_name VARCHAR(128) NOT NULL,
  table_name VARCHAR(255) NOT NULL,
  refresh_mode VARCHAR(32) NOT NULL,
  field_count INT NOT NULL,
  updated_at VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS project_memberships (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  project_id VARCHAR(64) NOT NULL,
  access_level VARCHAR(16) NOT NULL
);

DELETE FROM project_memberships;
DELETE FROM datasets;
DELETE FROM data_sources;
DELETE FROM scene_projects;
DELETE FROM screen_projects;
DELETE FROM projects;
DELETE FROM users;
DELETE FROM roles;

INSERT INTO roles (id, name, description, permissions) VALUES
('role-001', 'Super Admin', '拥有平台全部管理权限。', '["screen:read","screen:write","scene:read","scene:write","data-source:read","data-source:write","dataset:read","dataset:write","user:read","user:write","project:read","project:write","system:write"]'),
('role-002', 'Screen Designer', '负责 2D 大屏项目的设计、预览和发布。', '["screen:read","screen:write","dataset:read","project:read"]'),
('role-003', 'Scene Editor', '负责 3D 场景与模型管理。', '["scene:read","scene:write","dataset:read","project:read"]'),
('role-004', 'Data Operator', '负责数据源维护、连通性测试和数据集建模。', '["data-source:read","data-source:write","dataset:read","dataset:write"]');

INSERT INTO users (id, username, display_name, role, phone, password_hash, status, updated_at) VALUES
('usr-001', 'admin', '系统管理员', 'Super Admin', '13800000001', 'ee67c8d3f753192541a3e283979305c41558b35d96be11b8cc81d34adbd9d42b', 'active', '2026-07-11 10:00'),
('usr-002', 'li.gong', '李工', 'Screen Designer', '13800000012', '41de2a99c36bc303624da6c74b5e742684e1507369d09b6382e2cf9e35a14355', 'active', '2026-07-11 10:00'),
('usr-003', 'zhou.xuan', '周璇', 'Scene Editor', '13800000029', '9cdbb103d71a92e1dfbe43cb716babc677fa7a01c6d166fe1d184529610f7aad', 'active', '2026-07-11 10:00');

INSERT INTO projects (id, name, type, project_group, owner, status, updated_at) VALUES
('prj-ev-001', '电驱总成装配 2D 大屏', '2D', '智能装配车间', '李工', 'published', '2026-07-11 10:00'),
('prj-ev-002', '智慧工厂三维巡检', '3D', '数字孪生中心', '周璇', 'editing', '2026-07-11 10:00'),
('prj-ev-003', '厂务能源中心总览', '2D', '能源管理中心', '系统管理员', 'draft', '2026-07-11 10:00');

INSERT INTO screen_projects (id, name, project_group, scene, owner, status, published_version, tags, screen_nodes, updated_at) VALUES
(
  'scr-ev-001',
  '新能源汽车电驱总成装配运营大屏',
  '智能装配车间',
  '总装生产运营',
  '李工',
  'published',
  'v1.0.0',
  '["工业制造","电驱装配","OEE","Andon"]',
  '[{"id":"node-title","component":"text","x":642,"y":26,"w":640,"h":54,"props":{"text":"新能源汽车电驱总成装配车间运营总览"}},{"id":"node-kpi-output","component":"metricCard","x":36,"y":104,"w":260,"h":150,"props":{"text":"本班产出","datasetId":"set-ev-001","xField":"shift_name","yField":"actual_qty","refreshInterval":5000}},{"id":"node-kpi-oee","component":"metricCard","x":314,"y":104,"w":260,"h":150,"props":{"text":"产线 OEE","datasetId":"set-ev-001","xField":"shift_name","yField":"oee_rate","refreshInterval":5000}},{"id":"node-kpi-quality","component":"metricCard","x":592,"y":104,"w":260,"h":150,"props":{"text":"一次合格率","datasetId":"set-ev-001","xField":"shift_name","yField":"first_pass_rate","refreshInterval":5000}},{"id":"node-kpi-energy","component":"metricCard","x":870,"y":104,"w":260,"h":150,"props":{"text":"单台能耗","datasetId":"set-ev-001","xField":"shift_name","yField":"unit_energy_kwh","refreshInterval":5000}},{"id":"node-order-progress","component":"progressBar","x":1148,"y":104,"w":736,"h":150,"props":{"text":"工单达成率","datasetId":"set-ev-002","xField":"work_order_no","yField":"completion_rate","refreshInterval":5000}},{"id":"node-output-chart","component":"chart","x":36,"y":286,"w":610,"h":330,"props":{"text":"产线小时产出对比","datasetId":"set-ev-003","xField":"line_name","yField":"output_qty","refreshInterval":10000}},{"id":"node-quality-line","component":"lineChart","x":668,"y":286,"w":610,"h":330,"props":{"text":"质量趋势","datasetId":"set-ev-004","xField":"period_label","yField":"pass_rate","refreshInterval":10000}},{"id":"node-status-pie","component":"pieChart","x":1300,"y":286,"w":584,"h":330,"props":{"text":"设备状态分布","datasetId":"set-ev-005","xField":"status_name","yField":"device_count","refreshInterval":10000}},{"id":"node-oee-ranking","component":"rankingList","x":36,"y":646,"w":420,"h":380,"props":{"text":"线体 OEE 排行","datasetId":"set-ev-006","xField":"line_name","yField":"oee_rate","refreshInterval":10000}},{"id":"node-alert-list","component":"alertList","x":478,"y":646,"w":700,"h":380,"props":{"text":"Andon 告警事件","datasetId":"set-ev-007","xField":"alarm_message","yField":"alarm_level","refreshInterval":5000}},{"id":"node-cycle-chart","component":"chart","x":1200,"y":646,"w":684,"h":380,"props":{"text":"关键工位节拍监控","datasetId":"set-ev-008","xField":"station_name","yField":"cycle_seconds","refreshInterval":10000}}]',
  '2026-07-11 10:00'
),
(
  'scr-ev-002',
  '厂务能源中心总览',
  '能源管理中心',
  '园区能源驾驶舱',
  '系统管理员',
  'draft',
  '未发布',
  '["能源","厂务"]',
  '[]',
  '2026-07-11 10:00'
),
(
  'scr-001',
  '新能源超级工厂集成控制大屏',
  '能源中心',
  '园区驾驶舱',
  '李工',
  'published',
  'v2.0.0',
  '["超级工厂","实时监控","OEE"]',
  '[{"id":"node-title","x":200,"y":15,"w":1520,"h":70,"component":"text","props":{"text":"GigaFactory 新新能源汽车智造超级工厂数智化集成监控中心"}},{"id":"node-oee","x":40,"y":100,"w":420,"h":220,"component":"metricCard","props":{"text":"整厂综合运营效能 OEE","datasetId":"set-oee-metrics","xField":"desc","yField":"oee_percent","refreshInterval":5000}},{"id":"node-progress","x":40,"y":350,"w":420,"h":220,"component":"progressBar","props":{"text":"今日产量计划达成率","datasetId":"set-production-progress","xField":"task_name","yField":"progress_percent","refreshInterval":5000}},{"id":"node-ranking","x":40,"y":600,"w":420,"h":440,"component":"rankingList","props":{"text":"车间效率 OEE 排行","datasetId":"set-workshop-oee","xField":"workshop","yField":"oee","refreshInterval":5000}},{"id":"node-alerts","x":480,"y":100,"w":960,"h":470,"component":"alertList","props":{"text":"智能工厂设备健康告警流","datasetId":"set-active-alarms","xField":"message","yField":"level","refreshInterval":5000}},{"id":"node-vibration","x":480,"y":600,"w":960,"h":440,"component":"chart","props":{"text":"关键主轴与泵机物理振动遥测 (mm/s)","datasetId":"set-equipment-vibration","xField":"device","yField":"vibration","refreshInterval":5000}},{"id":"node-energy","x":1460,"y":100,"w":420,"h":470,"component":"pieChart","props":{"text":"各工艺车间用电负荷占比 (kWh)","datasetId":"set-energy-distribution","xField":"workshop","yField":"kwh","refreshInterval":5000}},{"id":"node-throughput","x":1460,"y":600,"w":420,"h":440,"component":"lineChart","props":{"text":"1号压铸机主轴温度实时监控 (MQTT)","datasetId":"set-ev-mqtt","xField":"timestamp","yField":"temperature","refreshInterval":0}}]',
  '2026-07-11 11:00'
),
(
  'scr-004',
  '智算中心101号机房运行大屏',
  '数据中心',
  '101号机房',
  '李工',
  'published',
  'v1.0.0',
  '["数据中心","机房平面图","设备遥测"]',
  '[{"id":"node-title","x":200,"y":15,"w":1520,"h":70,"component":"text","props":{"text":"GigaData 智算数据中心 101 号核心机房运行总览"}},{"id":"node-time","x":40,"y":15,"w":360,"h":80,"component":"timeWeather","props":{"text":"系统时间与环境天气"}},{"id":"node-pue","x":40,"y":110,"w":380,"h":180,"component":"metricCard","props":{"text":"机房实时 PUE 能效比","datasetId":"","xField":"实时能效","yField":"1.24"}},{"id":"node-soc","x":40,"y":310,"w":380,"h":180,"component":"ringProgress","props":{"text":"备用储能电量 SoC","datasetId":"set-production-progress","xField":"task_name","yField":"progress_percent","refreshInterval":5000}},{"id":"node-humidity","x":40,"y":510,"w":380,"h":240,"component":"pieChart","props":{"text":"机柜区域热载荷比例","datasetId":"set-energy-distribution","xField":"workshop","yField":"kwh","refreshInterval":5000}},{"id":"node-floorplan-box","x":450,"y":110,"w":620,"h":640,"component":"borderBox","props":{"text":"101 号核心机房物理设备布局"}},{"id":"dev-rack-a01","x":480,"y":170,"w":120,"h":140,"component":"topologyDevice","props":{"text":"A-01 机柜","deviceType":"rack","status":"running"}},{"id":"dev-rack-a02","x":610,"y":170,"w":120,"h":140,"component":"topologyDevice","props":{"text":"A-02 核心机柜 (MQTT)","deviceType":"rack","status":"running","datasetId":"set-ev-mqtt","xField":"timestamp","yField":"temperature","refreshInterval":0}},{"id":"dev-rack-a03","x":740,"y":170,"w":120,"h":140,"component":"topologyDevice","props":{"text":"A-03 机柜","deviceType":"rack","status":"running"}},{"id":"dev-chiller-01","x":880,"y":170,"w":120,"h":140,"component":"topologyDevice","props":{"text":"1号精密空调","deviceType":"chiller","status":"running"}},{"id":"dev-rack-b01","x":480,"y":330,"w":120,"h":140,"component":"topologyDevice","props":{"text":"B-01 机柜","deviceType":"rack","status":"running"}},{"id":"dev-rack-b02","x":610,"y":330,"w":120,"h":140,"component":"topologyDevice","props":{"text":"B-02 备用机柜","deviceType":"rack","status":"warning"}},{"id":"dev-rack-b03","x":740,"y":330,"w":120,"h":140,"component":"topologyDevice","props":{"text":"B-03 机柜","deviceType":"rack","status":"running"}},{"id":"dev-chiller-02","x":880,"y":330,"w":120,"h":140,"component":"topologyDevice","props":{"text":"2号精密空调","deviceType":"chiller","status":"running"}},{"id":"dev-transformer","x":480,"y":490,"w":120,"h":140,"component":"topologyDevice","props":{"text":"1号变压器","deviceType":"transformer","status":"running"}},{"id":"dev-cabinet","x":610,"y":490,"w":120,"h":140,"component":"topologyDevice","props":{"text":"高压配电柜","deviceType":"cabinet","status":"running"}},{"id":"dev-ups","x":740,"y":490,"w":120,"h":140,"component":"topologyDevice","props":{"text":"UPS 机组","deviceType":"ups","status":"running"}},{"id":"dev-generator","x":880,"y":490,"w":120,"h":140,"component":"topologyDevice","props":{"text":"应急柴油发电机","deviceType":"generator","status":"stopped"}},{"id":"node-alerts","x":40,"y":770,"w":1030,"h":270,"component":"alertList","props":{"text":"智算机房动力与安全告警日志流","datasetId":"set-active-alarms","xField":"message","yField":"level","refreshInterval":5000}},{"id":"node-power-line","x":1100,"y":110,"w":780,"h":280,"component":"lineChart","props":{"text":"机房总用电负荷逐时趋势 (kW)","datasetId":"set-hourly-throughput","xField":"hour","yField":"count","refreshInterval":5000}},{"id":"node-vibration-chart","x":1100,"y":410,"w":780,"h":310,"component":"chart","props":{"text":"核心节点机架出风口温度监控 (℃)","datasetId":"set-equipment-vibration","xField":"device","yField":"vibration","refreshInterval":5000}},{"id":"node-cooling-flow","x":1100,"y":740,"w":780,"h":300,"component":"scrollTable","props":{"text":"各机架集群温度与负荷清单","datasetId":"set-workshop-oee","xField":"workshop","yField":"oee","refreshInterval":5000}}]',
  '2026-07-11 18:30'
),
(
  'scr-005',
  '智慧矿山管控平台',
  '矿山中心',
  '主斜井及采区',
  '系统管理员',
  'published',
  'v10.3',
  '["智慧矿山","流光流程图","安全监管"]',
  '[{"id":"node-title","x":200,"y":15,"w":1520,"h":70,"component":"text","props":{"text":"智慧矿山管控平台"}},{"id":"node-time","x":40,"y":15,"w":360,"h":80,"component":"timeWeather","props":{"text":"系统时间与环境天气"}},{"id":"node-env-box","x":40,"y":110,"w":380,"h":220,"component":"borderBox","props":{"text":"矿山环境监测 (Environment)"}},{"id":"node-env-temp","x":60,"y":150,"w":160,"h":75,"component":"metricCard","props":{"text":"温度","yField":"29.8°C"}},{"id":"node-env-humidity","x":240,"y":150,"w":160,"h":75,"component":"metricCard","props":{"text":"湿度","yField":"40%"}},{"id":"node-env-co2","x":60,"y":235,"w":160,"h":75,"component":"metricCard","props":{"text":"CO2浓度","yField":"15 mg/m³"}},{"id":"node-env-wind","x":240,"y":235,"w":160,"h":75,"component":"metricCard","props":{"text":"井下风速","yField":"2.8 m/s"}},{"id":"node-safety-box","x":40,"y":350,"w":380,"h":240,"component":"borderBox","props":{"text":"安全监管与隐患排查"}},{"id":"node-safety-ring","x":60,"y":400,"w":160,"h":160,"component":"ringProgress","props":{"text":"本班安全率","yField":"75"}},{"id":"node-safety-status","x":240,"y":400,"w":160,"h":160,"component":"metricCard","props":{"text":"排查隐患 (正常率)","yField":"75%"}},{"id":"node-energy-line","x":40,"y":610,"w":380,"h":430,"component":"lineChart","props":{"text":"周动力用电负荷趋势 (kWh)","datasetId":"set-hourly-throughput","xField":"hour","yField":"count","refreshInterval":5000}},{"id":"node-process-map","x":440,"y":110,"w":1040,"h":640,"component":"mineProcessMap","props":{"text":"等距智能采矿输送物料流","datasetId":"set-ev-mqtt","xField":"timestamp","yField":"value","refreshInterval":0}},{"id":"node-alarms-table","x":440,"y":770,"w":1040,"h":270,"component":"alertList","props":{"text":"井下有毒气体及瓦斯实时监测告警","datasetId":"set-active-alarms","xField":"message","yField":"level","refreshInterval":5000}},{"id":"node-control-box","x":1500,"y":110,"w":380,"h":220,"component":"borderBox","props":{"text":"通风/排水/防瓦斯系统状态"}},{"id":"node-control-grid","x":1520,"y":150,"w":340,"h":160,"component":"statusGrid","props":{"text":"集控系统运行状态","datasetId":"set-workshop-oee","xField":"workshop","yField":"oee","refreshInterval":5000}},{"id":"node-inspection-pie","x":1500,"y":350,"w":380,"h":240,"component":"pieChart","props":{"text":"日巡检计划达成率 (57%)","datasetId":"set-production-progress","xField":"task_name","yField":"progress_percent","refreshInterval":5000}},{"id":"node-tonnage-bar","x":1500,"y":610,"w":380,"h":430,"component":"chart","props":{"text":"分时装车矿石吞吐量 (t)","datasetId":"set-hourly-throughput","xField":"hour","yField":"count","refreshInterval":5000}}]',
  '2026-07-11 17:41'
);

INSERT INTO scene_projects (id, name, project_group, owner, model_count, status, engine, scene_nodes, updated_at) VALUES
(
  'scn-ev-001',
  '智慧工厂三维巡检',
  '数字孪生中心',
  '周璇',
  8,
  'editing',
  'Three.js',
  '[]',
  '2026-07-11 10:00'
);

INSERT INTO data_sources (id, name, type, host, database_name, owner, status, updated_at) VALUES
('ds-ev-mysql', '生产 MySQL 主库', 'MySQL', '127.0.0.1:3306', 'factory_prod', '系统管理员', 'connected', '2026-07-11 10:00'),
('ds-ev-rest', '设备主数据 REST 服务', 'REST', 'http://localhost:5000', '/api', '系统管理员', 'connected', '2026-07-11 10:00'),
('ds-ev-mqtt', '公共测试 MQTT 代理', 'MQTT', 'broker.emqx.io:1883', 'factory/telemetry/erasernoob', '系统管理员', 'connected', '2026-07-11 12:00');

INSERT INTO datasets (id, name, data_source_id, source_name, table_name, refresh_mode, field_count, updated_at) VALUES
('set-ev-001', '班次核心指标', 'ds-ev-mysql', '生产 MySQL 主库', 'assembly_shift_kpi', 'real-time', 10, '2026-07-11 10:00'),
('set-ev-002', '工单执行进度', 'ds-ev-mysql', '生产 MySQL 主库', 'work_order_progress', 'real-time', 8, '2026-07-11 10:00'),
('set-ev-003', '产线实时产出', 'ds-ev-mysql', '生产 MySQL 主库', 'line_output_hourly', 'real-time', 7, '2026-07-11 10:00'),
('set-ev-004', '质量趋势', 'ds-ev-mysql', '生产 MySQL 主库', 'quality_trend_daily', '5 min', 6, '2026-07-11 10:00'),
('set-ev-005', '设备状态统计', 'ds-ev-mysql', '生产 MySQL 主库', 'equipment_status_distribution', '5 min', 5, '2026-07-11 10:00'),
('set-ev-006', '线体 OEE 排行', 'ds-ev-mysql', '生产 MySQL 主库', 'line_oee_ranking', '5 min', 6, '2026-07-11 10:00'),
('set-ev-007', 'Andon 告警事件', 'ds-ev-mysql', '生产 MySQL 主库', 'andon_alarm_events', 'real-time', 8, '2026-07-11 10:00'),
('set-ev-008', '关键工位节拍', 'ds-ev-mysql', '生产 MySQL 主库', 'station_cycle_monitor', 'real-time', 7, '2026-07-11 10:00'),
('set-ev-009', '设备资产台账', 'ds-ev-mysql', '生产 MySQL 主库', 'device_assets', 'manual', 7, '2026-07-11 10:00'),
('set-oee-metrics', '综合指标数据集', 'ds-ev-rest', '设备主数据 REST 服务', 'factory/metrics', '5 min', 5, '2026-07-11 11:00'),
('set-production-progress', '产量进度数据集', 'ds-ev-rest', '设备主数据 REST 服务', 'factory/production-progress', '5 min', 5, '2026-07-11 11:00'),
('set-workshop-oee', '车间效率数据集', 'ds-ev-rest', '设备主数据 REST 服务', 'factory/workshop-oee', '5 min', 3, '2026-07-11 11:00'),
('set-energy-distribution', '能耗分配数据集', 'ds-ev-rest', '设备主数据 REST 服务', 'factory/energy-distribution', '5 min', 3, '2026-07-11 11:00'),
('set-hourly-throughput', '每小时产量数据集', 'ds-ev-rest', '设备主数据 REST 服务', 'factory/production-trend', '5 min', 3, '2026-07-11 11:00'),
('set-equipment-vibration', '设备遥测数据集', 'ds-ev-rest', '设备主数据 REST 服务', 'factory/equipment-vibration', '5 min', 3, '2026-07-11 11:00'),
('set-active-alarms', '实时告警数据集', 'ds-ev-rest', '设备主数据 REST 服务', 'factory/alarms', '5 min', 3, '2026-07-11 11:00'),
('set-ev-mqtt', '设备实时遥测 (MQTT)', 'ds-ev-mqtt', '公共测试 MQTT 代理', 'factory/telemetry/erasernoob', 'real-time', 6, '2026-07-11 12:00');

INSERT INTO project_memberships (id, user_id, project_id, access_level) VALUES
('pm-ev-001', 'usr-002', 'prj-ev-001', 'owner'),
('pm-ev-002', 'usr-003', 'prj-ev-002', 'owner'),
('pm-ev-003', 'usr-001', 'prj-ev-003', 'owner');

USE factory_prod;

CREATE TABLE IF NOT EXISTS assembly_shift_kpi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shift_date DATE NOT NULL,
  shift_name VARCHAR(32) NOT NULL,
  work_center VARCHAR(64) NOT NULL,
  plan_qty INT NOT NULL,
  actual_qty INT NOT NULL,
  completion_rate DECIMAL(6, 2) NOT NULL,
  oee_rate DECIMAL(6, 2) NOT NULL,
  first_pass_rate DECIMAL(6, 2) NOT NULL,
  unit_energy_kwh DECIMAL(8, 2) NOT NULL,
  alarm_count INT NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS work_order_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_order_no VARCHAR(64) NOT NULL,
  product_name VARCHAR(128) NOT NULL,
  line_name VARCHAR(64) NOT NULL,
  plan_qty INT NOT NULL,
  completed_qty INT NOT NULL,
  completion_rate DECIMAL(6, 2) NOT NULL,
  due_time DATETIME NOT NULL,
  status VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS line_output_hourly (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stat_time DATETIME NOT NULL,
  line_name VARCHAR(64) NOT NULL,
  output_qty INT NOT NULL,
  target_qty INT NOT NULL,
  running_workers INT NOT NULL,
  online_devices INT NOT NULL
);

CREATE TABLE IF NOT EXISTS quality_trend_daily (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_label VARCHAR(32) NOT NULL,
  pass_rate DECIMAL(6, 2) NOT NULL,
  defect_rate DECIMAL(6, 2) NOT NULL,
  rework_qty INT NOT NULL,
  scrap_qty INT NOT NULL,
  audit_score DECIMAL(6, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS equipment_status_distribution (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status_name VARCHAR(32) NOT NULL,
  device_count INT NOT NULL,
  total_minutes INT NOT NULL,
  utilization_rate DECIMAL(6, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS line_oee_ranking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  line_name VARCHAR(64) NOT NULL,
  oee_rate DECIMAL(6, 2) NOT NULL,
  availability_rate DECIMAL(6, 2) NOT NULL,
  performance_rate DECIMAL(6, 2) NOT NULL,
  quality_rate DECIMAL(6, 2) NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS andon_alarm_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alarm_time DATETIME NOT NULL,
  line_name VARCHAR(64) NOT NULL,
  station_name VARCHAR(64) NOT NULL,
  alarm_level VARCHAR(16) NOT NULL,
  alarm_message VARCHAR(255) NOT NULL,
  duration_seconds INT NOT NULL,
  status VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS station_cycle_monitor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  station_name VARCHAR(64) NOT NULL,
  line_name VARCHAR(64) NOT NULL,
  cycle_seconds DECIMAL(8, 2) NOT NULL,
  takt_seconds DECIMAL(8, 2) NOT NULL,
  deviation_rate DECIMAL(6, 2) NOT NULL,
  station_status VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS energy_realtime_view (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  workshop_name VARCHAR(64) NOT NULL,
  electricity_kwh DECIMAL(10, 2) NOT NULL,
  water_m3 DECIMAL(10, 2) NOT NULL,
  gas_m3 DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS device_alarm_stream (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  device_id VARCHAR(64) NOT NULL,
  device_name VARCHAR(128) NOT NULL,
  alarm_level VARCHAR(16) NOT NULL,
  alarm_message VARCHAR(255) NOT NULL,
  status VARCHAR(16) NOT NULL
);

CREATE TABLE IF NOT EXISTS device_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(64) NOT NULL,
  model VARCHAR(64) NOT NULL,
  location VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL
);

DELETE FROM assembly_shift_kpi;
DELETE FROM work_order_progress;
DELETE FROM line_output_hourly;
DELETE FROM quality_trend_daily;
DELETE FROM equipment_status_distribution;
DELETE FROM line_oee_ranking;
DELETE FROM andon_alarm_events;
DELETE FROM station_cycle_monitor;
DELETE FROM energy_realtime_view;
DELETE FROM device_alarm_stream;
DELETE FROM device_assets;

INSERT INTO assembly_shift_kpi
  (shift_date, shift_name, work_center, plan_qty, actual_qty, completion_rate, oee_rate, first_pass_rate, unit_energy_kwh, alarm_count, updated_at)
VALUES
  ('2026-07-11', '白班', '电驱总成装配车间', 480, 452, 94.17, 87.60, 98.42, 12.80, 4, '2026-07-11 10:00:00'),
  ('2026-07-11', '夜班', '电驱总成装配车间', 460, 438, 95.22, 85.40, 97.95, 13.20, 6, '2026-07-11 10:00:00');

INSERT INTO work_order_progress
  (work_order_no, product_name, line_name, plan_qty, completed_qty, completion_rate, due_time, status)
VALUES
  ('WO-EDU-20260711-01', 'EDU 180kW 电驱总成', 'A线装配', 300, 268, 89.33, '2026-07-11 18:00:00', 'running'),
  ('WO-EDU-20260711-02', 'EDU 220kW 电驱总成', 'B线装配', 180, 172, 95.56, '2026-07-11 20:00:00', 'running'),
  ('WO-EDU-20260711-03', '减速器子总成', 'C线预装', 120, 118, 98.33, '2026-07-11 16:30:00', 'running');

INSERT INTO line_output_hourly
  (stat_time, line_name, output_qty, target_qty, running_workers, online_devices)
VALUES
  ('2026-07-11 08:00:00', 'A线装配', 62, 60, 18, 12),
  ('2026-07-11 08:00:00', 'B线装配', 54, 55, 16, 10),
  ('2026-07-11 08:00:00', 'C线预装', 39, 40, 12, 8),
  ('2026-07-11 09:00:00', 'A线装配', 66, 60, 18, 12),
  ('2026-07-11 09:00:00', 'B线装配', 57, 55, 16, 10),
  ('2026-07-11 09:00:00', 'C线预装', 41, 40, 12, 8),
  ('2026-07-11 10:00:00', 'A线装配', 69, 60, 18, 12),
  ('2026-07-11 10:00:00', 'B线装配', 61, 55, 16, 10),
  ('2026-07-11 10:00:00', 'C线预装', 45, 40, 12, 8);

INSERT INTO quality_trend_daily
  (period_label, pass_rate, defect_rate, rework_qty, scrap_qty, audit_score)
VALUES
  ('07-05', 97.86, 2.14, 12, 2, 92.50),
  ('07-06', 98.02, 1.98, 10, 1, 93.80),
  ('07-07', 98.21, 1.79, 9, 1, 94.60),
  ('07-08', 98.36, 1.64, 8, 1, 95.10),
  ('07-09', 98.27, 1.73, 9, 2, 94.80),
  ('07-10', 98.42, 1.58, 7, 1, 95.60),
  ('07-11', 98.55, 1.45, 6, 1, 96.20);

INSERT INTO equipment_status_distribution
  (status_name, device_count, total_minutes, utilization_rate)
VALUES
  ('运行', 26, 9360, 72.80),
  ('待机', 7, 2110, 16.40),
  ('告警', 2, 640, 4.90),
  ('保养', 1, 750, 5.90);

INSERT INTO line_oee_ranking
  (line_name, oee_rate, availability_rate, performance_rate, quality_rate, updated_at)
VALUES
  ('A线装配', 88.90, 92.60, 95.20, 99.05, '2026-07-11 10:00:00'),
  ('B线装配', 86.40, 90.80, 94.10, 98.72, '2026-07-11 10:00:00'),
  ('C线预装', 83.75, 89.30, 92.45, 98.10, '2026-07-11 10:00:00'),
  ('转子压装线', 81.60, 87.90, 91.80, 97.85, '2026-07-11 10:00:00'),
  ('总成测试线', 79.85, 86.50, 90.60, 97.40, '2026-07-11 10:00:00');

INSERT INTO andon_alarm_events
  (alarm_time, line_name, station_name, alarm_level, alarm_message, duration_seconds, status)
VALUES
  ('2026-07-11 09:42:00', 'A线装配', '定子压装工位', 'Critical', '压装力偏离上限，设备自动停机待检', 480, 'active'),
  ('2026-07-11 09:55:00', 'B线装配', '视觉检测工位', 'Warning', '相机识别成功率下降至 92.4%', 260, 'active'),
  ('2026-07-11 08:36:00', 'C线预装', '螺栓锁附工位', 'Warning', '电批扭矩波动超阈值', 190, 'resolved'),
  ('2026-07-11 08:15:00', '总成测试线', 'NVH 测试工位', 'Info', '测试程序版本已切换到 V2.7', 60, 'resolved'),
  ('2026-07-11 09:12:00', 'A线装配', 'AGV 上料口', 'Warning', '物料配送延时超过 5 分钟', 310, 'active');

INSERT INTO station_cycle_monitor
  (station_name, line_name, cycle_seconds, takt_seconds, deviation_rate, station_status)
VALUES
  ('定子压装工位', 'A线装配', 74.50, 68.00, 9.56, 'warning'),
  ('转子装配工位', 'A线装配', 66.20, 68.00, -2.65, 'running'),
  ('端盖锁附工位', 'B线装配', 63.80, 60.00, 6.33, 'warning'),
  ('气密测试工位', 'B线装配', 58.90, 60.00, -1.83, 'running'),
  ('EOL 测试工位', '总成测试线', 82.40, 75.00, 9.87, 'warning'),
  ('NVH 测试工位', '总成测试线', 71.60, 75.00, -4.53, 'running');

INSERT INTO energy_realtime_view
  (timestamp, workshop_name, electricity_kwh, water_m3, gas_m3)
VALUES
  ('2026-07-11 08:00:00', '电驱总成装配车间', 1580.40, 22.30, 85.10),
  ('2026-07-11 08:00:00', '机加车间', 2145.80, 18.20, 42.50),
  ('2026-07-11 08:00:00', '总成测试车间', 1294.60, 8.20, 0.00),
  ('2026-07-11 09:00:00', '电驱总成装配车间', 1668.70, 24.10, 90.30),
  ('2026-07-11 09:00:00', '机加车间', 2236.90, 19.00, 44.10),
  ('2026-07-11 09:00:00', '总成测试车间', 1348.50, 8.60, 0.00),
  ('2026-07-11 10:00:00', '电驱总成装配车间', 1712.30, 25.40, 93.80),
  ('2026-07-11 10:00:00', '机加车间', 2298.20, 19.50, 45.90),
  ('2026-07-11 10:00:00', '总成测试车间', 1386.70, 8.90, 0.00);

INSERT INTO device_alarm_stream
  (timestamp, device_id, device_name, alarm_level, alarm_message, status)
VALUES
  ('2026-07-11 09:42:00', 'EQ-A-012', '定子压装机', 'Critical', '主轴压装力偏离上限', 'Active'),
  ('2026-07-11 09:55:00', 'EQ-B-021', '视觉检测站', 'Warning', '图像识别成功率下降', 'Active'),
  ('2026-07-11 09:12:00', 'AGV-007', 'AGV 配送车', 'Warning', '物料配送任务超时', 'Active'),
  ('2026-07-11 08:15:00', 'TEST-003', 'NVH 测试机', 'Info', '测试程序已升级', 'Resolved');

INSERT INTO device_assets
  (asset_code, name, type, model, location, status)
VALUES
  ('AST-EDU-001', '定子压装机', '装配设备', 'PRS-450', 'A线装配-工位 01', 'Running'),
  ('AST-EDU-002', '转子装配机', '装配设备', 'ROT-320', 'A线装配-工位 02', 'Running'),
  ('AST-EDU-003', '端盖锁附机', '装配设备', 'LCK-280', 'B线装配-工位 03', 'Standby'),
  ('AST-EDU-004', 'EOL 综合测试台', '测试设备', 'EOL-900', '总成测试线-工位 01', 'Running'),
  ('AST-EDU-005', '冷却液循环站', '公辅设备', 'CHW-75', '动力站房', 'Maintenance'),
  ('AST-EDU-006', '视觉检测站', '检测设备', 'VIS-6C', 'B线装配-工位 05', 'Alarm');
