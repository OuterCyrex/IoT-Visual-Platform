import * as mqtt from 'mqtt'

// Connect using standard TCP port on the server side
const brokerUrl = 'mqtt://broker.emqx.io:1883'
const topic = 'factory/telemetry/test'

console.log(`[Publisher] Connecting to MQTT Broker at ${brokerUrl}...`)
const client = mqtt.connect(brokerUrl)

client.on('connect', () => {
  console.log(`[Publisher] Connected! Starting to publish data to topic "${topic}" every 2 seconds. Press Ctrl+C to stop.`)
  
  setInterval(() => {
    // Generate realistic sensor data
    const payload = {
      value: parseFloat((60 + Math.random() * 30).toFixed(1)), // 60.0 to 90.0
      temperature: parseFloat((50 + Math.random() * 20).toFixed(1)), // 50.0 to 70.0
      status: Math.random() > 0.95 ? 'warning' : 'normal',
      timestamp: new Date().toTimeString().substring(0, 8)
    }

    console.log(`[Publisher] Published payload: ${JSON.stringify(payload)}`)
    
    client.publish(topic, JSON.stringify(payload), { qos: 0 }, (err) => {
      if (err) {
        console.error('[Publisher] Publish error:', err)
      }
    })
  }, 2000)
})

client.on('error', (err) => {
  console.error('[Publisher] Connection error:', err)
})
