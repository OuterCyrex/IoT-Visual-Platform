<template>
  <div class="topology-device-card" :class="[deviceType, finalStatus]">
    <!-- Glowing LED light in the top-right corner -->
    <div class="status-indicator">
      <span class="pulse-dot" :class="finalStatus"></span>
    </div>

    <!-- Central SVG Vector Illustration -->
    <div class="svg-container">
      <svg v-if="deviceType === 'transformer'" viewBox="0 0 64 64" fill="none" class="device-svg">
        <circle cx="24" cy="32" r="11" stroke="currentColor" stroke-width="2.5" stroke-dasharray="2 2" />
        <circle cx="40" cy="32" r="11" stroke="currentColor" stroke-width="2.5" />
        <path d="M10 32h5M49 32h5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <path d="M20 22l5-7M44 22l-5-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>

      <svg v-else-if="deviceType === 'battery'" viewBox="0 0 64 64" fill="none" class="device-svg">
        <rect x="18" y="10" width="28" height="44" rx="3" stroke="currentColor" stroke-width="2.5" />
        <line x1="22" y1="20" x2="42" y2="20" stroke="currentColor" stroke-width="2" />
        <line x1="22" y1="28" x2="42" y2="28" stroke="currentColor" stroke-width="2" />
        <line x1="22" y1="36" x2="42" y2="36" stroke="currentColor" stroke-width="2" />
        <path d="M34 14l-5 9h5l-3 10 9-10h-5l4-9z" fill="currentColor" class="charge-lightning animate-pulse" />
      </svg>

      <svg v-else-if="deviceType === 'cabinet'" viewBox="0 0 64 64" fill="none" class="device-svg">
        <rect x="16" y="8" width="32" height="48" rx="2" stroke="currentColor" stroke-width="2.5" />
        <circle cx="24" cy="18" r="2.5" fill="currentColor" class="led-blink-slow" />
        <circle cx="32" cy="18" r="2.5" fill="currentColor" class="led-blink-fast" />
        <circle cx="40" cy="18" r="2.5" fill="currentColor" />
        <rect x="22" y="26" width="20" height="22" rx="1" stroke="currentColor" stroke-width="1.5" />
        <line x1="26" y1="32" x2="38" y2="32" stroke="currentColor" stroke-width="1.5" />
        <circle cx="32" cy="38" r="2.5" stroke="currentColor" stroke-width="1.5" />
      </svg>

      <svg v-else-if="deviceType === 'ups'" viewBox="0 0 64 64" fill="none" class="device-svg">
        <rect x="12" y="14" width="40" height="36" rx="3" stroke="currentColor" stroke-width="2.5" />
        <path d="M18 32c4-4 6-4 10 0s6 4 10 0 6-4 8 0" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="sine-wave" />
        <line x1="18" y1="42" x2="46" y2="42" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" />
      </svg>

      <svg v-else-if="deviceType === 'rack'" viewBox="0 0 64 64" fill="none" class="device-svg">
        <rect x="18" y="6" width="28" height="52" rx="2" stroke="currentColor" stroke-width="2.5" />
        <rect x="22" y="12" width="20" height="6" rx="0.5" stroke="currentColor" stroke-width="1.5" />
        <rect x="22" y="22" width="20" height="6" rx="0.5" stroke="currentColor" stroke-width="1.5" />
        <rect x="22" y="32" width="20" height="6" rx="0.5" stroke="currentColor" stroke-width="1.5" />
        <rect x="22" y="42" width="20" height="6" rx="0.5" stroke="currentColor" stroke-width="1.5" />
        <circle cx="25" cy="15" r="1" fill="currentColor" class="led-blink-fast" />
        <circle cx="25" cy="25" r="1" fill="currentColor" class="led-blink-slow" />
        <circle cx="25" cy="35" r="1" fill="currentColor" class="led-blink-fast" />
        <circle cx="25" cy="45" r="1" fill="currentColor" />
      </svg>

      <svg v-else-if="deviceType === 'chiller'" viewBox="0 0 64 64" fill="none" class="device-svg">
        <rect x="16" y="10" width="32" height="44" rx="2" stroke="currentColor" stroke-width="2.5" />
        <circle cx="32" cy="26" r="10" stroke="currentColor" stroke-width="2" />
        <path d="M32 16v20M22 26h20" stroke="currentColor" stroke-width="2" class="fan-blade" />
        <line x1="22" y1="44" x2="42" y2="44" stroke="currentColor" stroke-width="1.5" />
        <line x1="22" y1="48" x2="42" y2="48" stroke="currentColor" stroke-width="1.5" />
      </svg>

      <svg v-else viewBox="0 0 64 64" fill="none" class="device-svg">
        <rect x="14" y="16" width="36" height="34" rx="2" stroke="currentColor" stroke-width="2.5" />
        <circle cx="24" cy="32" r="5" stroke="currentColor" stroke-width="2" class="rotor" />
        <circle cx="40" cy="32" r="5" stroke="currentColor" stroke-width="2" class="rotor" />
        <line x1="18" y1="22" x2="46" y2="22" stroke="currentColor" stroke-width="1.5" />
        <line x1="18" y1="44" x2="46" y2="44" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </div>

    <!-- Text info and dynamic metrics -->
    <div class="info-container">
      <div class="device-name">{{ titleText }}</div>
      <div class="device-metric">
        <span class="value-text">{{ valueText }}</span>
        <span v-if="hasData" class="live-tag">LIVE</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    text?: string
    deviceType?: 'transformer' | 'battery' | 'cabinet' | 'ups' | 'rack' | 'chiller' | 'generator'
    status?: 'running' | 'warning' | 'stopped'
    xField?: string
    yField?: string
    rows?: Record<string, unknown>[]
  }>(),
  {
    deviceType: 'transformer',
    status: 'running',
    rows: () => []
  }
)

const hasData = computed(() => Boolean(props.rows && props.rows.length > 0 && props.yField))

const firstRow = computed(() => {
  if (hasData.value) {
    return props.rows[0] ?? {}
  }
  return {}
})

const titleText = computed(() => props.text || '动力设备')

const valueText = computed(() => {
  if (hasData.value) {
    const val = firstRow.value[props.yField!]
    if (typeof val === 'number') {
      return `${val.toFixed(1)}`
    }
    return String(val ?? '--')
  }
  // Static placeholder metrics if no binding
  if (props.deviceType === 'transformer') return '10.5 kV'
  if (props.deviceType === 'battery') return '94.8%'
  if (props.deviceType === 'ups') return '220 V'
  if (props.deviceType === 'chiller') return '21.5 °C'
  if (props.deviceType === 'rack') return '4.2 kW'
  return '--'
})

// Dynamic status based on live data if available
const finalStatus = computed(() => {
  if (hasData.value) {
    // If telemetry sends a 'status' field, use it
    if (firstRow.value.status) {
      const s = String(firstRow.value.status).toLowerCase()
      if (s === 'warning' || s === 'error' || s === 'alert') return 'warning'
      if (s === 'stopped' || s === 'offline') return 'stopped'
      return 'running'
    }
    // Alternatively, if yField value is a number, we can infer warning states
    const val = Number(firstRow.value[props.yField!])
    if (Number.isFinite(val)) {
      if (props.deviceType === 'chiller' && val > 30) return 'warning' // high temperature warning
      if (props.deviceType === 'transformer' && val > 90) return 'warning' // high load warning
      if (props.deviceType === 'battery' && val < 15) return 'warning' // low battery warning
    }
  }
  return props.status
})
</script>

<style scoped>
.topology-device-card {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(51, 65, 85, 0.4);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #94a3b8;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
}

.topology-device-card:hover {
  border-color: rgba(56, 189, 248, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px -4px rgba(56, 189, 248, 0.2);
  background: rgba(15, 23, 42, 0.75);
}

/* Status glowing indicator styling */
.status-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  position: relative;
}

/* LED glow animations based on status */
.pulse-dot.running {
  background-color: #10b981;
  box-shadow: 0 0 10px #10b981, 0 0 20px rgba(16, 185, 129, 0.4);
}
.pulse-dot.running::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border: 1px solid #10b981;
  border-radius: 50%;
  left: -6px;
  top: -6px;
  opacity: 0.8;
  animation: pulse-ring 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
}

.pulse-dot.warning {
  background-color: #f59e0b;
  box-shadow: 0 0 10px #f59e0b, 0 0 20px rgba(245, 158, 11, 0.4);
}
.pulse-dot.warning::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border: 1px solid #f59e0b;
  border-radius: 50%;
  left: -6px;
  top: -6px;
  opacity: 0.8;
  animation: pulse-ring 1.2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
}

.pulse-dot.stopped {
  background-color: #64748b;
  box-shadow: 0 0 4px #64748b;
}

@keyframes pulse-ring {
  0% { transform: scale(0.3); opacity: 0.8; }
  80%, 100% { transform: scale(1.2); opacity: 0; }
}

/* SVG icon wrappers and glow styles */
.svg-container {
  flex: 1;
  width: 100%;
  max-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
  margin-bottom: 8px;
}

.device-svg {
  width: auto;
  height: 100%;
  max-width: 52px;
  transition: color 0.3s;
}

/* Colors matching the device status */
.topology-device-card.running .device-svg {
  color: #38bdf8;
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.4));
}
.topology-device-card.warning .device-svg {
  color: #f59e0b;
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
}
.topology-device-card.stopped .device-svg {
  color: #475569;
}

/* Animations inside SVGs to show operation */
.running .fan-blade {
  transform-origin: 32px 26px;
  animation: rotate 2.5s linear infinite;
}
.warning .fan-blade {
  transform-origin: 32px 26px;
  animation: rotate 1s linear infinite;
}

.running .rotor {
  transform-origin: 24px 32px;
  animation: rotate 4s linear infinite;
}

.led-blink-fast {
  animation: blink 0.5s steps(2, start) infinite;
}
.led-blink-slow {
  animation: blink 1.2s steps(2, start) infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}
@keyframes blink {
  to { visibility: hidden; }
}

/* Information typography */
.info-container {
  width: 100%;
  text-align: center;
}

.device-name {
  font-size: 11px;
  font-weight: 500;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
  line-height: 1.2;
}

.device-metric {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.value-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 700;
  color: #f8fafc;
}

.running .value-text {
  color: #06b6d4;
  text-shadow: 0 0 4px rgba(6, 182, 212, 0.4);
}

.warning .value-text {
  color: #f59e0b;
}

.stopped .value-text {
  color: #64748b;
}

.live-tag {
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: #22d3ee;
  border-radius: 4px;
  padding: 0px 4px;
  font-size: 8px;
  font-weight: bold;
}
</style>
