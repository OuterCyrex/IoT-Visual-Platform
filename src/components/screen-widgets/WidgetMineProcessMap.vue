<template>
  <div class="mine-process-map" :class="{ 'has-data': hasData }">
    <!-- Grid Backdrop & Volumetric Glow -->
    <div class="grid-overlay"></div>
    <div class="volumetric-light light-1"></div>
    <div class="volumetric-light light-2"></div>

    <!-- Floating Dust Particles -->
    <div class="dust-container">
      <div class="dust" v-for="n in 12" :key="n" :style="getDustStyle(n)"></div>
    </div>

    <!-- Isometric SVG -->
    <svg viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg" class="isometric-svg select-none">
      <defs>
        <!-- Gradients -->
        <linearGradient id="metalCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="30%" stop-color="#475569" />
          <stop offset="70%" stop-color="#334155" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>

        <linearGradient id="neonCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#0369a1" />
        </linearGradient>

        <linearGradient id="goldOreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0.2" />
        </linearGradient>

        <!-- Filters for Neon Glow -->
        <filter id="laserGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="5" flood-color="#000000" flood-opacity="0.6" />
        </filter>
      </defs>

      <!-- 1. Equipment Shadows -->
      <ellipse cx="300" cy="190" rx="35" ry="12" fill="black" opacity="0.4" /> <!-- 竖井原煤仓 shadow -->
      <ellipse cx="150" cy="380" rx="40" ry="15" fill="black" opacity="0.4" /> <!-- 采矿区 shadow -->
      <ellipse cx="430" cy="285" rx="30" ry="10" fill="black" opacity="0.4" /> <!-- 筛分中仓 shadow -->
      <ellipse cx="510" cy="275" rx="30" ry="10" fill="black" opacity="0.4" /> <!-- 地面原煤仓 shadow -->
      <ellipse cx="680" cy="300" rx="30" ry="10" fill="black" opacity="0.4" /> <!-- 精矿仓 shadow -->
      <ellipse cx="740" cy="350" rx="25" ry="8" fill="black" opacity="0.4" />  <!-- 混煤仓 shadow -->

      <!-- 2. Conveyor Belt Network (Flowing Lines) -->
      <!-- Cave -> Plate Feeder -->
      <path d="M 180 340 L 290 270" stroke="#334155" stroke-width="4" stroke-linecap="round" />
      <path d="M 180 340 L 290 270" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6 14" class="pipe-flow-1" stroke-linecap="round" filter="url(#laserGlow)" />

      <!-- Plate Feeder -> Sifter -->
      <path d="M 330 240 L 400 200" stroke="#334155" stroke-width="4" stroke-linecap="round" />
      <path d="M 330 240 L 400 200" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 14" class="pipe-flow-1" stroke-linecap="round" />

      <!-- Sifter -> Middle Silo -->
      <path d="M 430 200 L 510 240" stroke="#334155" stroke-width="4.5" stroke-linecap="round" />
      <path d="M 430 200 L 510 240" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6 14" class="pipe-flow-1" stroke-linecap="round" />

      <!-- Middle Silo -> Silo A -->
      <path d="M 520 250 L 660 300" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="5 15" class="laser-beam-1" filter="url(#laserGlow)" />
      <!-- Middle Silo -> Silo B -->
      <path d="M 520 250 L 720 340" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="5 15" class="laser-beam-1" filter="url(#laserGlow)" />


      <!-- 3. DETAILED MODELS -->

      <!-- 采矿区 101 工作面 -->
      <g class="iso-node-group iso-node" filter="url(#softShadow)" transform="translate(100, 290)" @mouseenter="hoveredNode = 'mining'" @mouseleave="hoveredNode = null">
        <path d="M 10 50 L 25 15 L 75 0 L 125 15 L 140 50 Z" fill="#334155" stroke="#475569" stroke-width="1.5" />
        <path d="M 30 50 L 45 25 L 105 25 L 120 50 Z" fill="#020617" />
        <!-- Glowing light indicator -->
        <polygon points="75,-10 60,-35 90,-35" fill="url(#neonCyanGrad)" opacity="0.3" filter="url(#laserGlow)" class="cone-glow" />
        <circle cx="75" cy="-10" r="3.5" fill="#38bdf8" class="drill-led" />
        <!-- Labels -->
        <rect x="15" y="58" width="120" height="20" rx="3" fill="#020617" fill-opacity="0.8" stroke="#1e293b" />
        <text x="75" y="72" class="lbl-name">采矿区 101 工作面</text>
        <rect x="35" y="82" width="80" height="16" rx="2" fill="#0f172a" stroke="#0ea5e9" stroke-width="1" />
        <text x="75" y="94" class="lbl-val font-mono text-cyan-400">{{ miningRate }} Hz</text>
      </g>

      <!-- 振动放矿机2号 & 竖井矿石仓 -->
      <g class="iso-node-group" filter="url(#softShadow)" transform="translate(240, 100)">
        <!-- Cylinder 1 -->
        <ellipse cx="40" cy="12" rx="25" ry="10" fill="#475569" stroke="#334155" />
        <path d="M 15 12 A 25 10 0 0 0 65 12 L 65 50 A 25 10 0 0 1 15 50 Z" fill="url(#metalCylinder)" stroke="#1e293b" />
        <path d="M 15 50 A 25 10 0 0 0 65 50 L 40 68 Z" fill="#1e293b" stroke="#334155" />
        <!-- Text labels -->
        <rect x="-10" y="75" width="100" height="20" rx="3" fill="#020617" fill-opacity="0.8" stroke="#1e293b" />
        <text x="40" y="89" class="lbl-name">竖井矿石仓</text>
        <rect x="15" y="98" width="50" height="15" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="0.8" />
        <text x="40" y="109" class="lbl-val font-mono text-sky-400">64 m</text>
      </g>

      <!-- 重力分选分析塔 (中央塔身) -->
      <g class="iso-node-group iso-node" filter="url(#softShadow)" transform="translate(370, 90)" @mouseenter="hoveredNode = 'screening'" @mouseleave="hoveredNode = null">
        <rect x="20" y="30" width="50" height="90" fill="url(#metalCylinder)" stroke="#1e293b" />
        <path d="M 20 30 C 20 15, 70 15, 70 30 Z" fill="#475569" stroke="#334155" />
        <ellipse cx="45" cy="10" rx="26" ry="8" fill="none" stroke="#38bdf8" stroke-width="2" class="neon-ring" filter="url(#laserGlow)" />
        <!-- Valve bypassed pipe -->
        <path d="M 20 50 L 8 50 L 8 95 L 20 95" fill="none" stroke="#334155" stroke-width="4.5" />
        <circle cx="8" cy="72" r="5" fill="#64748b" />
        <!-- Sifter fan blade windows -->
        <circle cx="45" cy="55" r="11" fill="#020617" stroke="#1e293b" />
        <g transform="translate(45, 55)" class="fan-spin">
          <path d="M -9 0 L 9 0 M 0 -9 L 0 9" stroke="#38bdf8" stroke-width="2" />
        </g>
        <!-- Windows 2 -->
        <circle cx="45" cy="85" r="11" fill="#020617" stroke="#1e293b" />
        <g transform="translate(45, 85)" class="fan-spin">
          <path d="M -9 0 L 9 0 M 0 -9 L 0 9" stroke="#38bdf8" stroke-width="2" />
        </g>
        <!-- Text badges -->
        <rect x="-15" y="130" width="120" height="20" rx="3" fill="#020617" fill-opacity="0.8" stroke="#1e293b" />
        <text x="45" y="144" class="lbl-name">重力分选分析塔</text>
        <rect x="-5" y="153" width="100" height="16" rx="2" fill="#0f172a" stroke="#10b981" stroke-width="0.8" />
        <text x="45" y="165" class="lbl-val text-emerald-400">运行良好 (96%)</text>
      </g>

      <!-- 筛分及配煤中仓 -->
      <g class="iso-node-group" filter="url(#softShadow)" transform="translate(480, 150)">
        <ellipse cx="30" cy="10" rx="20" ry="8" fill="#475569" stroke="#334155" />
        <path d="M 10 10 A 20 8 0 0 0 50 10 L 50 40 A 20 8 0 0 1 10 40 Z" fill="url(#metalCylinder)" stroke="#1e293b" />
        <path d="M 10 40 A 20 8 0 0 0 50 40 L 30 55 Z" fill="#1e293b" />
        <!-- Badges -->
        <rect x="-20" y="65" width="100" height="20" rx="3" fill="#020617" fill-opacity="0.8" stroke="#1e293b" />
        <text x="30" y="79" class="lbl-name">筛分及配煤中仓</text>
        <rect x="5" y="88" width="50" height="15" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="0.8" />
        <text x="30" y="99" class="lbl-val text-sky-400">64 m</text>
      </g>

      <!-- 地面原煤仓 -->
      <g class="iso-node-group" filter="url(#softShadow)" transform="translate(560, 180)">
        <ellipse cx="30" cy="10" rx="20" ry="8" fill="#475569" stroke="#334155" />
        <path d="M 10 10 A 20 8 0 0 0 50 10 L 50 42 A 20 8 0 0 1 10 42 Z" fill="url(#metalCylinder)" stroke="#1e293b" />
        <path d="M 10 42 A 20 8 0 0 0 50 42 L 30 58 Z" fill="#1e293b" />
        <!-- Badges -->
        <rect x="-20" y="65" width="100" height="20" rx="3" fill="#020617" fill-opacity="0.8" stroke="#1e293b" />
        <text x="30" y="79" class="lbl-name">地面原煤仓</text>
        <rect x="5" y="88" width="50" height="15" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="0.8" />
        <text x="30" y="99" class="lbl-val text-sky-400">64 m</text>
      </g>

      <!-- 精矿筒仓 A (上方较大) -->
      <g class="iso-node-group iso-node" filter="url(#softShadow)" transform="translate(640, 220)" @mouseenter="hoveredNode = 'silo_a'" @mouseleave="hoveredNode = null">
        <ellipse cx="35" cy="12" rx="22" ry="9" fill="#475569" stroke="#334155" />
        <path d="M 13 12 A 22 9 0 0 0 57 12 L 57 52 A 22 9 0 0 1 13 52 Z" fill="url(#metalCylinder)" stroke="#1e293b" />
        <path d="M 13 52 A 22 9 0 0 0 57 52 L 35 70 Z" fill="#1e293b" />
        <!-- Fluid gauge -->
        <rect x="33" y="20" width="4" height="25" rx="1" fill="#020617" />
        <rect x="34" y="24" width="2" height="20" rx="0.5" fill="#38bdf8" class="gauge-fluid" />
        <!-- Badges -->
        <rect x="-10" y="80" width="90" height="20" rx="3" fill="#020617" fill-opacity="0.8" stroke="#1e293b" />
        <text x="35" y="94" class="lbl-name">精矿筒仓 A</text>
        <rect x="10" y="103" width="50" height="15" rx="2" fill="#0f172a" stroke="#0ea5e9" stroke-width="0.8" />
        <text x="35" y="114" class="lbl-val font-mono text-sky-400">{{ siloALevel }}%</text>
      </g>

      <!-- 副矿筒仓 B (下方较小) -->
      <g class="iso-node-group iso-node" filter="url(#softShadow)" transform="translate(710, 275)" @mouseenter="hoveredNode = 'silo_b'" @mouseleave="hoveredNode = null">
        <ellipse cx="25" cy="9" rx="17" ry="7" fill="#1e293b" stroke="#0ea5e9" stroke-dasharray="2 2" />
        <path d="M 8 9 A 17 7 0 0 0 42 9 L 42 38 A 17 7 0 0 1 8 38 Z" fill="rgba(15, 23, 42, 0.7)" stroke="#0ea5e9" stroke-dasharray="3 3" />
        <path d="M 8 38 A 17 7 0 0 0 42 38 L 25 52 Z" stroke="#0284c7" stroke-dasharray="3 3" />
        <!-- Gold ore heap -->
        <path d="M 12 36 Q 25 18, 38 36 Z" fill="url(#goldOreGrad)" stroke="#ca8a04" />
        <!-- Badges -->
        <rect x="-20" y="62" width="90" height="20" rx="3" fill="#020617" fill-opacity="0.8" stroke="#1e293b" />
        <text x="25" y="76" class="lbl-name">副矿筒仓 B</text>
        <rect x="0" y="85" width="50" height="15" rx="2" fill="#0f172a" stroke="#ca8a04" stroke-width="0.8" />
        <text x="25" y="96" class="lbl-val font-mono text-yellow-500">54.2%</text>
      </g>
    </svg>

    <!-- Floating Interactive Tooltip Overlay -->
    <transition name="fade">
      <div v-if="hoveredNode" class="mine-tooltip" :style="tooltipStyle">
        <!-- Corner decorations -->
        <div class="tooltip-corner tl"></div>
        <div class="tooltip-corner tr"></div>
        <div class="tooltip-corner bl"></div>
        <div class="tooltip-corner br"></div>

        <template v-if="hoveredNode === 'mining'">
          <div class="tooltip-header">
            <span class="tooltip-led pulse-blue"></span>
            <span>101 采矿工作面 运行监测</span>
          </div>
          <div class="tooltip-body">
            <div class="tooltip-row"><span class="lbl">工作面风速:</span><span class="val">2.8 m/s</span></div>
            <div class="tooltip-row"><span class="lbl">瓦斯涌出量:</span><span class="val">0.12%</span></div>
            <div class="tooltip-row"><span class="lbl">钻探机负载:</span><span class="val">85 A</span></div>
            <div class="tooltip-row"><span class="lbl">采集频率:</span><span class="val text-cyan-400 font-mono">{{ miningRate }} Hz</span></div>
            <div class="tooltip-row"><span class="lbl">运行状态:</span><span class="val text-emerald-400">稳定运行</span></div>
          </div>
        </template>

        <template v-if="hoveredNode === 'screening'">
          <div class="tooltip-header">
            <span class="tooltip-led pulse-green"></span>
            <span>重力分选分析塔 状态</span>
          </div>
          <div class="tooltip-body">
            <div class="tooltip-row"><span class="lbl">分离室压力:</span><span class="val">1.24 MPa</span></div>
            <div class="tooltip-row"><span class="lbl">入料总流量:</span><span class="val">320 m³/h</span></div>
            <div class="tooltip-row"><span class="lbl">离心叶转速:</span><span class="val">1450 rpm</span></div>
            <div class="tooltip-row"><span class="lbl">振动筛频:</span><span class="val">48 Hz</span></div>
            <div class="tooltip-row"><span class="lbl">系统综合指数:</span><span class="val text-emerald-400">良好 (96%)</span></div>
          </div>
        </template>

        <template v-if="hoveredNode === 'silo_a'">
          <div class="tooltip-header">
            <span class="tooltip-led pulse-blue"></span>
            <span>精矿储仓 A 容量明细</span>
          </div>
          <div class="tooltip-body">
            <div class="tooltip-row"><span class="lbl">储矿总重量:</span><span class="val">8,240 t</span></div>
            <div class="tooltip-row"><span class="lbl">有效仓容度:</span><span class="val">15,000 m³</span></div>
            <div class="tooltip-row"><span class="lbl">液位探测高:</span><span class="val">14.8 m</span></div>
            <div class="tooltip-row"><span class="lbl">当前库存比:</span><span class="val text-sky-400 font-mono">{{ siloALevel }}%</span></div>
          </div>
        </template>

        <template v-if="hoveredNode === 'silo_b'">
          <div class="tooltip-header">
            <span class="tooltip-led pulse-yellow"></span>
            <span>副矿混煤仓 B 明细</span>
          </div>
          <div class="tooltip-body">
            <div class="tooltip-row"><span class="lbl">堆积储矿重:</span><span class="val">3,120 t</span></div>
            <div class="tooltip-row"><span class="lbl">有效仓容度:</span><span class="val">8,000 m³</span></div>
            <div class="tooltip-row"><span class="lbl">堆积孔隙率:</span><span class="val">38%</span></div>
            <div class="tooltip-row"><span class="lbl">当前库存比:</span><span class="val text-yellow-500 font-mono">54.2%</span></div>
          </div>
        </template>
      </div>
    </transition>

    <!-- Overlay process summary details -->
    <div class="process-legend select-none">
      <div class="legend-title">智慧矿山输送控制流程</div>
      <div class="legend-grid">
        <div class="legend-item">
          <span class="indicator bg-cyan-500 shadow-[0_0_8px_#38bdf8]"></span>
          <span>输送皮带流 (发光传输)</span>
        </div>
        <div class="legend-item">
          <span class="indicator bg-blue-600 shadow-[0_0_8px_#2563eb]"></span>
          <span>物料分流射线 (脉冲流)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
const hoveredNode = ref<string | null>(null)

const firstRow = computed(() => {
  if (hasData.value) {
    return props.rows[0] ?? {}
  }
  return {}
})

// Dynamic rates and readings
const miningRate = computed(() => {
  if (hasData.value) {
    const val = firstRow.value[props.yField!]
    if (typeof val === 'number') {
      return val.toFixed(1)
    }
    return String(val ?? '62.0')
  }
  return '62.0'
})

const siloALevel = computed(() => {
  if (hasData.value) {
    const temp = Number(firstRow.value.temperature)
    if (Number.isFinite(temp)) {
      return Math.min(100, Math.max(10, Math.round(temp * 1.2)))
    }
  }
  return '64'
})

// Dynamic tooltip positions inside viewBox proportions
const tooltipStyle = computed(() => {
  if (hoveredNode.value === 'mining') return { left: '26%', top: '35%' }
  if (hoveredNode.value === 'screening') return { left: '56%', top: '15%' }
  if (hoveredNode.value === 'silo_a') return { left: '56%', top: '24%' }
  if (hoveredNode.value === 'silo_b') return { left: '50%', top: '50%' }
  return { display: 'none' }
})

function getDustStyle(n: number) {
  const delays = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5]
  const lefts = [15, 30, 45, 60, 75, 88, 22, 38, 54, 70, 82, 94]
  const tops = [20, 40, 18, 62, 28, 70, 78, 24, 48, 82, 32, 58]
  return {
    left: `${lefts[n - 1]}%`,
    top: `${tops[n - 1]}%`,
    animationDelay: `${delays[n - 1]}s`,
    opacity: 0.15 + (n % 4) * 0.1
  }
}
</script>

<style scoped>
.mine-process-map {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, rgba(13, 27, 56, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.9),
    inset 0 0 45px rgba(56, 189, 248, 0.12);
}

/* Grid Backdrop */
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(56, 189, 248, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.02) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
  z-index: 1;
}

/* Volumetric light effects */
.volumetric-light {
  position: absolute;
  width: 400px;
  height: 450px;
  background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.08) 0%, transparent 70%);
  transform: rotate(-25deg);
  pointer-events: none;
  z-index: 1;
  filter: blur(25px);
}

.volumetric-light.light-1 {
  top: -120px;
  left: 90px;
}

.volumetric-light.light-2 {
  bottom: -60px;
  right: 60px;
  background: radial-gradient(ellipse at center, rgba(37, 99, 235, 0.05) 0%, transparent 70%);
}

/* Floating Dust System */
.dust-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.dust {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #38bdf8;
  border-radius: 50%;
  filter: blur(0.5px);
  animation: float-particle 8s linear infinite;
}

@keyframes float-particle {
  0% {
    transform: translate(0, 30px) scale(0.5);
    opacity: 0;
  }
  20% { opacity: 0.7; }
  80% { opacity: 0.5; }
  100% {
    transform: translate(40px, -80px) scale(1.2);
    opacity: 0;
  }
}

.isometric-svg {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 3;
  overflow: visible;
}

/* Zoom / scale animation for hover */
.iso-node {
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-box: fill-box;
  transform-origin: center;
}
.iso-node:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.3));
}

/* Flow Line conveyor belts */
.pipe-flow-1 {
  animation: pipe-shuttle 1.8s linear infinite;
}

@keyframes pipe-shuttle {
  to { stroke-dashoffset: -32; }
}

.laser-beam-1 {
  animation: laser-pulse-1 1.2s linear infinite;
}

@keyframes laser-pulse-1 {
  to { stroke-dashoffset: -20; }
}

/* Typography styles for labels */
.lbl-name {
  fill: #94a3b8;
  font-size: 10px;
  font-weight: 500;
  text-anchor: middle;
  letter-spacing: 0.03em;
  pointer-events: none;
}

.lbl-val {
  font-size: 10.5px;
  font-weight: bold;
  text-anchor: middle;
  pointer-events: none;
}

/* Element Spinning Animations */
.fan-spin {
  animation: rotate-blade 2s linear infinite;
  transform-origin: 0px 0px;
}

@keyframes rotate-blade {
  to { transform: rotate(360deg); }
}

/* Hover Cone indicator pulse */
.cone-glow {
  animation: float-cone 1.5s ease-in-out infinite alternate;
  transform-origin: center;
}

@keyframes float-cone {
  from { transform: translateY(0); opacity: 0.25; }
  to { transform: translateY(-4px); opacity: 0.5; }
}

.drill-led {
  animation: led-flash 1.2s steps(2, start) infinite;
}

@keyframes led-flash {
  to { visibility: hidden; }
}

.neon-ring {
  animation: ring-pulse 2s ease-in-out infinite alternate;
  transform-origin: center;
}

@keyframes ring-pulse {
  from { stroke: #0284c7; filter: drop-shadow(0 0 2px #0284c7); }
  to { stroke: #38bdf8; filter: drop-shadow(0 0 6px #38bdf8); }
}

/* Sci-Fi Tooltip Overlay Styles */
.mine-tooltip {
  position: absolute;
  width: 190px;
  background: rgba(8, 14, 28, 0.95);
  border: 1px solid rgba(56, 189, 248, 0.45);
  border-radius: 6px;
  padding: 10px 12px;
  box-shadow: 
    0 10px 25px -5px rgba(0, 0, 0, 0.85),
    0 0 15px rgba(56, 189, 248, 0.2),
    inset 0 0 10px rgba(56, 189, 248, 0.12);
  backdrop-filter: blur(8px);
  z-index: 10;
  pointer-events: none;
  transition: all 0.25s ease-out;
}

/* Tooltip Corner Anchors */
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

.tooltip-led.pulse-blue { background: #38bdf8; box-shadow: 0 0 5px #38bdf8; }
.tooltip-led.pulse-green { background: #10b981; box-shadow: 0 0 5px #10b981; }
.tooltip-led.pulse-yellow { background: #f59e0b; box-shadow: 0 0 5px #f59e0b; }

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

/* Vue Transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(5px);
}

/* Legend styling */
.process-legend {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.2);
  padding: 10px 14px;
  border-radius: 8px;
  backdrop-filter: blur(8px);
  z-index: 4;
}

.legend-title {
  font-size: 11px;
  color: #cbd5e1;
  font-weight: bold;
  margin-bottom: 6px;
  letter-spacing: 0.05em;
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
