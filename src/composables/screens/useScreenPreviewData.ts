import { onUnmounted, ref } from 'vue'
import mqtt, { type MqttClient } from 'mqtt'
import { previewDataset, type DatasetPreview } from '../../api/screens'
import type { ScreenNode } from '../../types/screen-node'
import { getNodeDatasetId, getNodeRefreshInterval } from '../../utils/screen-node'

export function useScreenPreviewData() {
  const datasetData = ref<Record<string, DatasetPreview>>({})
  const mqttClients = ref<Record<string, MqttClient>>({})
  const timers: ReturnType<typeof setInterval>[] = []

  function toWsUrl(hostStr: string) {
    if (hostStr.startsWith('ws://') || hostStr.startsWith('wss://')) {
      return hostStr
    }
    
    // Remove protocol prefixes if any
    const cleanHost = hostStr.replace('http://', '').replace('https://', '')
    const [ip, portText] = cleanHost.split(':')
    
    // EMQX WebSockets default to 8083, HiveMQ to 8000. 
    // If standard TCP port 1883 is passed, map it to browser WebSocket port 8083.
    let port = '8083'
    if (portText) {
      if (portText === '1883') port = '8083'
      else if (portText === '8883') port = '8084'
      else port = portText
    }
    
    return `ws://${ip}:${port}/mqtt`
  }

  function subscribeMqtt(datasetId: string, rawHost?: string, topic?: string) {
    if (!rawHost || !topic) return
    if (mqttClients.value[datasetId]) return // Already subscribed

    const wsUrl = toWsUrl(rawHost)
    console.log(`[MQTT] Connecting to ${wsUrl} for dataset: ${datasetId}, topic: ${topic}`)

    try {
      const client = mqtt.connect(wsUrl, {
        connectTimeout: 4000,
        clientId: `ag_web_${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
      })

      client.on('connect', () => {
        console.log(`[MQTT] Connected. Subscribing to topic: ${topic}`)
        client.subscribe(topic, (err: any) => {
          if (err) console.error(`[MQTT] Sub error:`, err)
        })
      })

      client.on('message', (receivedTopic: string, payload: any) => {
        try {
          const payloadStr = payload.toString()
          console.log(`[MQTT] Message received: [${receivedTopic}] -> ${payloadStr}`)
          const parsed = JSON.parse(payloadStr)

          const nowStr = new Date().toTimeString().substring(0, 8)
          const newRow = {
            id: Date.now() + Math.random(),
            topic: receivedTopic,
            timestamp: nowStr,
            ...(typeof parsed === 'object' && parsed !== null ? parsed : { value: parsed })
          }

          const currentData = datasetData.value[datasetId]
          if (currentData) {
            // Prepend new row and keep last 40 entries
            const nextRows = [newRow, ...(currentData.rows || [])].slice(0, 40)
            const nextColumns = [...new Set([...(currentData.columns || []), ...Object.keys(newRow)])]
            
            datasetData.value[datasetId] = {
              ...currentData,
              columns: nextColumns,
              rows: nextRows
            }
          }
        } catch (parseErr) {
          console.warn(`[MQTT] Non-JSON payload received:`, payload.toString())
        }
      })

      client.on('error', (err: any) => {
        console.error(`[MQTT] Connection error on ${wsUrl}:`, err)
      })

      mqttClients.value[datasetId] = client
    } catch (err) {
      console.error(`[MQTT] Failed to connect:`, err)
    }
  }

  function clearMqttConnections() {
    Object.keys(mqttClients.value).forEach((id) => {
      try {
        mqttClients.value[id].end(true)
      } catch (err) {
        console.error(err)
      }
    })
    mqttClients.value = {}
  }

  async function fetchDatasetData(datasetId: string) {
    const res = await previewDataset(datasetId)
    datasetData.value[datasetId] = {
      columns: res.columns || [],
      rows: res.rows || [],
      sourceType: res.sourceType,
      sourceHost: res.sourceHost
    }

    if (res.sourceType === 'MQTT') {
      subscribeMqtt(datasetId, res.sourceHost, res.tableName)
    }
  }

  async function fetchAllDatasetData(nodes: ScreenNode[]) {
    const datasetIds = [...new Set(nodes.map(getNodeDatasetId).filter(Boolean))]
    await Promise.all(datasetIds.map((datasetId) => fetchDatasetData(datasetId)))
  }

  function clearRefreshTimers() {
    timers.forEach((timer) => clearInterval(timer))
    timers.length = 0
  }

  function setupRefreshTimers(nodes: ScreenNode[]) {
    clearRefreshTimers()

    nodes.forEach((node) => {
      const datasetId = getNodeDatasetId(node)
      const interval = getNodeRefreshInterval(node)
      
      // MQTT updates immediately via sockets, so we don't need polling timers for them
      if (!datasetId || interval <= 0) return

      timers.push(
        setInterval(() => {
          // Double check if it's MQTT. If so, skip HTTP polling
          const currentType = datasetData.value[datasetId]?.sourceType
          if (currentType === 'MQTT') return

          fetchDatasetData(datasetId).catch((err) => {
            console.error(`Failed to fetch dataset ${datasetId}:`, err)
          })
        }, interval)
      )
    })
  }

  onUnmounted(() => {
    clearRefreshTimers()
    clearMqttConnections()
  })

  return {
    datasetData,
    fetchDatasetData,
    fetchAllDatasetData,
    setupRefreshTimers,
    clearRefreshTimers,
    clearMqttConnections,
  }
}
