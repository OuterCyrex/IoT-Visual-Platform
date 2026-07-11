<template>
  <div class="min-h-screen bg-slate-950 p-6 flex flex-col gap-6 text-slate-100">
    <!-- Top Premium Header Banner -->
    <div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
      <div>
        <div class="flex items-center gap-2">
          <el-icon class="text-cyan-400 text-lg"><Promotion /></el-icon>
          <h1 class="text-lg font-bold text-slate-100 tracking-tight">MQTT 实时仿真沙箱</h1>
        </div>
        <p class="text-xs text-slate-400 mt-1">用于物理传感器及网关的发布订阅数据联调试验 (WebSocket Client)</p>
      </div>
      <el-button
        type="info"
        plain
        class="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white"
        @click="goBack"
      >
        返回工作台
      </el-button>
    </div>

    <!-- Main Grid -->
    <div class="grid gap-6 lg:grid-cols-2 flex-1">
    <!-- Left Form Panel -->
    <el-card shadow="never" class="bg-slate-900 border-slate-800 text-slate-100">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium text-cyan-400">MQTT 发送控制台</span>
          <el-tag :type="connected ? 'success' : 'danger'" effect="dark">
            {{ connected ? '已连接 Broker' : '未连接' }}
          </el-tag>
        </div>
      </template>

      <el-form label-position="top">
        <!-- Select Existing Data Source -->
        <el-form-item label="快捷选择 MQTT 数据源">
          <el-select
            v-model="selectedSourceId"
            placeholder="选择已配置的数据源自动填充"
            class="w-full select-dark"
            clearable
            @change="handleSourceSelect"
          >
            <el-option
              v-for="source in mqttSources"
              :key="source.id"
              :label="`${source.name} (${source.host})`"
              :value="source.id"
            />
          </el-select>
        </el-form-item>

        <!-- Host and Topic Inputs -->
        <div class="grid gap-4 md:grid-cols-2">
          <el-form-item label="Broker WebSocket 地址">
            <el-input
              v-model="brokerHost"
              placeholder="ws://broker.emqx.io:8083/mqtt"
              @change="disconnectClient"
            />
          </el-form-item>
          <el-form-item label="发布主题 (Topic)">
            <el-input v-model="publishTopic" placeholder="factory/telemetry/test" />
          </el-form-item>
        </div>

        <el-divider class="border-slate-800" />

        <!-- Payload Editor -->
        <el-form-item label="消息内容 (JSON Payload)">
          <el-input
            v-model="payloadText"
            type="textarea"
            :rows="6"
            placeholder="请输入要发布的消息JSON..."
            class="font-mono text-xs dark-textarea"
          />
        </el-form-item>

        <div class="flex flex-col gap-4 mt-6">
          <div class="flex gap-4">
            <el-button
              type="primary"
              class="flex-1 bg-cyan-600 border-cyan-500 hover:bg-cyan-500 text-white"
              :disabled="!brokerHost || !publishTopic"
              @click="publishSingle"
            >
              手动发布单次消息
            </el-button>
            <el-button
              v-if="!connected"
              type="info"
              plain
              class="border-slate-700 hover:bg-slate-800 text-slate-300"
              @click="connectClient"
            >
              连接服务器
            </el-button>
            <el-button
              v-else
              type="danger"
              plain
              @click="disconnectClient"
            >
              断开连接
            </el-button>
          </div>

          <!-- Simulation Section -->
          <div class="flex items-center justify-between p-4 bg-slate-950/60 rounded-lg border border-slate-800">
            <div>
              <div class="text-sm font-medium text-slate-200">自动模拟遥测流</div>
              <div class="text-xs text-slate-400">开启后，系统每 2 秒将自动发送包含变化的随机传感器报文包。</div>
            </div>
            <el-switch
              v-model="simulationActive"
              active-color="#06b6d4"
              inactive-color="#334155"
              @change="toggleSimulation"
            />
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- Right Console Log Panel -->
    <el-card shadow="never" class="bg-slate-950 border-slate-800 text-slate-200 flex flex-col h-[580px]">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium text-slate-400 font-mono">Terminal Outputs</span>
          <el-button size="small" type="info" plain class="border-slate-800 text-slate-400" @click="clearLogs">
            清空日志
          </el-button>
        </div>
      </template>

      <div ref="terminalRef" class="flex-1 overflow-y-auto font-mono text-xs space-y-2 p-2 scrollbar-thin">
        <div v-if="logs.length === 0" class="text-slate-600 text-center py-10 select-none">
          -- 暂无输出，请点击发布或连接 --
        </div>
        <div v-for="log in logs" :key="log.id" :class="getLogClass(log.type)" class="leading-relaxed">
          <span class="text-slate-500">[{{ log.time }}]</span>
          <span class="ml-1 font-bold">[{{ log.type.toUpperCase() }}]</span>
          <span class="ml-2 break-all">{{ log.message }}</span>
        </div>
      </div>
    </el-card>
  </div>
</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Promotion } from '@element-plus/icons-vue'
import mqtt, { type MqttClient } from 'mqtt'
import request from '../../utils/request'
import type { DataSource, Dataset } from '../../types/platform'

interface LogEntry {
  id: number
  time: string
  type: 'info' | 'success' | 'send' | 'error'
  message: string
}

const router = useRouter()

function goBack() {
  router.push('/overview')
}

const loading = ref(false)
const dataSources = ref<DataSource[]>([])
const datasets = ref<Dataset[]>([])

const selectedSourceId = ref('')
const brokerHost = ref('ws://broker.emqx.io:8083/mqtt')
const publishTopic = ref('factory/telemetry/erasernoob')
const payloadText = ref(JSON.stringify({
  value: 75.2,
  temperature: 58.4,
  status: "normal"
}, null, 2))

const connected = ref(false)
const logs = ref<LogEntry[]>([])
const terminalRef = ref<HTMLDivElement | null>(null)

let mqttClient: MqttClient | null = null
const simulationActive = ref(false)
let simulationInterval: ReturnType<typeof setInterval> | null = null

// Filter Data Sources to MQTT only
const mqttSources = computed(() => dataSources.value.filter(ds => ds.type === 'MQTT'))

function toWsUrl(hostStr: string) {
  if (hostStr.startsWith('ws://') || hostStr.startsWith('wss://')) {
    return hostStr
  }
  const cleanHost = hostStr.replace('http://', '').replace('https://', '')
  const [ip, portText] = cleanHost.split(':')
  let port = '8083'
  if (portText) {
    if (portText === '1883') port = '8083'
    else if (portText === '8883') port = '8084'
    else port = portText
  }
  return `ws://${ip}:${port}/mqtt`
}

function addLog(type: LogEntry['type'], message: string) {
  const time = new Date().toTimeString().substring(0, 8)
  logs.value.push({ id: Date.now() + Math.random(), time, type, message })
  
  // Keep logs under 100 entries to prevent memory leak
  if (logs.value.length > 100) {
    logs.value.shift()
  }

  // Scroll to bottom
  setTimeout(() => {
    if (terminalRef.value) {
      terminalRef.value.scrollTop = terminalRef.value.scrollHeight
    }
  }, 50)
}

function clearLogs() {
  logs.value = []
}

function getLogClass(type: LogEntry['type']) {
  if (type === 'success') return 'text-emerald-400'
  if (type === 'send') return 'text-cyan-400'
  if (type === 'error') return 'text-rose-400'
  return 'text-slate-300'
}

// Fetch all saved Data Sources and Datasets
async function fetchData() {
  try {
    const dsRes: any = await request.get('/api/dataSources')
    dataSources.value = dsRes.items ?? []

    const setRes: any = await request.get('/api/datasets')
    datasets.value = setRes.items ?? []
  } catch (err) {
    console.error(err)
    addLog('error', '加载系统数据源和数据集失败')
  }
}

// Triggered when user selects a saved data source
function handleSourceSelect(sourceId: string) {
  const source = dataSources.value.find(s => s.id === sourceId)
  if (source) {
    brokerHost.value = toWsUrl(source.host)
    // Find the first dataset that references this source to autofill topic
    const dataset = datasets.value.find(d => d.dataSourceId === sourceId)
    if (dataset) {
      publishTopic.value = dataset.tableName
    } else {
      publishTopic.value = 'factory/telemetry/test'
    }
    addLog('info', `已选择数据源: "${source.name}"，地址与频道已自动填充。`)
    disconnectClient()
  }
}

// Connect client
function connectClient(): Promise<MqttClient> {
  return new Promise((resolve, reject) => {
    if (mqttClient) {
      resolve(mqttClient)
      return
    }

    const wsUrl = toWsUrl(brokerHost.value)
    addLog('info', `正在连接 MQTT Broker: ${wsUrl}...`)

    try {
      const client = mqtt.connect(wsUrl, {
        connectTimeout: 5000,
        clientId: `ag_sim_${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
      })

      client.on('connect', () => {
        connected.value = true
        addLog('success', '连接成功，通道已就绪。')
        resolve(client)
      })

      client.on('error', (err) => {
        addLog('error', `连接出错: ${err.message}`)
        disconnectClient()
        reject(err)
      })

      client.on('close', () => {
        connected.value = false
      })

      mqttClient = client
    } catch (err: any) {
      addLog('error', `初始化连接失败: ${err.message || err}`)
      reject(err)
    }
  })
}

// Disconnect client
function disconnectClient() {
  if (mqttClient) {
    mqttClient.end(true)
    mqttClient = null
    connected.value = false
    addLog('info', 'MQTT 连接已断开。')
  }
  if (simulationActive.value) {
    simulationActive.value = false
    toggleSimulation(false)
  }
}

// Manual Publish
async function publishSingle() {
  try {
    let payloadParsed
    try {
      payloadParsed = JSON.parse(payloadText.value)
    } catch (err) {
      addLog('error', 'Payload 解析失败: 请输入正确的 JSON 格式字符串！')
      return
    }

    const client = await connectClient()
    const finalPayload = {
      ...payloadParsed,
      timestamp: new Date().toTimeString().substring(0, 8)
    }

    client.publish(publishTopic.value, JSON.stringify(finalPayload), { qos: 0 }, (err) => {
      if (err) {
        addLog('error', `发送失败: ${err.message}`)
      } else {
        addLog('send', `[Topic: ${publishTopic.value}] -> ${JSON.stringify(finalPayload)}`)
      }
    })
  } catch (err: any) {
    addLog('error', `发送消息发生异常: ${err.message || err}`)
  }
}

// Auto Simulation Toggle
async function toggleSimulation(active: boolean) {
  if (active) {
    try {
      const client = await connectClient()
      addLog('info', '自动模拟遥测流已启动，每 2 秒发送一次数据包。')
      
      let baseValue = 75.0
      simulationInterval = setInterval(() => {
        // Fluctuating values
        baseValue += (Math.random() - 0.5) * 6
        if (baseValue < 40) baseValue = 50
        if (baseValue > 110) baseValue = 90

        const payload = {
          value: parseFloat(baseValue.toFixed(1)),
          temperature: parseFloat((45 + Math.random() * 20).toFixed(1)),
          status: Math.random() > 0.95 ? 'warning' : 'normal',
          timestamp: new Date().toTimeString().substring(0, 8)
        }

        client.publish(publishTopic.value, JSON.stringify(payload), { qos: 0 }, (err) => {
          if (err) {
            addLog('error', `自动发送失败: ${err.message}`)
          } else {
            addLog('send', `[Auto Sim] -> ${JSON.stringify(payload)}`)
          }
        })
      }, 2000)
    } catch (err) {
      simulationActive.value = false
    }
  } else {
    if (simulationInterval) {
      clearInterval(simulationInterval)
      simulationInterval = null
      addLog('info', '自动模拟已停止。')
    }
  }
}

onMounted(() => {
  fetchData()
  addLog('info', '模拟器就绪。请选择数据源，或者直接输入 Broker 地址并开始发布。')
})

onUnmounted(() => {
  disconnectClient()
})
</script>

<style scoped>
.select-dark :deep(.el-input__wrapper) {
  background-color: #0f172a !important;
  box-shadow: 0 0 0 1px #334155 inset !important;
}
.select-dark :deep(.el-input__inner) {
  color: #cbd5e1 !important;
}
.dark-textarea :deep(.el-textarea__inner) {
  background-color: #020617 !important;
  color: #38bdf8 !important;
  border-color: #1e293b !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
}
.dark-textarea :deep(.el-textarea__inner:focus) {
  border-color: #06b6d4 !important;
  box-shadow: 0 0 0 1px #06b6d4 inset !important;
}
</style>
