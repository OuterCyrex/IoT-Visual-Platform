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
          <stop offset="0%" stop-color="#eab308" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#ca8a04" stop-opacity="0.2" />
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

      <!-- 1. Equipment Ground Shadows & Concrete Bases -->
      <!-- Shadow under Cave -->
      <ellipse cx="160" cy="370" rx="90" ry="30" fill="black" opacity="0.4" />
      <!-- Shadow under Tower -->
      <ellipse cx="400" cy="275" rx="85" ry="25" fill="black" opacity="0.5" />
      <!-- Concrete Base under Sifter Tower -->
      <g transform="translate(320, 240)">
        <path d="M 0 15 L 80 0 L 160 15 L 80 30 Z" fill="#334155" stroke="#1e293b" />
        <path d="M 0 15 L 80 30 L 80 40 L 0 25 Z" fill="#1e293b" />
        <path d="M 160 15 L 80 30 L 80 40 L 160 25 Z" fill="#0f172a" />
      </g>
      
      <!-- Shadows under Silos -->
      <ellipse cx="650" cy="180" rx="55" ry="18" fill="black" opacity="0.4" />
      <ellipse cx="585" cy="350" rx="50" ry="16" fill="black" opacity="0.4" />

      <!-- 2. Conveyor Pipes with Flowing Particles -->
      <!-- Pipe 1: Cave to Sifter -->
      <g>
        <path d="M 200 325 L 360 215" stroke="rgba(15, 23, 42, 0.8)" stroke-width="8" stroke-linecap="round" />
        <path d="M 200 325 L 360 215" stroke="#334155" stroke-width="6" stroke-linecap="round" />
        <!-- Glowing Inner Core -->
        <path d="M 200 325 L 360 215" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" opacity="0.6" />
        <!-- Flowing dots -->
        <path d="M 200 325 L 360 215" stroke="#38bdf8" stroke-width="3" stroke-dasharray="8 20" class="pipe-flow-1" stroke-linecap="round" filter="url(#laserGlow)" />
      </g>

      <!-- Ray 2: Sifter to Silo A -->
      <g>
        <path d="M 440 210 L 610 155" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="5 15" class="laser-beam-1" filter="url(#laserGlow)" />
        <path d="M 440 210 L 610 155" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2 30" class="laser-beam-2" filter="url(#laserGlow)" />
      </g>

      <!-- Ray 3: Sifter to Silo B -->
      <g>
        <path d="M 430 220 L 550 310" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="5 15" class="laser-beam-1" filter="url(#laserGlow)" />
        <path d="M 430 220 L 550 310" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2 30" class="laser-beam-2" filter="url(#laserGlow)" />
      </g>


      <!-- 3. NODE 1: 采矿区 101 工作面 (Left) -->
      <g class="iso-node-group" filter="url(#softShadow)">
        <!-- Hoverable Zone -->
        <g transform="translate(70, 260)">
          <!-- Cave Rock Structure -->
          <path d="M 10 70 L 30 20 L 90 0 L 150 20 L 170 70 Z" fill="#1e293b" stroke="#334155" stroke-width="2" />
          <!-- Cave Entrance (Dark Interior) -->
          <path d="M 40 70 L 55 35 L 125 35 L 140 70 Z" fill="#020617" />
          <!-- Support Steel Beam struts -->
          <path d="M 37 70 L 52 32 L 128 32 L 143 70" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" />
          <path d="M 47 70 L 59 38 L 121 38 L 133 70" fill="none" stroke="#475569" stroke-width="3" stroke-linejoin="round" />
          <!-- Spiral Drill Shaft (Rotating) -->
          <g transform="translate(90, 52)">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#334155" stroke="#475569" />
            <path d="M -14 0 L -4 18 L 4 18 L 14 0 Z" fill="#94a3b8" class="spinning-drill" />
            <line x1="0" y1="-10" x2="0" y2="18" stroke="#cbd5e1" stroke-width="3" />
          </g>
        </g>

        <!-- Hovering Glowing Cone -->
        <g transform="translate(160, 205)">
          <polygon points="0,0 -16,-45 16,-45" fill="url(#neonCyanGrad)" opacity="0.35" class="cone-glow" filter="url(#laserGlow)" />
          <ellipse cx="0" cy="-45" rx="16" ry="5" fill="#38bdf8" opacity="0.6" filter="url(#laserGlow)" />
          <circle cx="0" cy="0" r="4" fill="#38bdf8" filter="url(#laserGlow)" class="drill-led" />
        </g>

        <!-- Labels -->
        <g transform="translate(160, 365)">
          <rect x="-70" y="-12" width="140" height="24" rx="4" fill="#020617" fill-opacity="0.8" stroke="#1e293b" />
          <text x="0" y="4" class="lbl-name">采矿区 101 工作面</text>
        </g>
        <g transform="translate(160, 395)">
          <rect x="-45" y="-10" width="90" height="20" rx="3" fill="#0f172a" stroke="#0ea5e9" stroke-width="1" />
          <text x="0" y="4" class="lbl-val font-mono text-cyan-400">{{ miningRate }} Hz</text>
        </g>
      </g>


      <!-- 4. NODE 2: 重力分选分析塔 (Center) -->
      <g class="iso-node-group" filter="url(#softShadow)">
        <g transform="translate(340, 80)">
          <!-- Main Sifter Tower Body (Metal gradient) -->
          <rect x="30" y="40" width="60" height="110" fill="url(#metalCylinder)" stroke="#1e293b" />
          <!-- Tower Cap Dome -->
          <path d="M 30 40 C 30 20, 90 20, 90 40 Z" fill="#475569" stroke="#334155" />
          
          <!-- Suspended Glowing Ring Halo above sifter dome -->
          <ellipse cx="60" cy="15" rx="32" ry="9" fill="none" stroke="#38bdf8" stroke-width="3" filter="url(#laserGlow)" class="neon-ring" />
          <ellipse cx="60" cy="15" rx="32" ry="9" fill="none" stroke="#0ea5e9" stroke-width="1.5" />

          <!-- Left Side Bypass Pipes -->
          <path d="M 30 60 L 15 60 L 15 120 L 30 120" fill="none" stroke="#334155" stroke-width="6" stroke-linejoin="round" />
          <path d="M 30 60 L 15 60 L 15 120 L 30 120" fill="none" stroke="#0284c7" stroke-width="2" stroke-linejoin="round" />
          <!-- Valve wheel details -->
          <circle cx="15" cy="90" r="7" fill="#64748b" stroke="#334155" />
          <line x1="15" y1="83" x2="15" y2="97" stroke="#0f172a" />
          <line x1="8" y1="90" x2="22" y2="90" stroke="#0f172a" />

          <!-- Window with rotating internal blades -->
          <circle cx="60" cy="75" r="14" fill="#0f172a" stroke="#1e293b" stroke-width="2.5" />
          <g transform="translate(60, 75)" class="fan-spin">
            <path d="M -12 0 L 12 0 M 0 -12 L 0 12" stroke="#38bdf8" stroke-width="2.5" />
            <circle cx="0" cy="0" r="3" fill="#cbd5e1" />
          </g>

          <!-- Window 2 -->
          <circle cx="60" cy="115" r="14" fill="#0f172a" stroke="#1e293b" stroke-width="2.5" />
          <g transform="translate(60, 115)" class="fan-spin">
            <path d="M -12 0 L 12 0 M 0 -12 L 0 12" stroke="#38bdf8" stroke-width="2.5" />
            <circle cx="0" cy="0" r="3" fill="#cbd5e1" />
          </g>

          <!-- Status Indicator LEDs -->
          <circle cx="45" cy="140" r="3" fill="#10b981" class="led-blink-1" />
          <circle cx="60" cy="140" r="3" fill="#10b981" class="led-blink-2" />
          <circle cx="75" cy="140" r="3" fill="#10b981" class="led-blink-3" />
        </g>

        <!-- Labels -->
        <g transform="translate(400, 248)">
          <rect x="-65" y="-12" width="130" height="24" rx="4" fill="#020617" fill-opacity="0.8" stroke="#1e293b" />
          <text x="0" y="4" class="lbl-name">重力分选分析塔</text>
        </g>
        <g transform="translate(400, 276)">
          <rect x="-55" y="-10" width="110" height="20" rx="3" fill="#0f172a" stroke="#10b981" stroke-width="1" />
          <text x="0" y="4" class="lbl-val text-emerald-400">运行良好 (96%)</text>
        </g>
      </g>


      <!-- 5. NODE 3: 精矿筒仓 A (Right Top) -->
      <g class="iso-node-group" filter="url(#softShadow)">
        <g transform="translate(610, 80)">
          <!-- Silo Dome Roof -->
          <ellipse cx="40" cy="15" rx="30" ry="12" fill="#475569" stroke="#334155" />
          <!-- Inspection Hatch cap -->
          <circle cx="40" cy="10" r="6" fill="#1e293b" stroke="#475569" />
          <!-- Main Cylinder body -->
          <path d="M 10 15 A 30 12 0 0 0 70 15 L 70 70 A 30 12 0 0 1 10 70 Z" fill="url(#metalCylinder)" stroke="#1e293b" />
          <!-- Conical discharge bottom -->
          <path d="M 10 70 A 30 12 0 0 0 70 70 L 40 95 Z" fill="#1e293b" stroke="#334155" />

          <!-- Transparent Level Gauge Glass Window -->
          <rect x="37" y="25" width="6" height="35" rx="1.5" fill="#020617" />
          <!-- Level fill percentage -->
          <rect x="38" y="32" width="4" height="27" rx="1" fill="#38bdf8" filter="url(#laserGlow)" class="gauge-fluid" />

          <!-- Scale ticks on the window -->
          <line x1="34" y1="30" x2="37" y2="30" stroke="#cbd5e1" stroke-width="1" />
          <line x1="34" y1="40" x2="37" y2="40" stroke="#cbd5e1" stroke-width="1" />
          <line x1="34" y1="50" x2="37" y2="50" stroke="#cbd5e1" stroke-width="1" />
        </g>

        <!-- Labels -->
        <g transform="translate(650, 192)">
          <rect x="-45" y="-12" width="90" height="24" rx="4" fill="#020617" fill-opacity="0.8" stroke="#1e293b" />
          <text x="0" y="4" class="lbl-name">精矿筒仓 A</text>
        </g>
        <g transform="translate(650, 220)">
          <rect x="-35" y="-10" width="70" height="20" rx="3" fill="#0f172a" stroke="#0ea5e9" stroke-width="1" />
          <text x="0" y="4" class="lbl-val font-mono text-sky-400">{{ siloALevel }}%</text>
        </g>
      </g>


      <!-- 6. NODE 4: 副矿筒仓 B (Right Bottom) -->
      <!-- Dotted Wireframe showing interior ore pile structure -->
      <g class="iso-node-group" filter="url(#softShadow)">
        <g transform="translate(550, 255)">
          <!-- Top dome hatch -->
          <ellipse cx="35" cy="12" rx="25" ry="10" fill="#1e293b" stroke="#0284c7" stroke-dasharray="2 2" />
          
          <!-- Outer Wireframe Cylinder -->
          <path d="M 10 12 A 25 10 0 0 0 60 12 L 60 60 A 25 10 0 0 1 10 60 Z" fill="rgba(15, 23, 42, 0.7)" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3 3" />
          <!-- Cone bottom -->
          <path d="M 10 60 A 25 10 0 0 0 60 60 L 35 80 Z" fill="rgba(2, 6, 23, 0.8)" stroke="#0284c7" stroke-dasharray="3 3" />

          <!-- Golden/Cyan internal pile aggregate -->
          <path d="M 18 55 Q 35 30, 52 55 Z" fill="url(#goldOreGrad)" stroke="#ca8a04" stroke-width="1" />
          <ellipse cx="35" cy="55" rx="17" ry="5" fill="#ca8a04" opacity="0.5" />
        </g>

        <!-- Labels -->
        <g transform="translate(585, 355)">
          <rect x="-45" y="-12" width="90" height="24" rx="4" fill="#020617" fill-opacity="0.8" stroke="#1e293b" />
          <text x="0" y="4" class="lbl-name">副矿筒仓 B</text>
        </g>
        <g transform="translate(585, 383)">
          <rect x="-35" y="-10" width="70" height="20" rx="3" fill="#0f172a" stroke="#ca8a04" stroke-width="1" />
          <text x="0" y="4" class="lbl-val font-mono text-yellow-500">54.2%</text>
        </g>
      </g>
    </svg>

    <!-- Overlay process summary details -->
    <div class="process-legend select-none">
      <div class="legend-title">智慧矿山输送控制流程</div>
      <div class="legend-grid">
        <div class="legend-item">
          <span class="indicator bg-cyan-500 shadow-[0_0_8px_#38bdf8]"></span>
          <span>工作面采集管道 (发光流)</span>
        </div>
        <div class="legend-item">
          <span class="indicator bg-blue-600 shadow-[0_0_8px_#2563eb]"></span>
          <span>重力选分输送线 (脉冲能线)</span>
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

// Dynamic values
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
  if (hasData.value) {
    const temp = Number(firstRow.value.temperature)
    if (Number.isFinite(temp)) {
      return Math.min(100, Math.max(10, Math.round(temp * 1.2)))
    }
  }
  return '82'
})

// Dynamic generator for random floating dust coordinates
function getDustStyle(n: number) {
  const delays = [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.6, 4.0, 4.4]
  const lefts = [12, 28, 42, 58, 72, 85, 18, 35, 52, 66, 80, 92]
  const tops = [25, 45, 15, 65, 30, 75, 80, 20, 50, 85, 35, 60]
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
  background: radial-gradient(circle at 50% 50%, rgba(17, 24, 39, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.8),
    inset 0 0 40px rgba(56, 189, 248, 0.08);
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
  width: 350px;
  height: 400px;
  background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.06) 0%, transparent 70%);
  transform: rotate(-25deg);
  pointer-events: none;
  z-index: 1;
  filter: blur(20px);
}

.volumetric-light.light-1 {
  top: -100px;
  left: 80px;
}

.volumetric-light.light-2 {
  bottom: -50px;
  right: 50px;
  background: radial-gradient(ellipse at center, rgba(37, 99, 235, 0.04) 0%, transparent 70%);
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
  animation: float-particle 7s linear infinite;
}

@keyframes float-particle {
  0% {
    transform: translate(0, 20px) scale(0.6);
    opacity: 0;
  }
  20% {
    opacity: 0.6;
  }
  80% {
    opacity: 0.4;
  }
  100% {
    transform: translate(30px, -60px) scale(1.1);
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

/* Flow Line conveyor belts */
.pipe-flow-1 {
  animation: pipe-shuttle 2s linear infinite;
}

@keyframes pipe-shuttle {
  to {
    stroke-dashoffset: -28;
  }
}

.laser-beam-1 {
  animation: laser-pulse-1 1s linear infinite;
}

.laser-beam-2 {
  animation: laser-pulse-2 0.7s linear infinite;
}

@keyframes laser-pulse-1 {
  to {
    stroke-dashoffset: -20;
  }
}

@keyframes laser-pulse-2 {
  to {
    stroke-dashoffset: -32;
  }
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
  font-size: 11px;
  font-weight: bold;
  text-anchor: middle;
  pointer-events: none;
}

/* Element Spinning Animations */
.spinning-drill {
  animation: twist 1s linear infinite;
  transform-origin: 0px 10px;
}

@keyframes twist {
  0% { transform: scaleX(1); }
  50% { transform: scaleX(-1); }
  100% { transform: scaleX(1); }
}

.fan-spin {
  animation: rotate-blade 1.8s linear infinite;
  transform-origin: 0px 0px;
}

@keyframes rotate-blade {
  to { transform: rotate(360deg); }
}

/* Hover Cone indicator pulse */
.cone-glow {
  animation: float-cone 1.5s ease-in-out infinite alternate;
}

@keyframes float-cone {
  from { transform: translateY(0); opacity: 0.25; }
  to { transform: translateY(-4px); opacity: 0.45; }
}

.drill-led {
  animation: led-flash 1s steps(2, start) infinite;
}

@keyframes led-flash {
  to { visibility: hidden; }
}

/* LED Indicator lights on sifter tower */
.led-blink-1 { animation: pulse-led 1s infinite alternate; }
.led-blink-2 { animation: pulse-led 1.2s infinite alternate 0.2s; }
.led-blink-3 { animation: pulse-led 0.8s infinite alternate 0.4s; }

@keyframes pulse-led {
  from { fill: #047857; opacity: 0.6; }
  to { fill: #10b981; opacity: 1; filter: drop-shadow(0 0 3px #10b981); }
}

.neon-ring {
  animation: ring-pulse 2s ease-in-out infinite alternate;
}

@keyframes ring-pulse {
  from { stroke: #0284c7; filter: drop-shadow(0 0 2px #0284c7); }
  to { stroke: #38bdf8; filter: drop-shadow(0 0 6px #38bdf8); }
}

/* Legend styling */
.process-legend {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.15);
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
