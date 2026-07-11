import express from 'express';

const app = express();
const port = 5000;

// Enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Dynamic values helper
const randBetween = (min, max) => Math.random() * (max - min) + min;

// ==========================================
// 1. Factory Core Metrics API (OEE, Uptime, FPY, MTBF, Cost)
// ==========================================
app.get('/factory/metrics', (req, res) => {
  const t = Date.now();
  const oee = Number((87.5 + Math.sin(t / 30000) * 0.8 + randBetween(-0.1, 0.1)).toFixed(1));
  const uptime = Number((99.4 + Math.sin(t / 60000) * 0.05 + randBetween(-0.02, 0.02)).toFixed(2));
  const fpy = Number((98.2 + Math.cos(t / 45000) * 0.15 + randBetween(-0.05, 0.05)).toFixed(1));
  const carbonSaving = Number((14.8 + Math.sin(t / 90000) * 0.5 + randBetween(-0.05, 0.05)).toFixed(1));
  
  // Fluctuate between 1 and 3 anomalies
  const activeAnomalies = 1 + (Math.floor(t / 12000) % 3);

  res.json([
    {
      id: 1,
      oee_percent: oee,
      uptime_percent: uptime,
      first_pass_yield: fpy,
      active_anomalies: activeAnomalies,
      mtbf_hours: 420, // Mean Time Between Failures
      mttr_minutes: 18.5, // Mean Time To Repair
      carbon_reduction_tons: carbonSaving,
      desc: "整厂运营效率综合指标"
    }
  ]);
});

// ==========================================
// 2. Production Progress API (Multiple Parallel Lines)
// ==========================================
app.get('/factory/production-progress', (req, res) => {
  const timeSec = Math.floor(Date.now() / 3500);

  // Line A Output
  const actualA = 680 + (timeSec % 120);
  const targetA = 800;
  const progressA = Number(((actualA / targetA) * 100).toFixed(1));

  // Line B Output
  const actualB = 520 + (timeSec % 80);
  const targetB = 600;
  const progressB = Number(((actualB / targetB) * 100).toFixed(1));

  // Battery PACK Line
  const actualPack = 120 + (timeSec % 30);
  const targetPack = 150;
  const progressPack = Number(((actualPack / targetPack) * 100).toFixed(1));

  res.json([
    {
      id: 1,
      task_name: "总装生产 A 线",
      progress_percent: progressA,
      actual_output: actualA,
      target_output: targetA,
      scrap_rate_percent: 0.35
    },
    {
      id: 2,
      task_name: "总装生产 B 线",
      progress_percent: progressB,
      actual_output: actualB,
      target_output: targetB,
      scrap_rate_percent: 0.42
    },
    {
      id: 3,
      task_name: "电池 PACK 装配线",
      progress_percent: progressPack,
      actual_output: actualPack,
      target_output: targetPack,
      scrap_rate_percent: 0.18
    }
  ]);
});

// ==========================================
// 3. Workshop OEE Ranking API (8 Workshops)
// ==========================================
app.get('/factory/workshop-oee', (req, res) => {
  const t = Date.now();
  res.json([
    { id: 1, workshop: "冲压车间", oee: Number((92.4 + Math.sin(t / 40000) * 0.3).toFixed(1)), availability: 98.2, quality: 99.4 },
    { id: 2, workshop: "焊装车间", oee: Number((89.8 + Math.cos(t / 35000) * 0.4).toFixed(1)), availability: 95.4, quality: 98.9 },
    { id: 3, workshop: "总装车间", oee: Number((88.6 + Math.sin(t / 50000) * 0.2).toFixed(1)), availability: 94.8, quality: 99.2 },
    { id: 4, workshop: "电池PACK", oee: Number((87.5 + Math.cos(t / 45000) * 0.5).toFixed(1)), availability: 96.1, quality: 99.6 },
    { id: 5, workshop: "电驱车间", oee: Number((86.1 + Math.sin(t / 42000) * 0.4).toFixed(1)), availability: 94.2, quality: 99.1 },
    { id: 6, workshop: "压铸车间", oee: Number((84.3 + Math.cos(t / 38000) * 0.6).toFixed(1)), availability: 91.8, quality: 98.2 },
    { id: 7, workshop: "涂装车间", oee: Number((81.5 + Math.sin(t / 30000) * 0.7).toFixed(1)), availability: 90.5, quality: 97.8 },
    { id: 8, workshop: "动力站房", oee: Number((94.2 + Math.cos(t / 60000) * 0.2).toFixed(1)), availability: 99.8, quality: 99.9 }
  ]);
});

// ==========================================
// 4. Energy Distribution & Utilities API (8 Industrial Areas)
// ==========================================
app.get('/factory/energy-distribution', (req, res) => {
  const climb = Math.floor((Date.now() / 4000) % 300);
  res.json([
    { id: 1, workshop: "涂装烘房及排风", kwh: 16240 + climb * 3, water_m3: 42.1, gas_m3: 1540 },
    { id: 2, workshop: "压铸高炉与合模", kwh: 14850 + climb * 2.8, water_m3: 38.6, gas_m3: 820 },
    { id: 3, workshop: "冲压大型伺服压机", kwh: 10120 + climb * 2, water_m3: 5.2, gas_m3: 0 },
    { id: 4, workshop: "焊装高频焊接机器人", kwh: 8350 + climb * 1.5, water_m3: 12.4, gas_m3: 150 },
    { id: 5, workshop: "电驱定转子加工线", kwh: 6420 + climb * 1.3, water_m3: 8.8, gas_m3: 0 },
    { id: 6, workshop: "电池PACK焊接与PACK测试", kwh: 5560 + climb * 1.1, water_m3: 4.1, gas_m3: 0 },
    { id: 7, workshop: "总装主输送线及拧紧", kwh: 4890 + climb * 0.8, water_m3: 14.5, gas_m3: 10 },
    { id: 8, workshop: "循环水泵及动力空压机", kwh: 9810 + climb * 1.8, water_m3: 94.2, gas_m3: 0 }
  ]);
});

// ==========================================
// 5. Hourly Production Trend API (24 Hours)
// ==========================================
app.get('/factory/production-trend', (req, res) => {
  const hours = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600000);
    const hourStr = d.toTimeString().substring(0, 5);
    
    // Pseudo-random but consistent past values based on date and time
    const daySeed = d.getDate() + d.getMonth() * 32;
    const hourSeed = d.getHours();
    
    // Normal distribution simulation
    const isPeakHour = (hourSeed >= 8 && hourSeed <= 12) || (hourSeed >= 13 && hourSeed <= 17);
    let baseCount = isPeakHour ? 135 : 105;
    let count = Math.floor(baseCount + ((daySeed * 9 + hourSeed * 17) % 20));
    
    if (i === 0) {
      count = Math.floor((now.getMinutes() / 60) * count) + 5;
    }
    
    hours.push({
      id: 24 - i,
      hour: hourStr,
      count: count
    });
  }
  res.json(hours);
});

// ==========================================
// 6. Equipment Vibration Telemetry API (10 Heavy Machinery Nodes)
// ==========================================
app.get('/factory/equipment-vibration', (req, res) => {
  const t = Date.now();
  
  // Calculate dynamic sensor signals with periodic noise
  const val = (base, speed, amp, jitter) => {
    return Number((base + Math.sin(t / speed) * amp + randBetween(-jitter, jitter)).toFixed(1));
  };

  res.json([
    { id: 1, device: "冲压主轴偏心轮M01", vibration: val(2.4, 4000, 0.2, 0.05), temp: val(45.2, 12000, 1.2, 0.2), current: val(124, 6000, 5, 1) },
    { id: 2, device: "焊装拼板搬运机械手R02", vibration: val(3.8, 5000, 0.3, 0.1), temp: val(38.6, 15000, 0.8, 0.1), current: val(42, 4000, 2, 0.5) },
    { id: 3, device: "涂装送风循环电机F03", vibration: val(1.2, 8000, 0.1, 0.02), temp: val(52.1, 20000, 1.5, 0.3), current: val(88, 8000, 3, 0.8) },
    { id: 4, device: "动力站房循环冷却泵P04", vibration: val(5.6, 3000, 0.8, 0.15), temp: val(64.8, 10000, 2.5, 0.4), current: val(186, 5000, 8, 1.5) },
    { id: 5, device: "总装合装定位电缸C05", vibration: val(1.8, 6000, 0.15, 0.05), temp: val(35.4, 18000, 0.5, 0.1), current: val(18, 3000, 1, 0.2) },
    { id: 6, device: "电池PACK电芯堆叠手R06", vibration: val(1.5, 4500, 0.2, 0.03), temp: val(36.2, 14000, 0.6, 0.1), current: val(28, 4500, 1.5, 0.3) },
    { id: 7, device: "压铸合模主增压油缸P07", vibration: val(4.2, 3500, 0.5, 0.1), temp: val(72.5, 9000, 3.2, 0.5), current: val(310, 3500, 12, 2.5) },
    { id: 8, device: "空压站 1#螺杆压缩机M08", vibration: val(2.1, 7000, 0.15, 0.04), temp: val(78.2, 11000, 1.8, 0.3), current: val(245, 7000, 6, 1) },
    { id: 9, device: "超声波线束焊接器W09", vibration: val(0.8, 2000, 0.1, 0.01), temp: val(32.4, 8000, 0.4, 0.05), current: val(12, 2000, 0.5, 0.1) },
    { id: 10, device: "废气焚烧旋转RTO-F10", vibration: val(2.9, 9000, 0.25, 0.05), temp: val(824.0, 30000, 12.0, 2.0), current: val(115, 9000, 4, 1) }
  ]);
});

// ==========================================
// 7. Equipment Alerts API (Alarm Stream with codes and metrics)
// ==========================================
// 7. Equipment Alerts API (Stateful Accumulative Alarm Stream)
// ==========================================
const ALARM_POOL = [
  { message: "动力站房 2# 循环水泵 P04 异常振动，超出安全临界值", level: "Critical", idCode: "E-1082" },
  { message: "压铸车间 3# 合模主油缸轴承温度偏高，接近黄色警戒上限", level: "Warning", idCode: "W-2041" },
  { message: "涂装车间 1# 面漆室第一温区温控传感器通信丢包率高", level: "Warning", idCode: "W-3142" },
  { message: "焊装车间拼装 A 线激光发射头保护套辅助气压偏低", level: "Warning", idCode: "W-4055" },
  { message: "智能立体库 A3 巷道 AGV-12 小车已成功对接自动充电轨道", level: "Info", idCode: "I-5011" },
  { message: "电驱车间定子压装机定位销气缸复位超时，装配工位动作暂停", level: "Critical", idCode: "E-8022" },
  { message: "电池 PACK 线拧紧枪 #08 扭矩偏离标准公差上限", level: "Warning", idCode: "W-6014" },
  { message: "冲压车间 1# 闭式压力机完成钢板冲切，切换模具中", level: "Info", idCode: "I-1020" },
  { message: "涂装废气旋转 RTO 蓄热室三向阀动作异常，执行安全排空程序", level: "Critical", idCode: "E-7080" },
  { message: "变电所 2# 无功补偿电容组切换完成，功率因数提升至 0.98", level: "Info", idCode: "I-9002" }
];

let alarmHistory = [
  { id: 1, message: "[11:15:00] [I-9001] 提示: GigaFactory 环保总排口废气挥发性有机物(VOCs)在线监测通过，瞬时浓度为 1.2mg/m³", level: "Info" },
  { id: 2, message: "[11:17:34] [W-4055] 警告: 焊装车间拼装 A 线激光发射头保护套辅助气压下降至 0.38 MPa (限值 0.40 MPa)", level: "Warning" },
  { id: 3, message: "[11:19:12] [E-1082] 严重: 动力站房 2# 循环水泵 P04 异常振动达到 6.4 mm/s，超出主轴安全临界线 (6.0 mm/s)", level: "Critical" }
];

let alarmIdCounter = 4;

// Periodically append new alarms in background (every 7 seconds)
setInterval(() => {
  // 60% chance to generate a new alarm every interval
  if (Math.random() > 0.4) {
    const template = ALARM_POOL[Math.floor(Math.random() * ALARM_POOL.length)];
    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 8);
    
    let detail = "";
    if (template.idCode === "E-1082") {
      detail = `达到 ${(5.8 + Math.random() * 1.5).toFixed(1)} mm/s，超出安全临界线 (6.0 mm/s)`;
    } else if (template.idCode === "W-2041") {
      detail = `(${(73.0 + Math.random() * 4).toFixed(1)} °C)，已接近黄色警戒上限 (75.0 °C)`;
    } else if (template.idCode === "W-3142") {
      detail = `(当前丢包率 ${(4.0 + Math.random() * 5).toFixed(1)}%)`;
    } else if (template.idCode === "W-6014") {
      detail = `(${(113 + Math.random() * 8).toFixed(1)} N.m, 标准公差 110 N.m)`;
    }

    const messageText = `[${timeStr}] [${template.idCode}] ${template.level === 'Critical' ? '严重' : template.level === 'Warning' ? '警告' : '提示'}: ${template.message} ${detail}`.trim();

    alarmHistory.unshift({
      id: alarmIdCounter++,
      message: messageText,
      level: template.level
    });

    // Keep history capped at 50 logs
    if (alarmHistory.length > 50) {
      alarmHistory.pop();
    }
  }
}, 7000);

app.get('/factory/alarms', (req, res) => {
  res.json(alarmHistory);
});

// Compatibility with old endpoints
app.get('/energy', (req, res) => {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  res.json([
    { id: 1, timestamp: now, workshop_name: '1号智能注塑车间', electricity_kwh: Number(randBetween(1200, 1300).toFixed(2)), water_m3: Number(randBetween(40, 50).toFixed(2)), gas_m3: Number(randBetween(110, 130).toFixed(2)) },
    { id: 2, timestamp: now, workshop_name: '2号数字冲压车间', electricity_kwh: Number(randBetween(3400, 3600).toFixed(2)), water_m3: Number(randBetween(10, 15).toFixed(2)), gas_m3: 0.00 }
  ]);
});

app.get('/alarms-old', (req, res) => {
  res.redirect('/alarms');
});

app.get('/assets', (req, res) => {
  res.json([
    { id: 201, asset_code: 'REST-CNC-001', name: '数控精密车床', type: '加工设备', model: 'CNC-M50', location: '加工A区', status: 'Running' },
    { id: 202, asset_code: 'REST-ARM-002', name: '智能搬运机械手', type: '装配设备', model: 'ROB-K60', location: '总装B区', status: 'Running' }
  ]);
});

app.listen(port, () => {
  console.log(`EV Factory Mock Telemetry Server running at http://localhost:${port}`);
});
