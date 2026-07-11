<template>
  <div class="mine-process-map" :class="{ 'has-data': hasData }">
    <!-- Grid Backdrop -->
    <div class="grid-overlay"></div>

    <!-- Isometric SVG -->
    <svg viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg" class="isometric-svg">
      <!-- Defs for gradients, filters, and glow effects -->
      <defs>
        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#0369a1" stop-opacity="0.2" />
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Conveyor Belt Paths (Flowing Material Lines) -->
      <!-- 1. Mine extraction to screening tower -->
      <path d="M190 280 L 350 200" class="flow-line primary-flow" />
      <!-- 2. Screening tower to Storage silo A -->
      <path d="M430 200 L 580 275" class="flow-line secondary-flow" />
      <!-- 3. Screening tower to Storage silo B -->
      <path d="M430 200 L 520 320" class="flow-line secondary-flow" />

      <!-- Isometric Nodes -->
      
      <!-- NODE 1: Mining Zone (采矿区) -->
      <g class="iso-node active" transform="translate(110, 230)" @click="selectNode('mining')">
        <!-- Isometric Box Base -->
        <path d="M 0 25 L 50 0 L 100 25 L 50 50 Z" class="node-base" />
        <path d="M 0 25 L 50 50 L 50 80 L 0 55 Z" class="node-side-left" />
        <path d="M 100 25 L 50 50 L 50 80 L 100 55 Z" class="node-side-right" />
        <!-- Drill Rig / Collector Symbol -->
        <path d="M 35 15 L 65 15 L 50 40 Z" fill="#38bdf8" class="drill-rig" />
        <line x1="50" y1="5" x2="50" y2="40" stroke="#f0f9ff" stroke-width="2.5" class="drill-bit" />
        <!-- Labels -->
        <text x="50" y="-10" class="node-title">采矿区 101工作面</text>
        <text x="50" y="95" class="node-status text-cyan-400 font-mono">{{ miningRate }} Hz</text>
      </g>

      <!-- NODE 2: Screening Tower (智能筛分塔) -->
      <g class="iso-node" transform="translate(350, 120)" @click="selectNode('screening')">
        <path d="M 0 30 L 60 0 L 120 30 L 60 60 Z" class="node-base" />
        <path d="M 0 30 L 60 60 L 60 110 L 0 80 Z" class="node-side-left" />
        <path d="M 120 30 L 60 60 L 60 110 L 120 80 Z" class="node-side-right" />
        <!-- Sifter animation indicator -->
        <rect x="40" y="15" width="40" height="25" rx="2" fill="url(#glowGrad)" stroke="#0284c7" stroke-width="1.5" class="sifter-vibrate" />
        <text x="60" y="-12" class="node-title">重力筛分分级塔</text>
        <text x="60" y="125" class="node-status text-emerald-400">运行良好 (96%)</text>
      </g>

      <!-- NODE 3: Storage Silo A (精矿配煤仓 A) -->
      <g class="iso-node" transform="translate(560, 220)" @click="selectNode('silo_a')">
        <!-- Cylinder base representation -->
        <ellipse cx="50" cy="20" rx="40" ry="16" class="node-base" />
        <path d="M 10 20 A 40 16 0 0 0 90 20 L 90 90 A 40 16 0 0 1 10 90 Z" class="cylinder-body" />
        <ellipse cx="50" cy="90" rx="40" ry="16" class="cylinder-bottom" />
        <line x1="50" y1="20" x2="50" y2="90" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="2 3" />
        <text x="50" y="-10" class="node-title">精矿储仓 A</text>
        <text x="50" y="120" class="node-status text-sky-400 font-mono">{{ siloALevel }}%</text>
      </g>

      <!-- NODE 4: Storage Silo B (副矿混煤仓 B) -->
      <g class="iso-node" transform="translate(480, 310)" @click="selectNode('silo_b')">
        <ellipse cx="45" cy="18" rx="35" ry="14" class="node-base" />
        <path d="M 10 18 A 35 14 0 0 0 80 18 L 80 80 A 35 14 0 0 1 10 80 Z" class="cylinder-body" />
        <ellipse cx="45" cy="80" rx="35" ry="14" class="cylinder-bottom" />
        <text x="45" y="-10" class="node-title">副矿混煤仓 B</text>
        <text x="45" y="110" class="node-status text-slate-400 font-mono">54.2%</text>
      </g>
    </svg>

    <!-- Overlay process summary details -->
    <div class="process-legend select-none">
      <div class="legend-title">智慧矿山输送控制流程</div>
      <div class="legend-grid">
        <div class="legend-item">
          <span class="indicator bg-cyan-500"></span>
          <span>工作面采集流 (实时)</span>
        </div>
        <div class="legend-item">
          <span class="indicator bg-emerald-500"></span>
          <span>高频分选选煤系统</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    text?: string
    xField?: string
    yField?: string
    rows?: Record<string, unknown>[]
  }>(),
  {
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

// Bound variables
const miningRate = computed(() => {
  if (hasData.value) {
    const val = firstRow.value[props.yField!]
    if (typeof val === 'number') {
      return val.toFixed(1)
    }
    return String(val ?? '50.0')
  }
  return '50.0'
})

const siloALevel = computed(() => {
  // If MQTT sends 'temperature', we can scale it to a level percentage (e.g. value of 0-100)
  if (hasData.value) {
    const temp = Number(firstRow.value.temperature)
    if (Number.isFinite(temp)) {
      // Map typical temperature (e.g. 50-80°C) to silo levels (e.g. 70-95%)
      return Math.min(100, Math.max(10, Math.round(temp * 1.2)))
    }
  }
  return '82'
})

function selectNode(nodeName: string) {
  console.log(`Selected process node: ${nodeName}`)
}
</script>

<style scoped>
.mine-process-map {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(51, 65, 85, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  overflow: hidden;
  box-shadow: inset 0 0 30px rgba(56, 189, 248, 0.05);
}

/* Grid Backdrop */
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 1;
}

.isometric-svg {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
  overflow: visible;
}

/* Flow Line conveyor belts */
.flow-line {
  stroke-linecap: round;
  fill: none;
  filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.3));
}

.flow-line.primary-flow {
  stroke: #0ea5e9;
  stroke-width: 3.5;
  stroke-dasharray: 8 8;
  animation: flow-dash 1.2s linear infinite;
}

.flow-line.secondary-flow {
  stroke: #0284c7;
  stroke-width: 2.5;
  stroke-dasharray: 6 6;
  animation: flow-dash 2s linear infinite;
}

@keyframes flow-dash {
  to {
    stroke-dashoffset: -20;
  }
}

/* Isometric Node styling */
.iso-node {
  cursor: pointer;
}

.node-base {
  fill: rgba(30, 41, 59, 0.85);
  stroke: #334155;
  stroke-width: 1.5;
  transition: all 0.3s;
}

.node-side-left {
  fill: rgba(15, 23, 42, 0.9);
  stroke: #334155;
  stroke-width: 1.5;
}

.node-side-right {
  fill: rgba(15, 23, 42, 0.8);
  stroke: #334155;
  stroke-width: 1.5;
}

.cylinder-body {
  fill: rgba(15, 23, 42, 0.85);
  stroke: #334155;
  stroke-width: 1.5;
}

.cylinder-bottom {
  fill: rgba(30, 41, 59, 0.9);
  stroke: #334155;
  stroke-width: 1.5;
}

/* Hover effects */
.iso-node:hover .node-base,
.iso-node:hover .cylinder-body {
  fill: rgba(3, 105, 161, 0.4);
  stroke: #0ea5e9;
  filter: drop-shadow(0 0 6px rgba(14, 165, 233, 0.4));
}

/* Text typography */
.node-title {
  fill: #e2e8f0;
  font-size: 11px;
  font-weight: 600;
  text-anchor: middle;
  pointer-events: none;
  letter-spacing: 0.05em;
}

.node-status {
  font-size: 12px;
  font-weight: bold;
  text-anchor: middle;
  pointer-events: none;
}

/* Node Animations */
.drill-rig {
  animation: sifter-pulse 2s ease-in-out infinite;
}

.drill-bit {
  animation: drill-vertical 0.8s ease-in-out infinite alternate;
}

.sifter-vibrate {
  animation: vibrate 0.15s linear infinite;
  transform-origin: center;
}

@keyframes sifter-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; fill: #00e5ff; }
}

@keyframes drill-vertical {
  from { transform: translateY(0); }
  to { transform: translateY(6px); }
}

@keyframes vibrate {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(0px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(2px, 1px) rotate(-1deg); }
  85% { transform: translate(-1px, -1px) rotate(1deg); }
  100% { transform: translate(1px, -2px) rotate(0deg); }
}

/* Legend overlay */
.process-legend {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.4);
  padding: 10px 14px;
  border-radius: 8px;
  backdrop-filter: blur(8px);
}

.legend-title {
  font-size: 11px;
  color: #cbd5e1;
  font-weight: bold;
  margin-bottom: 6px;
}

.legend-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #94a3b8;
}

.indicator {
  width: 10px;
  height: 4px;
  border-radius: 2px;
}
</style>
