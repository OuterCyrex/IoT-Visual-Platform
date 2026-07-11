<template>
  <div
    class="mine-device-card"
    :class="[deviceType, finalStatus, { hovered: isHovered }]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Grid/Shadow foundation backdrop for 2.5D perspective depth -->
    <div class="foundation-shadow"></div>

    <!-- Main SVG Render Area -->
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="device-svg">
      <defs>
        <!-- Steel Gradients for realistic specular highlights -->
        <linearGradient :id="'metalCylinder-' + id" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="20%" stop-color="#3b4252" />
          <stop offset="35%" stop-color="#d8dee9" />
          <stop offset="45%" stop-color="#4c566a" />
          <stop offset="75%" stop-color="#2e3440" />
          <stop offset="100%" stop-color="#0b0f19" />
        </linearGradient>

        <linearGradient :id="'towerMetal-' + id" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="15%" stop-color="#475569" />
          <stop offset="30%" stop-color="#e2e8f0" />
          <stop offset="45%" stop-color="#64748b" />
          <stop offset="70%" stop-color="#334155" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>

        <linearGradient :id="'goldOreGrad-' + id" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0.15" />
        </linearGradient>

        <linearGradient :id="'neonCyanGrad-' + id" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#0369a1" />
        </linearGradient>

        <!-- Filters for Neon Glow -->
        <filter :id="'laserGlow-' + id" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- TYPE 1: SHAFT (主/副竖井系统 - 深度重塑版本) -->
      <g v-if="deviceType === 'shaft'" class="isometric-group">
        <!-- 1. Foundation & Shadows -->
        <ellipse cx="100" cy="188" rx="65" ry="18" fill="black" opacity="0.55" />
        
        <!-- Concrete base block -->
        <polygon points="45,188 55,168 145,168 155,188" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
        <polygon points="45,188 155,188 145,196 35,196" fill="#0f172a" opacity="0.8" />
        
        <!-- 2. Outer Scaffold Structural Frame (Steel Truss Cage) -->
        <!-- Vertical structural beams -->
        <line x1="50" y1="172" x2="50" y2="70" stroke="#475569" stroke-width="4" />
        <line x1="150" y1="172" x2="150" y2="70" stroke="#475569" stroke-width="4" />
        <line x1="100" y1="180" x2="100" y2="155" stroke="#334155" stroke-width="3" /> <!-- Middle support -->
        
        <!-- Horizontal tie beams -->
        <line x1="50" y1="70" x2="150" y2="70" stroke="#334155" stroke-width="3" />
        <line x1="50" y1="105" x2="150" y2="105" stroke="#334155" stroke-width="3.5" />
        <line x1="50" y1="140" x2="150" y2="140" stroke="#334155" stroke-width="3.5" />
        
        <!-- Cross bracing braces -->
        <line x1="50" y1="70" x2="150" y2="105" stroke="#475569" stroke-width="1.5" />
        <line x1="150" y1="70" x2="50" y2="105" stroke="#475569" stroke-width="1.5" />
        <line x1="50" y1="105" x2="150" y2="140" stroke="#475569" stroke-width="1.5" />
        <line x1="150" y1="105" x2="50" y2="140" stroke="#475569" stroke-width="1.5" />
        <line x1="50" y1="140" x2="150" y2="172" stroke="#475569" stroke-width="1.5" />
        <line x1="150" y1="140" x2="50" y2="172" stroke="#475569" stroke-width="1.5" />

        <!-- 3. Specular Cylinder Shaft Body (Internal) -->
        <ellipse cx="100" cy="45" rx="33" ry="12" fill="#334155" stroke="#1e293b" />
        <path :d="'M 67 45 A 33 12 0 0 0 133 45 L 133 145 A 33 12 0 0 1 67 145 Z'" :fill="'url(#metalCylinder-' + id + ')'" stroke="#0f172a" />
        
        <!-- Cylinder Band Reinforcements -->
        <ellipse cx="100" cy="65" rx="33.5" ry="12" fill="none" stroke="#475569" stroke-width="1.2" />
        <ellipse cx="100" cy="95" rx="33.5" ry="12" fill="none" stroke="#475569" stroke-width="1.2" />
        <ellipse cx="100" cy="125" rx="33.5" ry="12" fill="none" stroke="#475569" stroke-width="1.2" />

        <!-- 4. Top Ventilation / Hood Caps -->
        <path d="M 67 45 Q 100 20, 133 45 Z" fill="url(#metalCylinder)" stroke="#0f172a" />
        <!-- Exhaust stack pipeline -->
        <path d="M 100 26 L 100 12 L 115 8" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round" />
        <polygon points="112,8 118,5 120,11 114,14" fill="#0f172a" />

        <!-- 5. Vertical Ladder with safety loops -->
        <!-- Rails -->
        <path d="M 125 55 L 125 140 M 128 55 L 128 140" stroke="#64748b" stroke-width="0.8" />
        <!-- Rungs -->
        <path d="M 125 60 L 128 60 M 125 68 L 128 68 M 125 76 L 128 76 M 125 84 L 128 84 M 125 92 L 128 92 M 125 100 L 128 100 M 125 108 L 128 108 M 125 116 L 128 116 M 125 124 L 128 124 M 125 132 L 128 132" stroke="#64748b" stroke-width="0.6" />
        <!-- Safety Hoop guards -->
        <path d="M 125 65 A 6 6 0 0 1 133 70 M 125 85 A 6 6 0 0 1 133 90 M 125 105 A 6 6 0 0 1 133 110 M 125 125 A 6 6 0 0 1 133 130" fill="none" stroke="#475569" stroke-width="0.8" />

        <!-- 6. Exit Discharge Chute & Micro Conveyor -->
        <polygon points="90,145 110,145 125,160 85,160" fill="#0f172a" stroke="#334155" />
        <!-- Micro vibrating feeder -->
        <rect x="90" y="155" width="20" height="8" fill="#ca8a04" rx="1" />
        <!-- Conveyor header pulley discharging rightwards -->
        <path d="M 105 162 L 138 172" stroke="#475569" stroke-width="4.5" stroke-linecap="round" />
        <ellipse cx="138" cy="172" rx="2" ry="1" fill="#fbbf24" class="drill-led" />

        <!-- 7. Glass Sci-fi Name Badge (东晋东主井) -->
        <rect x="76" y="70" width="48" height="42" rx="4" fill="#030712" fill-opacity="0.9" stroke="#38bdf8" stroke-width="1.2" />
        <text x="100" y="83" fill="#ffffff" font-size="8.5px" font-weight="bold" text-anchor="middle" letter-spacing="0.5">东晋东</text>
        <text x="100" y="94" fill="#38bdf8" font-size="8.5px" font-weight="bold" text-anchor="middle" letter-spacing="0.5">主斜井</text>
        <text x="100" y="105" fill="#10b981" font-size="7.5px" font-weight="bold" text-anchor="middle" class="drill-led">SYSTEM</text>

        <!-- Status glowing ring -->
        <ellipse cx="100" cy="45" rx="30" ry="12" fill="none" stroke="#38bdf8" stroke-width="2.5" class="neon-ring" :filter="'url(#laserGlow-' + id + ')'" />
      </g>

      <!-- TYPE 2: SILO_METAL (高反光金属原煤仓) -->
      <g v-else-if="deviceType === 'silo_metal'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="185" rx="50" ry="18" fill="black" opacity="0.45" />
        
        <!-- Base concrete structure -->
        <polygon points="70,180 80,165 120,165 130,180" fill="#334155" stroke="#1e293b" />
        <!-- Structural columns -->
        <line x1="75" y1="130" x2="75" y2="175" stroke="#475569" stroke-width="3" />
        <line x1="125" y1="130" x2="125" y2="175" stroke="#475569" stroke-width="3" />
        <line x1="100" y1="130" x2="100" y2="170" stroke="#334155" stroke-width="2" />
        
        <!-- Cylinder Container -->
        <ellipse cx="100" cy="50" rx="32" ry="12" fill="#475569" stroke="#334155" />
        <path :d="'M 68 50 A 32 12 0 0 0 132 50 L 132 130 A 32 12 0 0 1 68 130 Z'" :fill="'url(#metalCylinder-' + id + ')'" stroke="#1e293b" />
        
        <!-- Discharging cone bottom -->
        <path d="M 68 130 A 32 12 0 0 0 132 130 L 100 155 Z" fill="#1e293b" stroke="#334155" />
        
        <!-- Ladder detail -->
        <path d="M 74 52 L 74 125 M 74 60 L 78 60 M 74 70 L 78 70 M 74 80 L 78 80 M 74 90 L 78 90 M 74 100 L 78 100 M 74 110 L 78 110 M 74 120 L 78 120" stroke="#94a3b8" stroke-width="0.8" />
        
        <!-- Glass Gauge Column -->
        <rect x="98" y="60" width="4" height="50" rx="1" fill="#090d16" />
        <rect x="99" y="65" width="2" height="42" rx="0.5" fill="#38bdf8" class="gauge-fluid" />
      </g>

      <!-- TYPE 3: SILO_CONCRETE (混凝土配煤仓) -->
      <g v-else-if="deviceType === 'silo_concrete'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="185" rx="55" ry="20" fill="black" opacity="0.45" />

        <!-- Concrete Heavy Base Pillars -->
        <rect x="68" y="125" width="10" height="50" fill="#334155" stroke="#1e293b" />
        <rect x="122" y="125" width="10" height="50" fill="#334155" stroke="#1e293b" />
        <polygon points="65,125 100,140 135,125 100,120" fill="#475569" />

        <!-- Concrete Silo Body (Wide) -->
        <ellipse cx="100" cy="45" rx="38" ry="14" fill="#64748b" stroke="#475569" />
        <path :d="'M 62 45 A 38 14 0 0 0 138 45 L 138 120 A 38 14 0 0 1 62 120 Z'" :fill="'url(#towerMetal-' + id + ')'" stroke="#1e293b" />
        
        <!-- Cone bottom discharge -->
        <path d="M 62 120 A 38 14 0 0 0 138 120 L 100 142 Z" fill="#1e293b" />

        <!-- Heavy steel inspection platforms -->
        <ellipse cx="100" cy="95" rx="42" ry="14.5" fill="none" stroke="#475569" stroke-width="1.5" />
        <line x1="58" y1="91" x2="58" y2="97" stroke="#64748b" stroke-width="1.2" />
        <line x1="142" y1="91" x2="142" y2="97" stroke="#64748b" stroke-width="1.2" />
      </g>

      <!-- TYPE 4: CRUSHER_JAW (重型颚式破碎机) -->
      <g v-else-if="deviceType === 'crusher_jaw'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="180" rx="55" ry="16" fill="black" opacity="0.45" />

        <!-- Crusher Base Frame (Steel girders) -->
        <polygon points="45,170 55,145 145,145 155,170" fill="#334155" stroke="#1e293b" />
        <rect x="50" y="165" width="100" height="10" fill="#1e293b" />

        <!-- Main Mechanical Chamber -->
        <rect x="58" y="90" width="84" height="60" :fill="'url(#towerMetal-' + id + ')'" stroke="#1e293b" />
        <polygon points="50,90 100,75 150,90 100,105" fill="#334155" stroke="#1e293b" />

        <!-- Inlet Hopper (漏斗) -->
        <polygon points="65,90 55,55 145,55 135,90" fill="#475569" stroke="#334155" />
        <polygon points="75,90 65,60 135,60 125,90" fill="#0f172a" />

        <!-- Flywheel details (Spinning pulleys!) -->
        <g transform="translate(138, 120)" class="fan-spin">
          <circle cx="0" cy="0" r="16" :fill="'url(#metalCylinder-' + id + ')'" stroke="#0f172a" stroke-width="1.5" />
          <line x1="-16" y1="0" x2="16" y2="0" stroke="#64748b" stroke-width="2.5" />
          <line x1="0" y1="-16" x2="0" y2="16" stroke="#64748b" stroke-width="2.5" />
          <circle cx="0" cy="0" r="5" fill="#eab308" />
        </g>
      </g>

      <!-- TYPE 5: SIFTER_VIBRATORY (双层智能振动筛) -->
      <g v-else-if="deviceType === 'sifter_vibratory'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="180" rx="60" ry="18" fill="black" opacity="0.45" />

        <!-- Dampening spring columns (弹簧支撑座) -->
        <rect x="60" y="145" width="12" height="25" rx="2" fill="none" stroke="#475569" stroke-width="1.5" />
        <path d="M 60 145 L 72 150 M 60 152 L 72 157 M 60 160 L 72 165" stroke="#64748b" stroke-width="2" />
        
        <rect x="128" y="145" width="12" height="25" rx="2" fill="none" stroke="#475569" stroke-width="1.5" />
        <path d="M 128 145 L 140 150 M 128 152 L 140 157 M 128 160 L 140 165" stroke="#64748b" stroke-width="2" />

        <!-- Sifter body with shake vibration animation -->
        <g class="sifter-vibrate">
          <!-- Main sorting deck angled -->
          <polygon points="50,105 150,65 150,125 50,145" :fill="'url(#towerMetal-' + id + ')'" stroke="#1e293b" />
          <polygon points="50,105 150,65 125,50 35,85" fill="#475569" />

          <!-- Multi-tier mesh screens -->
          <line x1="50" y1="120" x2="150" y2="80" stroke="#eab308" stroke-dasharray="2 2" stroke-width="2" />
          <line x1="50" y1="132" x2="150" y2="92" stroke="#38bdf8" stroke-dasharray="2 2" stroke-width="2" />

          <!-- Coarse outlet chute (出料斜槽) -->
          <polygon points="35,85 15,95 15,115 50,120" fill="#1e293b" stroke="#334155" />
        </g>
      </g>

      <!-- TYPE 6: CONVEYOR_BELT (桁架皮带机) -->
      <g v-else-if="deviceType === 'conveyor_belt'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="180" rx="70" ry="14" fill="black" opacity="0.35" />

        <!-- Truss structures -->
        <line x1="30" y1="140" x2="30" y2="175" stroke="#475569" stroke-width="2.5" />
        <line x1="170" y1="75" x2="170" y2="120" stroke="#475569" stroke-width="2.5" />
        
        <path d="M 20 140 L 180 70" stroke="#1e293b" stroke-width="8" stroke-linecap="round" />
        <!-- Structural steel diagonals -->
        <path d="M 20 140 L 180 70 M 35 133 L 35 142 M 70 118 L 70 127 M 105 103 L 105 112 M 140 88 L 140 97" stroke="#64748b" stroke-width="1.5" />

        <!-- Flowing coal material on conveyor belt -->
        <path d="M 20 140 L 180 70" stroke="#0ea5e9" stroke-width="3" stroke-dasharray="6 12" class="pipe-flow-1" stroke-linecap="round" :filter="'url(#laserGlow-' + id + ')'" />

        <!-- Conveyor Roller wheel -->
        <circle cx="25" cy="140" r="6" fill="#475569" stroke="#0f172a" />
        <circle cx="175" cy="70" r="6" fill="#475569" stroke="#0f172a" />
      </g>

      <!-- TYPE 7: DUST_COLLECTOR (点式除尘器) -->
      <g v-else class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="185" rx="40" ry="12" fill="black" opacity="0.45" />

        <!-- Steel support columns -->
        <line x1="80" y1="130" x2="80" y2="180" stroke="#475569" stroke-width="2" />
        <line x1="120" y1="130" x2="120" y2="180" stroke="#475569" stroke-width="2" />

        <!-- Main filtration body -->
        <ellipse cx="100" cy="70" rx="22" ry="8" fill="#475569" stroke="#334155" />
        <path :d="'M 78 70 A 22 8 0 0 0 122 70 L 122 130 A 22 8 0 0 1 78 130 Z'" :fill="'url(#metalCylinder-' + id + ')'" stroke="#1e293b" />
        
        <!-- Conic dust bin bottom -->
        <path d="M 78 130 A 22 8 0 0 0 122 130 L 100 155 Z" fill="#1e293b" stroke="#334155" />

        <!-- Intake Pipeline -->
        <path d="M 122 90 L 145 90 L 145 150" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" />

        <!-- Glow LED -->
        <circle cx="100" cy="55" r="3.5" fill="#10b981" class="drill-led" />
      </g>
    </svg>

    <!-- Overlay Info Inside Node Card -->
    <div class="info-overlay">
      <div class="name-text">{{ titleText }}</div>
      <div class="metric-text font-mono">
        <span class="value">{{ valueText }}</span>
        <span class="unit">{{ props.unit }}</span>
      </div>
    </div>

    <!-- Status Pulse Beacon (Dynamic UI) -->
    <div class="status-beacon" :class="finalStatus"></div>

    <!-- Interactive Telemetry Tooltip Overlay (Floating style) -->
    <transition name="fade">
      <div v-if="isHovered" class="device-tooltip">
        <div class="tooltip-corner tl"></div>
        <div class="tooltip-corner tr"></div>
        <div class="tooltip-corner bl"></div>
        <div class="tooltip-corner br"></div>

        <div class="tooltip-header">
          <span class="tooltip-led" :class="finalStatus"></span>
          <span>{{ titleText }} 详细运行遥测</span>
        </div>
        <div class="tooltip-body">
          <div class="tooltip-row">
            <span class="lbl">工作状态:</span>
            <span class="val" :class="finalStatus === 'running' ? 'text-emerald-400' : 'text-amber-400'">
              {{ finalStatus === 'running' ? '正常运行' : finalStatus === 'warning' ? '负载超标' : '离线停机' }}
            </span>
          </div>
          <div class="tooltip-row">
            <span class="lbl">实时指标:</span>
            <span class="val text-cyan-400">{{ valueText }} {{ props.unit }}</span>
          </div>
          <div v-if="deviceType === 'shaft' || deviceType === 'crusher_jaw'" class="tooltip-row">
            <span class="lbl">主电机负载:</span>
            <span class="val">82 A</span>
          </div>
          <div v-if="deviceType === 'silo_metal' || deviceType === 'silo_concrete'" class="tooltip-row">
            <span class="lbl">当前有效重:</span>
            <span class="val">8,240 吨</span>
          </div>
          <div class="tooltip-row">
            <span class="lbl">系统温度:</span>
            <span class="val">28.4 °C</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    id?: string
    text?: string
    deviceType?: 'shaft' | 'silo_metal' | 'silo_concrete' | 'crusher_jaw' | 'sifter_vibratory' | 'conveyor_belt' | 'dust_collector'
    status?: 'running' | 'warning' | 'stopped'
    value?: string | number
    unit?: string
    xField?: string
    yField?: string
    rows?: Record<string, unknown>[]
  }>(),
  {
    id: () => 'dev-' + Math.random().toString(36).substr(2, 9),
    deviceType: 'silo_metal',
    status: 'running',
    value: '',
    unit: '',
    rows: () => []
  }
)

const isHovered = ref(false)

const hasData = computed(() => Boolean(props.rows && props.rows.length > 0 && props.yField))
const firstRow = computed(() => {
  if (hasData.value) {
    return props.rows[0] ?? {}
  }
  return {}
})

const titleText = computed(() => props.text || '矿山设备')

const valueText = computed(() => {
  if (hasData.value) {
    const val = firstRow.value[props.yField!]
    if (typeof val === 'number') {
      return val.toFixed(1)
    }
    return String(val ?? '--')
  }
  return props.value || getDefaultStaticValue()
})

const finalStatus = computed(() => {
  if (hasData.value) {
    if (firstRow.value.status) {
      const s = String(firstRow.value.status).toLowerCase()
      if (s === 'warning' || s === 'error' || s === 'alert') return 'warning'
      if (s === 'stopped' || s === 'offline') return 'stopped'
      return 'running'
    }
    const val = Number(firstRow.value[props.yField!])
    if (Number.isFinite(val)) {
      if (props.deviceType === 'shaft' && val > 90) return 'warning'
      if (props.deviceType === 'silo_metal' && val > 95) return 'warning'
    }
  }
  return props.status
})

function getDefaultStaticValue() {
  if (props.deviceType === 'shaft') return '62.0'
  if (props.deviceType === 'silo_metal') return '64.0'
  if (props.deviceType === 'silo_concrete') return '64'
  if (props.deviceType === 'crusher_jaw') return '48.5'
  if (props.deviceType === 'sifter_vibratory') return '48'
  if (props.deviceType === 'conveyor_belt') return '62'
  if (props.deviceType === 'dust_collector') return '19'
  return '--'
}
</script>

<style scoped>
.mine-device-card {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, rgba(13, 27, 56, 0.55) 0%, rgba(2, 6, 23, 0.7) 100%);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: visible;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
}

.mine-device-card:hover, .mine-device-card.hovered {
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 
    0 8px 30px rgba(56, 189, 248, 0.2),
    inset 0 0 15px rgba(56, 189, 248, 0.08);
  transform: translateY(-2px) scale(1.02);
}

/* Perspective base shadow */
.foundation-shadow {
  position: absolute;
  bottom: 30px;
  left: 20%;
  width: 60%;
  height: 15px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, transparent 80%);
  pointer-events: none;
  z-index: 1;
}

.device-svg {
  position: relative;
  width: 100%;
  height: calc(100% - 35px);
  z-index: 2;
  overflow: visible;
}

.isometric-group {
  transition: all 0.3s ease;
}

/* Animations */
.neon-ring {
  animation: ring-pulse 2s ease-in-out infinite alternate;
}
@keyframes ring-pulse {
  from { stroke: #0284c7; filter: drop-shadow(0 0 1px #0284c7); }
  to { stroke: #38bdf8; filter: drop-shadow(0 0 5px #38bdf8); }
}

.fan-spin {
  animation: rotate-blade 2s linear infinite;
  transform-origin: center;
}
@keyframes rotate-blade {
  to { transform: rotate(360deg); }
}

.drill-led {
  animation: led-flash 1.2s steps(2, start) infinite;
}
@keyframes led-flash {
  to { visibility: hidden; }
}

.gauge-fluid {
  animation: fluid-pulse 3s ease-in-out infinite alternate;
  transform-origin: bottom;
}
@keyframes fluid-pulse {
  from { transform: scaleY(0.8); }
  to { transform: scaleY(1); }
}

.sifter-vibrate {
  animation: shake 0.25s linear infinite;
}
@keyframes shake {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(1px, -0.5px) rotate(0.1deg); }
  50% { transform: translate(-0.5px, 1px) rotate(-0.1deg); }
  75% { transform: translate(-1px, -0.5px) rotate(0.1deg); }
  100% { transform: translate(1px, 1px) rotate(0deg); }
}

.pipe-flow-1 {
  animation: pipe-shuttle 1.8s linear infinite;
}
@keyframes pipe-shuttle {
  to { stroke-dashoffset: -36; }
}

/* Info overlay styling inside component card */
.info-overlay {
  width: 100%;
  text-align: center;
  z-index: 3;
}

.name-text {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
}

.metric-text {
  font-size: 12px;
  font-weight: bold;
}
.metric-text .value {
  color: #38bdf8;
}
.metric-text .unit {
  color: #64748b;
  font-size: 9px;
  margin-left: 2px;
}

/* Status Indicator Beacon */
.status-beacon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  z-index: 10;
}
.status-beacon.running {
  background-color: #10b981;
  box-shadow: 0 0 10px #10b981;
}
.status-beacon.warning {
  background-color: #fbbf24;
  box-shadow: 0 0 10px #fbbf24;
}
.status-beacon.stopped {
  background-color: #ef4444;
  box-shadow: 0 0 10px #ef4444;
}

/* Sci-fi tooltips */
.device-tooltip {
  position: absolute;
  top: 15px;
  left: 102%;
  width: 190px;
  background: rgba(8, 14, 28, 0.95);
  border: 1px solid rgba(56, 189, 248, 0.45);
  border-radius: 6px;
  padding: 10px 12px;
  box-shadow: 
    0 10px 25px -5px rgba(0, 0, 0, 0.85),
    0 0 15px rgba(56, 189, 248, 0.2);
  backdrop-filter: blur(8px);
  z-index: 100;
  pointer-events: none;
  transition: all 0.25s ease-out;
}

.tooltip-corner {
  position: absolute;
  width: 4px;
  height: 4px;
  border-color: #38bdf8;
  border-style: solid;
}
.tooltip-corner.tl { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
.tooltip-corner.tr { top: -1px; right: -1px; border-width: 1px 1px 0 0; }
.tooltip-corner.bl { bottom: -1px; left: -1px; border-width: 0 0 1px 1px; }
.tooltip-corner.br { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: bold;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
  padding-bottom: 6px;
  margin-bottom: 6px;
  letter-spacing: 0.05em;
}

.tooltip-led {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.tooltip-led.running { background: #10b981; box-shadow: 0 0 5px #10b981; }
.tooltip-led.warning { background: #fbbf24; box-shadow: 0 0 5px #fbbf24; }
.tooltip-led.stopped { background: #ef4444; box-shadow: 0 0 5px #ef4444; }

.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9.5px;
}

.tooltip-row .lbl {
  color: #64748b;
}

.tooltip-row .val {
  color: #cbd5e1;
  font-weight: 500;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateX(-5px);
}
</style>
