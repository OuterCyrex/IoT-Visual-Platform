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
('prj-ev-003', '厂务能源中心总览', '2D', '能源管理中心', '系统管理员', 'draft', '2026-07-11 10:00'),
('prj-pv-001', '智慧光伏发电拓扑集成管控大屏', '2D', '能源中心', '李工', 'published', '2026-07-12 10:22'),
('prj-pv-001-backup', '智慧光伏发电拓扑集成管控大屏-副本', '2D', '能源中心', '李工', 'published', '2026-07-12 10:22');

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
  '[{"id":"node-title","x":400,"y":15,"w":1760,"h":80,"component":"text","props":{"text":"智慧矿山管控平台"}},{"id":"node-time","x":50,"y":15,"w":380,"h":80,"component":"timeWeather","props":{"text":"系统时间与环境天气"}},{"id":"node-env-box","x":50,"y":120,"w":480,"h":260,"component":"borderBox","props":{"text":"矿山环境监测 (Environment)"}},{"id":"node-env-temp","x":75,"y":175,"w":200,"h":85,"component":"metricCard","props":{"text":"温度","yField":"29.8°C"}},{"id":"node-env-humidity","x":295,"y":175,"w":200,"h":85,"component":"metricCard","props":{"text":"湿度","yField":"40%"}},{"id":"node-env-co2","x":75,"y":275,"w":200,"h":85,"component":"metricCard","props":{"text":"CO2浓度","yField":"15 mg/m³"}},{"id":"node-env-wind","x":295,"y":275,"w":200,"h":85,"component":"metricCard","props":{"text":"井下风速","yField":"2.8 m/s"}},{"id":"node-safety-box","x":50,"y":410,"w":480,"h":300,"component":"borderBox","props":{"text":"安全监管与隐患排查"}},{"id":"node-safety-ring","x":75,"y":470,"w":200,"h":200,"component":"ringProgress","props":{"text":"本班安全率","yField":"75"}},{"id":"node-safety-status","x":295,"y":470,"w":200,"h":200,"component":"metricCard","props":{"text":"排查隐患 (正常率)","yField":"75%"}},{"id":"node-energy-line","x":50,"y":740,"w":480,"h":650,"component":"lineChart","props":{"text":"周动力用电负荷趋势 (kWh)","datasetId":"set-hourly-throughput","xField":"hour","yField":"count","refreshInterval":5000}},{"id":"dev-shaft","x":600,"y":150,"w":180,"h":200,"component":"mineDevice","props":{"text":"主/副竖井塔","deviceType":"shaft","status":"running"}},{"id":"dev-feeder-plate","x":800,"y":170,"w":160,"h":180,"component":"mineDevice","props":{"text":"选厂重型板式给料机","deviceType":"feeder_plate","status":"running"}},{"id":"dev-conveyor-1","x":980,"y":200,"w":220,"h":150,"component":"mineDevice","props":{"text":"1号原矿皮带机","deviceType":"conveyor_belt","status":"running","value":"62","unit":"m/s","transparentBg":true}},{"id":"dev-iron-remover","x":1030,"y":170,"w":140,"h":160,"component":"mineDevice","props":{"text":"悬挂电磁除铁器","deviceType":"iron_remover","status":"running","transparentBg":true}},{"id":"dev-crusher","x":1220,"y":150,"w":180,"h":180,"component":"mineDevice","props":{"text":"选厂重型颚式破碎机","deviceType":"crusher_jaw","status":"running"}},{"id":"dev-conveyor-2","x":1420,"y":180,"w":260,"h":140,"component":"mineDevice","props":{"text":"2号粗碎传送机","deviceType":"conveyor_belt_long","status":"running","value":"62","unit":"m/s","flipX":true,"transparentBg":true}},{"id":"dev-baghouse","x":1480,"y":80,"w":150,"h":170,"component":"mineDevice","props":{"text":"储料仓布袋除尘器","deviceType":"baghouse_filter","status":"running"}},{"id":"dev-buffer-silo","x":1700,"y":170,"w":180,"h":200,"component":"mineDevice","props":{"text":"圆锥给矿缓冲仓","deviceType":"silo_concrete","status":"running"}},{"id":"dev-conveyor-3","x":1460,"y":440,"w":240,"h":160,"component":"mineDevice","props":{"text":"3号筛分给矿机","deviceType":"conveyor_belt_wide","status":"running","value":"62","unit":"m/s","flipX":true,"transparentBg":true}},{"id":"dev-vibratory-sifter","x":1260,"y":410,"w":180,"h":180,"component":"mineDevice","props":{"text":"高频圆振动筛","deviceType":"sifter_vibratory","status":"running"}},{"id":"dev-conveyor-4","x":1020,"y":440,"w":220,"h":150,"component":"mineDevice","props":{"text":"4号成品传送机","deviceType":"conveyor_belt","status":"running","value":"62","unit":"m/s","flipX":true,"transparentBg":true}},{"id":"dev-silo-a","x":820,"y":410,"w":180,"h":200,"component":"mineDevice","props":{"text":"原煤成品仓 A","deviceType":"silo_metal","status":"running"}},{"id":"dev-silo-b","x":620,"y":410,"w":180,"h":200,"component":"mineDevice","props":{"text":"原煤成品仓 B","deviceType":"silo_metal","status":"running"}},{"id":"dev-dust-collector","x":580,"y":320,"w":140,"h":160,"component":"mineDevice","props":{"text":"点式除尘箱","deviceType":"dust_collector","status":"running"}},{"id":"node-alarms-table","x":560,"y":1060,"w":1440,"h":330,"component":"alertList","props":{"text":"井下有毒气体及瓦斯实时监测告警","datasetId":"set-active-alarms","xField":"message","yField":"level","refreshInterval":5000}},{"id":"node-control-box","x":2030,"y":120,"w":480,"h":260,"component":"borderBox","props":{"text":"通风/排水/防瓦斯系统状态"}},{"id":"node-control-grid","x":2060,"y":170,"w":420,"h":190,"component":"statusGrid","props":{"text":"集控系统运行状态","datasetId":"set-workshop-oee","xField":"workshop","yField":"oee","refreshInterval":5000}},{"id":"node-inspection-pie","x":2030,"y":410,"w":480,"h":300,"component":"pieChart","props":{"text":"日巡检计划达成率 (57%)","datasetId":"set-production-progress","xField":"task_name","yField":"progress_percent","refreshInterval":5000}},{"id":"node-tonnage-bar","x":2030,"y":740,"w":480,"h":650,"component":"chart","props":{"text":"分时装车矿石吞吐量 (t)","datasetId":"set-hourly-throughput","xField":"hour","yField":"count","refreshInterval":5000}}]',
  '2026-07-11 17:41'
),
(
  'scr-006',
  '智慧光伏发电拓扑集成管控大屏',
  '能源中心',
  '光伏站拓扑',
  '李工',
  'editing',
  'v1.0.0',
  '["光伏系统","等轴测","拓扑大屏"]',
  '[{"id":"node-title","x":300,"y":20,"w":1320,"h":60,"component":"text","props":{"text":"智慧光伏系统等轴测拓扑大屏"}},{"id":"dev-combiner-1","x":1370,"y":401,"w":96,"h":112,"component":"pvDevice","props":{"text":"#1 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-combiner-2","x":860,"y":151,"w":96,"h":112,"component":"pvDevice","props":{"text":"#2 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-combiner-3","x":1115,"y":276,"w":96,"h":112,"component":"pvDevice","props":{"text":"#3 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-1a","x":690,"y":46,"w":129,"h":145,"component":"pvDevice","props":{"text":"左区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-1b","x":745,"y":76,"w":129,"h":145,"component":"pvDevice","props":{"text":"左区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-1c","x":800,"y":106,"w":129,"h":145,"component":"pvDevice","props":{"text":"左区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-2a","x":945,"y":171,"w":129,"h":145,"component":"pvDevice","props":{"text":"中区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.6","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-2b","x":1000,"y":201,"w":129,"h":145,"component":"pvDevice","props":{"text":"中区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-2c","x":1055,"y":231,"w":129,"h":145,"component":"pvDevice","props":{"text":"中区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-3a","x":1200,"y":296,"w":129,"h":145,"component":"pvDevice","props":{"text":"右区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.2","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-3b","x":1255,"y":326,"w":129,"h":145,"component":"pvDevice","props":{"text":"右区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-3c","x":1310,"y":356,"w":129,"h":145,"component":"pvDevice","props":{"text":"右区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"node-z8iucxk3o","x":939,"y":450,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#3 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-62dtcz32c","x":684,"y":325,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#2 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-jc2fhi1ky","x":684,"y":325,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#2 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-5b6qu314m","x":514,"y":220,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-qf90zrl69","x":569,"y":250,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-g0ef7xmqp","x":624,"y":280,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-trjoscz3s","x":769,"y":345,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.6","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-slpyyuy18","x":824,"y":375,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-aiv6h116s","x":879,"y":405,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-e8hki4zrk","x":1024,"y":470,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.2","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-ou59zlswt","x":1079,"y":500,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-uxaypt149","x":1134,"y":530,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-wq818oqj7","x":1282,"y":488,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#1 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-9b97wcvgw","x":772,"y":238,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#2 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-cerm5gvmk","x":1027,"y":363,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#3 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-aqefnypvj","x":602,"y":133,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-g9zaht4i1","x":657,"y":163,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-x8lyyayxw","x":712,"y":193,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-okvkugz4r","x":857,"y":258,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.6","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-xe3iyp4w4","x":912,"y":288,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-8i0y9javb","x":967,"y":318,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-otrebwz1b","x":1112,"y":383,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.2","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-n3pp4xq9l","x":1167,"y":413,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-hdt85pjif","x":1222,"y":443,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-l9bftnm3d","x":870,"y":1118,"w":110,"h":114,"component":"mineDevice","locked":false,"props":{"text":"流光管道","deviceType":"pipeline","status":"running","value":"正常","unit":"","pipeShape":"elbow_l","pipeColor":"cyan","pipeStyle":"solid","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipY":true},"rotate":45},{"id":"node-d81kg69kv","x":598,"y":207,"w":358,"h":331,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-5rwea0tjx","x":902,"y":191,"w":37,"h":35,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-75fg0jk0f","x":852,"y":278,"w":33,"h":30,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-kqv4l8xg4","x":721,"y":365,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-wpts0xm4h","x":853,"y":332,"w":358,"h":331,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-gskan7907","x":1157,"y":316,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-lyhatvkgw","x":1107,"y":403,"w":33,"h":30,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-5y0jsi0ka","x":721,"y":365,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-36qc6hxam","x":1108,"y":457,"w":358,"h":331,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-pqv3b29vq","x":1412,"y":441,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-sk6swv6x2","x":1362,"y":528,"w":33,"h":30,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-23prluh5k","x":976,"y":490,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"e8b77457-e1d5-497f-bb1c-af0f96b6534d","component":"pvDevice","x":534,"y":465,"w":129,"h":146,"props":{"text":"#1 智能逆变器","deviceType":"inverter","status":"running","value":"254.5","unit":"kW","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"node-fqil729yn","x":789,"y":590,"w":129,"h":146,"component":"pvDevice","locked":false,"props":{"text":"#2 智能逆变器","deviceType":"inverter","status":"running","value":"254.5","unit":"kW","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"node-c936xhkhv","x":1044,"y":715,"w":129,"h":146,"component":"pvDevice","locked":false,"props":{"text":"#3 智能逆变器","deviceType":"inverter","status":"running","value":"254.5","unit":"kW","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"078396f9-01c8-46e8-8f2f-e08ddfcfdf2b","component":"pvDevice","x":637,"y":686,"w":197,"h":205,"props":{"text":"箱式变压器","deviceType":"box_transformer","status":"running","value":"10.5","unit":"kV","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"node-r2q8skme7","x":598,"y":611,"w":79,"h":135,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-f5olzbj7v","x":817,"y":736,"w":36,"h":30,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-c5x67h2ut","x":817,"y":766,"w":291,"h":95,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_up","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-1oeom7swb","x":598,"y":611,"w":79,"h":135,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-xsm8l6rev","x":817,"y":766,"w":291,"h":95,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_up","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"981c23ea-4ee9-4739-a8b6-d28e5547ca8c","component":"pvDevice","x":244,"y":712,"w":328,"h":381,"props":{"text":"并网高压电塔","deviceType":"transmission_tower","status":"running","value":"110","unit":"kV","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0}},{"id":"node-pmwtyg383","x":444,"y":862,"w":223,"h":4,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_up","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}}]',
  '2026-07-12 10:30'
),
(
  'scr-006-backup',
  '智慧光伏发电拓扑集成管控大屏-副本',
  '能源中心',
  '光伏站拓扑',
  '李工',
  'editing',
  'v1.0.0',
  '["光伏系统","等轴测","拓扑大屏"]',
  '[{"id":"node-title","x":299,"y":0,"w":1320,"h":60,"component":"text","props":{"text":"智慧光伏系统等轴测拓扑大屏"}},{"id":"dev-combiner-1","x":1374,"y":393,"w":96,"h":112,"component":"pvDevice","props":{"text":"#1 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-combiner-2","x":858,"y":156,"w":96,"h":112,"component":"pvDevice","props":{"text":"#2 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-combiner-3","x":1110,"y":274,"w":96,"h":112,"component":"pvDevice","props":{"text":"#3 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-1a","x":690,"y":46,"w":129,"h":145,"component":"pvDevice","props":{"text":"左区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-1b","x":744,"y":75,"w":129,"h":145,"component":"pvDevice","props":{"text":"左区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-1c","x":799,"y":105,"w":129,"h":145,"component":"pvDevice","props":{"text":"左区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-2a","x":941,"y":175,"w":129,"h":145,"component":"pvDevice","props":{"text":"中区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.6","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-2b","x":1051,"y":233,"w":129,"h":145,"component":"pvDevice","props":{"text":"中区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-2c","x":995,"y":204,"w":129,"h":145,"component":"pvDevice","props":{"text":"中区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-3a","x":1200,"y":297,"w":129,"h":145,"component":"pvDevice","props":{"text":"右区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.2","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-3b","x":1312,"y":355,"w":125,"h":145,"component":"pvDevice","props":{"text":"右区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-3c","x":1256,"y":327,"w":129,"h":145,"component":"pvDevice","props":{"text":"右区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"node-z8iucxk3o","x":1198,"y":567,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#1 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-62dtcz32c","x":683,"y":328,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#2 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-jc2fhi1ky","x":934,"y":447,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#3 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-5b6qu314m","x":515,"y":220,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-qf90zrl69","x":569,"y":248,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-g0ef7xmqp","x":624,"y":277,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-trjoscz3s","x":766,"y":348,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.6","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-slpyyuy18","x":876,"y":407,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-aiv6h116s","x":821,"y":377,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-e8hki4zrk","x":1025,"y":471,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.2","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-ou59zlswt","x":1137,"y":529,"w":125,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-uxaypt149","x":1081,"y":499,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-wq818oqj7","x":1306,"y":484,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#1 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-9b97wcvgw","x":790,"y":247,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#2 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-cerm5gvmk","x":1041,"y":366,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#3 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-aqefnypvj","x":622,"y":136,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-g9zaht4i1","x":677,"y":166,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-x8lyyayxw","x":731,"y":196,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-okvkugz4r","x":873,"y":266,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.6","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-xe3iyp4w4","x":984,"y":324,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-8i0y9javb","x":929,"y":295,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-otrebwz1b","x":1133,"y":389,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.2","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-n3pp4xq9l","x":1245,"y":448,"w":125,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-hdt85pjif","x":1188,"y":417,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-l9bftnm3d","x":870,"y":1118,"w":110,"h":114,"component":"mineDevice","locked":false,"props":{"text":"流光管道","deviceType":"pipeline","status":"running","value":"正常","unit":"","pipeShape":"elbow_l","pipeColor":"cyan","pipeStyle":"solid","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipY":true},"rotate":45},{"id":"node-d81kg69kv","x":589,"y":193,"w":372,"h":369,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-5rwea0tjx","x":907,"y":194,"w":33,"h":30,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-75fg0jk0f","x":829,"y":281,"w":33,"h":30,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-kqv4l8xg4","x":727,"y":369,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-wpts0xm4h","x":880,"y":307,"w":334,"h":386,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-gskan7907","x":1152,"y":310,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-lyhatvkgw","x":1081,"y":403,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-5y0jsi0ka","x":979,"y":491,"w":44,"h":41,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-36qc6hxam","x":1124,"y":439,"w":353,"h":352,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-pqv3b29vq","x":1417,"y":436,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-sk6swv6x2","x":1345,"y":521,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-23prluh5k","x":1241,"y":610,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"e8b77457-e1d5-497f-bb1c-af0f96b6534d","component":"pvDevice","x":537,"y":468,"w":129,"h":146,"props":{"text":"智能逆变器","deviceType":"inverter","status":"running","value":"254.5","unit":"kW","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"node-fqil729yn","x":832,"y":595,"w":129,"h":146,"component":"pvDevice","locked":false,"props":{"text":"智能逆变器","deviceType":"inverter","status":"running","value":"254.5","unit":"kW","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"node-c936xhkhv","x":1072,"y":692,"w":129,"h":146,"component":"pvDevice","locked":false,"props":{"text":"智能逆变器","deviceType":"inverter","status":"running","value":"254.5","unit":"kW","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"078396f9-01c8-46e8-8f2f-e08ddfcfdf2b","component":"pvDevice","x":637,"y":686,"w":197,"h":205,"props":{"text":"箱式变压器","deviceType":"box_transformer","status":"running","value":"10.5","unit":"kV","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"node-r2q8skme7","x":508,"y":546,"w":92,"h":80,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-f5olzbj7v","x":771,"y":674,"w":129,"h":112,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-c5x67h2ut","x":979,"y":773,"w":158,"h":138,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-1oeom7swb","x":505,"y":603,"w":209,"h":156,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-xsm8l6rev","x":772,"y":776,"w":238,"h":141,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"981c23ea-4ee9-4739-a8b6-d28e5547ca8c","component":"pvDevice","x":244,"y":712,"w":328,"h":381,"props":{"text":"并网高压电塔","deviceType":"transmission_tower","status":"running","value":"110","unit":"kV","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0}},{"id":"node-pmwtyg383","x":442,"y":778,"w":290,"h":177,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_up","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}}]',
  '2026-07-12 10:22'
),
(
  'scr-c132w2',
  '智慧光伏发电拓扑集成管控大屏-副本',
  '能源中心',
  '光伏站拓扑',
  '李工',
  'editing',
  '未发布',
  '["光伏系统","等轴测","拓扑大屏"]',
  '[{"id":"node-title","x":299,"y":0,"w":1320,"h":60,"component":"text","props":{"text":"智慧光伏系统等轴测拓扑大屏"}},{"id":"dev-combiner-1","x":1374,"y":393,"w":96,"h":112,"component":"pvDevice","props":{"text":"#1 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-combiner-2","x":858,"y":156,"w":96,"h":112,"component":"pvDevice","props":{"text":"#2 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-combiner-3","x":1110,"y":274,"w":96,"h":112,"component":"pvDevice","props":{"text":"#3 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-1a","x":690,"y":46,"w":129,"h":145,"component":"pvDevice","props":{"text":"左区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-1b","x":744,"y":75,"w":129,"h":145,"component":"pvDevice","props":{"text":"左区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-1c","x":799,"y":105,"w":129,"h":145,"component":"pvDevice","props":{"text":"左区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-2a","x":941,"y":175,"w":129,"h":145,"component":"pvDevice","props":{"text":"中区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.6","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-2b","x":1051,"y":233,"w":129,"h":145,"component":"pvDevice","props":{"text":"中区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-2c","x":995,"y":204,"w":129,"h":145,"component":"pvDevice","props":{"text":"中区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-3a","x":1200,"y":297,"w":129,"h":145,"component":"pvDevice","props":{"text":"右区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.2","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-3b","x":1312,"y":355,"w":125,"h":145,"component":"pvDevice","props":{"text":"右区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"dev-panel-3c","x":1256,"y":327,"w":129,"h":145,"component":"pvDevice","props":{"text":"右区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-3zzwub1kz","locked":true},{"id":"node-z8iucxk3o","x":1198,"y":567,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#1 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-62dtcz32c","x":683,"y":328,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#2 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-jc2fhi1ky","x":934,"y":447,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#3 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-5b6qu314m","x":515,"y":220,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-qf90zrl69","x":569,"y":248,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-g0ef7xmqp","x":624,"y":277,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-trjoscz3s","x":766,"y":348,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.6","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-slpyyuy18","x":876,"y":407,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-aiv6h116s","x":821,"y":377,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-e8hki4zrk","x":1025,"y":471,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.2","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-ou59zlswt","x":1137,"y":529,"w":125,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-uxaypt149","x":1081,"y":499,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-brupndjmm"},{"id":"node-wq818oqj7","x":1306,"y":484,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#1 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-9b97wcvgw","x":790,"y":247,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#2 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-cerm5gvmk","x":1041,"y":366,"w":96,"h":112,"component":"pvDevice","locked":true,"props":{"text":"#3 智能汇流箱","deviceType":"combiner_box","status":"running","value":"180","unit":"A","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-aqefnypvj","x":622,"y":136,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-g9zaht4i1","x":677,"y":166,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-x8lyyayxw","x":731,"y":196,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"左区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-okvkugz4r","x":873,"y":266,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.6","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-xe3iyp4w4","x":984,"y":324,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-8i0y9javb","x":929,"y":295,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"中区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.5","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-otrebwz1b","x":1133,"y":389,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-01 光伏组串","deviceType":"pv_panel","status":"running","value":"8.2","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-n3pp4xq9l","x":1245,"y":448,"w":125,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-02 光伏组串","deviceType":"pv_panel","status":"running","value":"8.4","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-hdt85pjif","x":1188,"y":417,"w":129,"h":145,"component":"pvDevice","locked":true,"props":{"text":"右区-03 光伏组串","deviceType":"pv_panel","status":"running","value":"8.3","unit":"kW","transparentBg":true},"groupId":"group-caly2a4av"},{"id":"node-l9bftnm3d","x":870,"y":1118,"w":110,"h":114,"component":"mineDevice","locked":false,"props":{"text":"流光管道","deviceType":"pipeline","status":"running","value":"正常","unit":"","pipeShape":"elbow_l","pipeColor":"cyan","pipeStyle":"solid","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipY":true},"rotate":45},{"id":"node-d81kg69kv","x":589,"y":193,"w":372,"h":369,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-5rwea0tjx","x":907,"y":194,"w":33,"h":30,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-75fg0jk0f","x":829,"y":281,"w":33,"h":30,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-kqv4l8xg4","x":727,"y":369,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-wpts0xm4h","x":885,"y":319,"w":346,"h":371,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-gskan7907","x":1154,"y":312,"w":56,"h":44,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-lyhatvkgw","x":1081,"y":403,"w":47,"h":40,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-5y0jsi0ka","x":979,"y":491,"w":60,"h":50,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-36qc6hxam","x":1128,"y":438,"w":353,"h":352,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-pqv3b29vq","x":1417,"y":436,"w":43,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-sk6swv6x2","x":1345,"y":521,"w":37,"h":35,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-23prluh5k","x":1241,"y":610,"w":39,"h":38,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"e8b77457-e1d5-497f-bb1c-af0f96b6534d","component":"pvDevice","x":537,"y":468,"w":129,"h":146,"props":{"text":"智能逆变器","deviceType":"inverter","status":"running","value":"254.5","unit":"kW","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"node-fqil729yn","x":832,"y":595,"w":129,"h":146,"component":"pvDevice","locked":false,"props":{"text":"智能逆变器","deviceType":"inverter","status":"running","value":"254.5","unit":"kW","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"node-c936xhkhv","x":1072,"y":692,"w":129,"h":146,"component":"pvDevice","locked":false,"props":{"text":"智能逆变器","deviceType":"inverter","status":"running","value":"254.5","unit":"kW","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"078396f9-01c8-46e8-8f2f-e08ddfcfdf2b","component":"pvDevice","x":647,"y":691,"w":197,"h":205,"props":{"text":"箱式变压器","deviceType":"box_transformer","status":"running","value":"10.5","unit":"kV","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0,"flipX":true}},{"id":"node-f5olzbj7v","x":774,"y":663,"w":139,"h":126,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-c5x67h2ut","x":976,"y":772,"w":161,"h":142,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-1oeom7swb","x":505,"y":603,"w":209,"h":156,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-xsm8l6rev","x":772,"y":776,"w":238,"h":141,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"981c23ea-4ee9-4739-a8b6-d28e5547ca8c","component":"pvDevice","x":244,"y":712,"w":328,"h":381,"props":{"text":"并网高压电塔","deviceType":"transmission_tower","status":"running","value":"110","unit":"kV","transparentBg":true,"datasetId":"","xField":"","yField":"","refreshInterval":0}},{"id":"node-pmwtyg383","x":442,"y":778,"w":290,"h":177,"component":"mineDevice","props":{"deviceType":"pipeline","pipeShape":"slope_up","pipeColor":"cyan","pipeStyle":"solid","flipX":false,"transparentBg":true}},{"id":"node-tvpuzcbhn","x":514,"y":528,"w":106,"h":102,"component":"mineDevice","locked":false,"props":{"deviceType":"pipeline","pipeShape":"slope_down","pipeColor":"cyan","pipeStyle":"solid","flipX":true,"transparentBg":true}},{"id":"node-left-box-1","x":40,"y":120,"w":420,"h":320,"component":"borderBox","props":{"text":"发电信息"}},{"id":"node-metric-daily-gen","x":60,"y":175,"w":180,"h":110,"component":"metricCard","datasetId":"set-pv-telemetry","xField":"电量占比 100%","yField":"daily_effective_gen","props":{"text":"当日有效发电量 (MWh)","datasetId":"set-pv-telemetry","xField":"电量占比 100%","yField":"daily_effective_gen"}},{"id":"node-metric-daily-grid","x":260,"y":175,"w":180,"h":110,"component":"metricCard","datasetId":"set-pv-telemetry","xField":"上网率 96.5%","yField":"daily_grid_gen","props":{"text":"当日上网电量 (MWh)","datasetId":"set-pv-telemetry","xField":"上网率 96.5%","yField":"daily_grid_gen"}},{"id":"node-metric-inv-power","x":60,"y":300,"w":180,"h":110,"component":"metricCard","datasetId":"set-pv-telemetry","xField":"运行正常","yField":"inverter_total_power","props":{"text":"逆变器总功率 (MW)","datasetId":"set-pv-telemetry","xField":"运行正常","yField":"inverter_total_power"}},{"id":"node-metric-out-power","x":260,"y":300,"w":180,"h":110,"component":"metricCard","datasetId":"set-pv-telemetry","xField":"并网成功","yField":"output_total_power","props":{"text":"输出总功率 (MW)","datasetId":"set-pv-telemetry","xField":"并网成功","yField":"output_total_power"}},{"id":"node-left-chart-radiation","x":40,"y":460,"w":420,"h":260,"component":"lineChart","datasetId":"set-pv-curves","xField":"time_label","yField":"power","props":{"text":"发电功率与辐射度趋势","datasetId":"set-pv-curves","xField":"time_label","yField":"power"}},{"id":"node-left-chart-monthly","x":40,"y":740,"w":420,"h":280,"component":"chart","datasetId":"set-pv-monthly","xField":"month_label","yField":"generation","props":{"text":"月度发电量柱状图 (MWh)","datasetId":"set-pv-monthly","xField":"month_label","yField":"generation"}},{"id":"node-right-box-1","x":1460,"y":120,"w":420,"h":320,"component":"borderBox","props":{"text":"环境数据"}},{"id":"node-metric-env-rad","x":1485,"y":175,"w":175,"h":55,"component":"metricCard","datasetId":"set-pv-telemetry","xField":"太阳辐射","yField":"irradiance","props":{"text":"辐射度 (W/m²)","datasetId":"set-pv-telemetry","xField":"太阳辐射强度","yField":"irradiance","compact":true}},{"id":"node-metric-env-temp","x":1680,"y":175,"w":175,"h":55,"component":"metricCard","datasetId":"set-pv-telemetry","xField":"环境温度","yField":"temperature","props":{"text":"环境温度 (°C)","datasetId":"set-pv-telemetry","xField":"空气温度","yField":"temperature","compact":true}},{"id":"node-metric-env-wind","x":1485,"y":245,"w":175,"h":55,"component":"metricCard","datasetId":"set-pv-telemetry","xField":"风速风向","yField":"wind_speed","props":{"text":"风速 (m/s)","datasetId":"set-pv-telemetry","xField":"现场风速","yField":"wind_speed","compact":true}},{"id":"node-metric-env-humid","x":1680,"y":245,"w":175,"h":55,"component":"metricCard","datasetId":"set-pv-telemetry","xField":"环境湿度","yField":"humidity","props":{"text":"环境湿度 (%)","datasetId":"set-pv-telemetry","xField":"相对湿度","yField":"humidity","compact":true}},{"id":"node-metric-env-modtemp","x":1485,"y":315,"w":175,"h":55,"component":"metricCard","datasetId":"set-pv-telemetry","xField":"组件背板温度","yField":"module_temp","props":{"text":"组件温度 (°C)","datasetId":"set-pv-telemetry","xField":"电池背板温度","yField":"module_temp","compact":true}},{"id":"node-metric-env-invtemp","x":1680,"y":315,"w":175,"h":55,"component":"metricCard","datasetId":"set-pv-telemetry","xField":"逆变器机壳温度","yField":"inverter_temp","props":{"text":"逆变器温度 (°C)","datasetId":"set-pv-telemetry","xField":"模块机壳温度","yField":"inverter_temp","compact":true}},{"id":"node-right-chart-current","x":1460,"y":460,"w":420,"h":260,"component":"lineChart","datasetId":"set-pv-curves","xField":"time_label","yField":"current","props":{"text":"光伏组件电流曲线 (A)","datasetId":"set-pv-curves","xField":"time_label","yField":"current"}},{"id":"node-right-chart-voltage","x":1460,"y":740,"w":420,"h":280,"component":"lineChart","datasetId":"set-pv-curves","xField":"time_label","yField":"voltage","props":{"text":"光伏组件电压曲线 (V)","datasetId":"set-pv-curves","xField":"time_label","yField":"voltage"}}]',
  '2026-07-12 10:50'
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


CREATE TABLE IF NOT EXISTS pv_telemetry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  daily_effective_gen DECIMAL(10, 2) NOT NULL,
  daily_grid_gen DECIMAL(10, 2) NOT NULL,
  inverter_total_power DECIMAL(10, 2) NOT NULL,
  output_total_power DECIMAL(10, 2) NOT NULL,
  irradiance DECIMAL(10, 2) NOT NULL,
  temperature DECIMAL(10, 2) NOT NULL,
  wind_speed DECIMAL(10, 2) NOT NULL,
  humidity DECIMAL(10, 2) NOT NULL,
  module_temp DECIMAL(10, 2) NOT NULL,
  inverter_temp DECIMAL(10, 2) NOT NULL
);

INSERT INTO pv_telemetry (timestamp, daily_effective_gen, daily_grid_gen, inverter_total_power, output_total_power, irradiance, temperature, wind_speed, humidity, module_temp, inverter_temp) VALUES
(NOW(), 385.60, 372.40, 24.50, 23.80, 850.00, 28.50, 3.20, 45.00, 42.00, 55.00);

CREATE TABLE IF NOT EXISTS pv_monthly_generation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month_label VARCHAR(16) NOT NULL,
  generation DECIMAL(10, 2) NOT NULL
);

INSERT INTO pv_monthly_generation (month_label, generation) VALUES
('1月', 120.5), ('2月', 135.2), ('3月', 158.0), ('4月', 182.4), ('5月', 210.0), ('6月', 245.8), ('7月', 280.0);

CREATE TABLE IF NOT EXISTS pv_curves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  time_label VARCHAR(16) NOT NULL,
  power DECIMAL(10, 2) NOT NULL,
  radiation DECIMAL(10, 2) NOT NULL,
  current DECIMAL(10, 2) NOT NULL,
  voltage DECIMAL(10, 2) NOT NULL
);

INSERT INTO pv_curves (time_label, power, radiation, current, voltage) VALUES
('06:00', 0.0, 50, 0.0, 300),
('08:00', 5.2, 200, 15.4, 340),
('10:00', 15.4, 550, 42.1, 365),
('12:00', 24.5, 850, 68.5, 380),
('14:00', 22.8, 780, 62.2, 375),
('16:00', 12.1, 400, 35.8, 350),
('18:00', 1.5, 100, 4.2, 310);

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
