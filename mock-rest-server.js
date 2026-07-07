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

// Endpoint: Workshop Energy (flashes dynamic consumption values for 10 workshops)
app.get('/energy', (req, res) => {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  const data = [
    { id: 1, timestamp: now, workshop_name: '1号智能注塑车间', electricity_kwh: Number(randBetween(1200, 1300).toFixed(2)), water_m3: Number(randBetween(40, 50).toFixed(2)), gas_m3: Number(randBetween(110, 130).toFixed(2)) },
    { id: 2, timestamp: now, workshop_name: '2号数字冲压车间', electricity_kwh: Number(randBetween(3400, 3600).toFixed(2)), water_m3: Number(randBetween(10, 15).toFixed(2)), gas_m3: 0.00 },
    { id: 3, timestamp: now, workshop_name: '3号绿色总装车间', electricity_kwh: Number(randBetween(800, 950).toFixed(2)), water_m3: Number(randBetween(80, 95).toFixed(2)), gas_m3: Number(randBetween(440, 480).toFixed(2)) },
    { id: 4, timestamp: now, workshop_name: '4号精密加工车间', electricity_kwh: Number(randBetween(1500, 1750).toFixed(2)), water_m3: Number(randBetween(25, 35).toFixed(2)), gas_m3: Number(randBetween(50, 70).toFixed(2)) },
    { id: 5, timestamp: now, workshop_name: '5号机器人焊装车间', electricity_kwh: Number(randBetween(2200, 2400).toFixed(2)), water_m3: Number(randBetween(5, 10).toFixed(2)), gas_m3: Number(randBetween(180, 220).toFixed(2)) },
    { id: 6, timestamp: now, workshop_name: '6号喷涂涂装车间', electricity_kwh: Number(randBetween(2800, 3100).toFixed(2)), water_m3: Number(randBetween(120, 150).toFixed(2)), gas_m3: Number(randBetween(800, 950).toFixed(2)) },
    { id: 7, timestamp: now, workshop_name: '7号智能立体仓储', electricity_kwh: Number(randBetween(300, 450).toFixed(2)), water_m3: Number(randBetween(2, 5).toFixed(2)), gas_m3: 0.00 },
    { id: 8, timestamp: now, workshop_name: '8号动力总成车间', electricity_kwh: Number(randBetween(1800, 2000).toFixed(2)), water_m3: Number(randBetween(15, 25).toFixed(2)), gas_m3: Number(randBetween(120, 160).toFixed(2)) },
    { id: 9, timestamp: now, workshop_name: '9号品质测试中心', electricity_kwh: Number(randBetween(500, 650).toFixed(2)), water_m3: Number(randBetween(12, 18).toFixed(2)), gas_m3: Number(randBetween(20, 40).toFixed(2)) },
    { id: 10, timestamp: now, workshop_name: '10号辅助动力站房', electricity_kwh: Number(randBetween(900, 1100).toFixed(2)), water_m3: Number(randBetween(60, 80).toFixed(2)), gas_m3: Number(randBetween(300, 350).toFixed(2)) }
  ];

  res.json(data);
});

// Endpoint: Device Alarms (adds dynamic status shifts)
app.get('/alarms', (req, res) => {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  const vibration = randBetween(10.5, 14.8).toFixed(1);
  const temp = randBetween(80.5, 92.4).toFixed(1);
  
  const data = [
    {
      id: 101,
      timestamp: now,
      device_id: 'DEV-MOLD-01',
      device_name: '1号智能注塑机',
      alarm_level: 'Warning',
      alarm_message: `模具核心温度过高 (${temp}°C)`,
      status: Math.random() > 0.3 ? 'Active' : 'Acknowledged'
    },
    {
      id: 102,
      timestamp: now,
      device_id: 'DEV-PUMP-04',
      device_name: '冷却水泵',
      alarm_level: 'Critical',
      alarm_message: `电机转速异常, 震动值超高 (${vibration}mm/s)`,
      status: 'Active'
    },
    {
      id: 103,
      timestamp: now,
      device_id: 'DEV-COMP-02',
      device_name: '空压机',
      alarm_level: 'Info',
      alarm_message: '系统气压已自动卸载',
      status: Math.random() > 0.5 ? 'Resolved' : 'Active'
    }
  ];

  res.json(data);
});

// Endpoint: Device Assets
app.get('/assets', (req, res) => {
  const data = [
    { id: 201, asset_code: 'REST-CNC-001', name: '数控精密车床', type: '加工设备', model: 'CNC-M50', location: '加工A区', status: 'Running' },
    { id: 202, asset_code: 'REST-ARM-002', name: '智能搬运机械手', type: '装配设备', model: 'ROB-K60', location: '总装B区', status: 'Running' },
    { id: 203, asset_code: 'REST-COMP-003', name: '主空气压缩机', type: '动力设备', model: 'AC-120KW', location: '动力站房', status: 'Running' },
    { id: 204, asset_code: 'REST-CHILL-004', name: '中央冷水机组', type: '制冷设备', model: 'CH-450', location: '辅机房', status: 'Standby' }
  ];
  res.json(data);
});

app.listen(port, () => {
  console.log(`Mock REST Telemetry Server running at http://localhost:${port}`);
});
