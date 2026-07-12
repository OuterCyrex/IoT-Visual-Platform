<template>
  <div
    class="mine-device-card"
    :class="[deviceType, finalStatus, { hovered: isHovered, 'is-transparent': isTransparent }]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Grid/Shadow foundation backdrop for 2.5D perspective depth -->
    <div class="foundation-shadow" v-if="!isTransparent"></div>

    <!-- Main SVG Render Area -->
    <svg
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="device-svg"
      :class="{ 'is-pipeline': deviceType === 'pipeline' }"
      :style="svgStyle"
      :preserveAspectRatio="deviceType === 'pipeline' ? 'none' : undefined"
    >
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

        <!-- Filters for Neon Glow (Fixed for horizontal/vertical lines using userSpaceOnUse) -->
        <filter :id="'laserGlow-' + id" filterUnits="userSpaceOnUse" x="-50" y="-50" width="300" height="320">
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

      <!-- TYPE 2: SILO_METAL (高反光金属原煤仓 - 深度优化版本) -->
      <g v-if="deviceType === 'silo_metal'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="186" rx="55" ry="16" fill="black" opacity="0.45" />
        
        <!-- Base concrete foundation block -->
        <polygon points="68,180 76,166 124,166 132,180" fill="#334155" stroke="#1e293b" stroke-width="1.2" />
        <polygon points="68,180 132,180 125,186 61,186" fill="#0f172a" opacity="0.7" />

        <!-- Structural Columns with Black/Yellow Safety Chevron Bases (微缩安全斑马线) -->
        <!-- Left Leg -->
        <line x1="75" y1="125" x2="75" y2="175" stroke="#475569" stroke-width="3.5" />
        <rect x="73" y="160" width="4" height="15" fill="#ca8a04" />
        <line x1="73" y1="163" x2="77" y2="167" stroke="#000000" stroke-width="1.2" />
        <line x1="73" y1="169" x2="77" y2="173" stroke="#000000" stroke-width="1.2" />

        <!-- Right Leg -->
        <line x1="125" y1="125" x2="125" y2="175" stroke="#475569" stroke-width="3.5" />
        <rect x="123" y="160" width="4" height="15" fill="#ca8a04" />
        <line x1="123" y1="163" x2="127" y2="167" stroke="#000000" stroke-width="1.2" />
        <line x1="123" y1="169" x2="127" y2="173" stroke="#000000" stroke-width="1.2" />

        <!-- Center discharge drop channel -->
        <line x1="100" y1="125" x2="100" y2="168" stroke="#1e293b" stroke-width="2.5" />
        
        <!-- Cross structural bracing between columns -->
        <line x1="75" y1="135" x2="125" y2="160" stroke="#334155" stroke-width="1.2" />
        <line x1="125" y1="135" x2="75" y2="160" stroke="#334155" stroke-width="1.2" />

        <!-- Cylinder Container -->
        <ellipse cx="100" cy="50" rx="34" ry="12" fill="#475569" stroke="#334155" />
        <path :d="'M 66 50 A 34 12 0 0 0 134 50 L 134 125 A 34 12 0 0 1 66 125 Z'" :fill="'url(#metalCylinder-' + id + ')'" stroke="#1e293b" />
        
        <!-- Discharging cone bottom hopper -->
        <path d="M 66 125 A 34 12 0 0 0 134 125 L 100 152 Z" fill="#1e293b" stroke="#334155" />
        
        <!-- Top intake dome & safety handrails (安全护栏) -->
        <ellipse cx="100" cy="48" rx="34.5" ry="12.5" fill="none" stroke="#64748b" stroke-width="1.5" />
        <line x1="65.5" y1="41" x2="65.5" y2="48" stroke="#64748b" stroke-width="1" />
        <line x1="134.5" y1="41" x2="134.5" y2="48" stroke="#64748b" stroke-width="1" />
        <ellipse cx="100" cy="41" rx="34.5" ry="12.5" fill="none" stroke="#64748b" stroke-width="1" />

        <!-- Vertical Ladder with Cage loops -->
        <path d="M 72 52 L 72 122 M 75 52 L 75 122" stroke="#94a3b8" stroke-width="0.7" />
        <path d="M 72 58 L 75 58 M 72 66 L 75 66 M 72 74 L 75 74 M 72 82 L 75 82 M 72 90 L 75 90 M 72 98 L 75 98 M 72 106 L 75 106 M 72 114 L 75 114" stroke="#94a3b8" stroke-width="0.5" />
        <path d="M 72 62 A 5 5 0 0 0 67 67 M 72 82 A 5 5 0 0 0 67 87 M 72 102 A 5 5 0 0 0 67 107" fill="none" stroke="#475569" stroke-width="0.7" />

        <!-- Glass Level Gauge Column with Measurement ticks (测量刻度线) -->
        <rect x="97" y="58" width="6" height="52" rx="1.5" fill="#090d16" stroke="#334155" stroke-width="0.5" />
        <rect x="99" y="62" width="2" height="44" rx="0.5" fill="#38bdf8" class="gauge-fluid" :filter="'url(#laserGlow-' + id + ')'" />
        <!-- Level ticks -->
        <line x1="95" y1="65" x2="97" y2="65" stroke="#94a3b8" stroke-width="0.6" />
        <line x1="95" y1="75" x2="97" y2="75" stroke="#94a3b8" stroke-width="0.6" />
        <line x1="95" y1="85" x2="97" y2="85" stroke="#94a3b8" stroke-width="0.6" />
        <line x1="95" y1="95" x2="97" y2="95" stroke="#94a3b8" stroke-width="0.6" />
        <line x1="95" y1="105" x2="97" y2="105" stroke="#94a3b8" stroke-width="0.6" />

        <!-- Discharging valve manual wheel -->
        <circle cx="100" cy="152" r="3.5" fill="#ca8a04" stroke="#854d0e" stroke-width="0.8" />
        <line x1="96.5" y1="152" x2="103.5" y2="152" stroke="#854d0e" stroke-width="0.6" />
        <line x1="100" y1="148.5" x2="100" y2="155.5" stroke="#854d0e" stroke-width="0.6" />
      </g>

      <!-- TYPE 3: SILO_CONCRETE (混凝土配煤仓 - 深度优化版本) -->
      <g v-else-if="deviceType === 'silo_concrete'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="188" rx="62" ry="18" fill="black" opacity="0.5" />

        <!-- Concrete Heavy Base Pillars with Chevron stripes -->
        <!-- Left Pillar -->
        <rect x="64" y="125" width="12" height="52" fill="#334155" stroke="#1e293b" />
        <line x1="64" y1="135" x2="76" y2="140" stroke="#000" stroke-width="1.5" />
        <line x1="64" y1="145" x2="76" y2="150" stroke="#000" stroke-width="1.5" />
        <line x1="64" y1="155" x2="76" y2="160" stroke="#000" stroke-width="1.5" />
        
        <!-- Right Pillar -->
        <rect x="124" y="125" width="12" height="52" fill="#334155" stroke="#1e293b" />
        <line x1="124" y1="135" x2="136" y2="140" stroke="#000" stroke-width="1.5" />
        <line x1="124" y1="145" x2="136" y2="150" stroke="#000" stroke-width="1.5" />
        <line x1="124" y1="155" x2="136" y2="160" stroke="#000" stroke-width="1.5" />

        <!-- Concrete Base foundation cap -->
        <polygon points="60,125 100,138 140,125 100,118" fill="#475569" stroke="#1e293b" stroke-width="1" />

        <!-- Wide Concrete Silo Body (High-quality gradient texture) -->
        <ellipse cx="100" cy="45" rx="42" ry="15" fill="#64748b" stroke="#475569" />
        <path :d="'M 58 45 A 42 15 0 0 0 142 45 L 142 120 A 42 15 0 0 1 58 120 Z'" :fill="'url(#towerMetal-' + id + ')'" stroke="#1e293b" />
        
        <!-- Double discharge hopper cones (双出料锥斗 - 非常重工业化) -->
        <!-- Left Hopper -->
        <path d="M 58 120 A 21 7.5 0 0 0 100 120 L 79 140 Z" fill="#1e293b" stroke="#334155" />
        <line x1="79" y1="140" x2="79" y2="150" stroke="#ca8a04" stroke-width="2" />
        
        <!-- Right Hopper -->
        <path d="M 100 120 A 21 7.5 0 0 0 142 120 L 121 140 Z" fill="#1e293b" stroke="#334155" />
        <line x1="121" y1="140" x2="121" y2="150" stroke="#ca8a04" stroke-width="2" />

        <!-- Catwalk/Inspection Platform around concrete center (环形钢构走道) -->
        <ellipse cx="100" cy="90" rx="46" ry="16" fill="none" stroke="#475569" stroke-width="1.5" />
        <!-- Handrail vertical struts -->
        <line x1="54" y1="84" x2="54" y2="90" stroke="#64748b" stroke-width="1" />
        <line x1="146" y1="84" x2="146" y2="90" stroke="#64748b" stroke-width="1" />
        <line x1="100" y1="96" x2="100" y2="106" stroke="#64748b" stroke-width="1" />
        <ellipse cx="100" cy="84" rx="46" ry="16" fill="none" stroke="#64748b" stroke-width="1" />

        <!-- Top intake conveyor box (皮带受料小箱) -->
        <rect x="85" y="20" width="30" height="20" fill="#1e293b" stroke="#334155" stroke-width="1.2" rx="1" />
        <polygon points="85,20 100,10 115,20 100,30" fill="#334155" stroke="#475569" />
        <circle cx="100" cy="20" r="2.5" fill="#38bdf8" class="drill-led" />
      </g>

      <!-- TYPE 4: CRUSHER_JAW (重型颚式破碎机 - 深度优化版本) -->
      <g v-else-if="deviceType === 'crusher_jaw'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="180" rx="60" ry="16" fill="black" opacity="0.5" />

        <!-- Heavy I-Beam Steel Foundation Frame (工字钢底架) -->
        <polygon points="40,172 52,142 148,142 160,172" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
        <!-- Structural bolted corner plates -->
        <circle cx="48" cy="165" r="1.5" fill="#ca8a04" />
        <circle cx="152" cy="165" r="1.5" fill="#ca8a04" />

        <!-- Left Flywheel (Symmetrical Depth) -->
        <g transform="translate(62, 115)" class="fan-spin">
          <circle cx="0" cy="0" r="14" fill="#334155" stroke="#0f172a" stroke-width="1" />
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#475569" stroke-width="2" />
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#475569" stroke-width="2" />
        </g>

        <!-- Main Heavy Cast Steel Chamber (铸钢箱体) -->
        <rect x="58" y="90" width="84" height="56" :fill="'url(#towerMetal-' + id + ')'" stroke="#1e293b" stroke-width="1.5" />
        <polygon points="50,90 100,75 150,90 100,105" fill="#334155" stroke="#1e293b" />

        <!-- Bolted inspection panels on the side -->
        <rect x="70" y="105" width="22" height="26" fill="#1e293b" stroke="#475569" stroke-width="1" />
        <circle cx="73" cy="108" r="1" fill="#cbd5e1" />
        <circle cx="89" cy="108" r="1" fill="#cbd5e1" />
        <circle cx="73" cy="128" r="1" fill="#cbd5e1" />
        <circle cx="89" cy="128" r="1" fill="#cbd5e1" />

        <!-- Heavy Hopper Feed Funnel (加料斗) -->
        <polygon points="62,90 50,50 150,50 138,90" fill="#475569" stroke="#1e293b" stroke-width="1.2" />
        <polygon points="72,90 62,56 138,56 128,90" fill="#0f172a" />
        <!-- Structural ribs on feed hopper -->
        <line x1="75" y1="50" x2="85" y2="90" stroke="#334155" stroke-width="2" />
        <line x1="125" y1="50" x2="115" y2="90" stroke="#334155" stroke-width="2" />

        <!-- Right Main Flywheel (Spinning Pulley) with drive belts -->
        <g transform="translate(138, 115)" class="fan-spin">
          <circle cx="0" cy="0" r="18" :fill="'url(#metalCylinder-' + id + ')'" stroke="#0f172a" stroke-width="1.5" />
          <!-- Spokes -->
          <line x1="-18" y1="0" x2="18" y2="0" stroke="#64748b" stroke-width="3" />
          <line x1="0" y1="-18" x2="0" y2="18" stroke="#64748b" stroke-width="3" />
          <!-- Inner ring -->
          <circle cx="0" cy="0" r="7" fill="#334155" stroke="#0f172a" />
          <circle cx="0" cy="0" r="3" fill="#eab308" />
        </g>
        
        <!-- Safety Wire Mesh Guard on flywheel (半透明防护网) -->
        <path d="M 120 100 A 22 22 0 0 1 158 135 L 120 135 Z" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-dasharray="2 2" stroke-width="0.8" />

        <!-- Hydraulic lubrication tubes & pressure indicator -->
        <path d="M 98 100 L 98 135 L 115 135" fill="none" stroke="#ca8a04" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="98" cy="115" r="3" fill="#030712" stroke="#e11d48" stroke-width="1" /> <!-- Pressure gauge dial -->
        <line x1="98" y1="115" x2="100" y2="113" stroke="#e11d48" stroke-width="0.7" />
      </g>

      <!-- TYPE 5: SIFTER_VIBRATORY (双层智能振动筛 - 深度优化版本) -->
      <g v-else-if="deviceType === 'sifter_vibratory'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="184" rx="65" ry="16" fill="black" opacity="0.45" />

        <!-- 4 Helical coil springs (精细螺旋减震弹簧) -->
        <!-- Front Left Spring -->
        <g transform="translate(58, 140)">
          <path d="M0,0 Q6,3 12,0 Q0,5 12,8 Q0,11 12,14 Q0,17 12,20 M 6,-3 L 6,23" fill="none" stroke="#475569" stroke-width="2.5" />
          <rect x="-2" y="20" width="16" height="4" fill="#1e293b" />
        </g>
        <!-- Front Right Spring -->
        <g transform="translate(130, 140)">
          <path d="M0,0 Q6,3 12,0 Q0,5 12,8 Q0,11 12,14 Q0,17 12,20 M 6,-3 L 6,23" fill="none" stroke="#475569" stroke-width="2.5" />
          <rect x="-2" y="20" width="16" height="4" fill="#1e293b" />
        </g>

        <!-- Sifter body with shake vibration animation -->
        <g class="sifter-vibrate">
          <!-- Main sorting deck angled side plate -->
          <polygon points="45,95 155,55 155,120 45,140" :fill="'url(#towerMetal-' + id + ')'" stroke="#1e293b" stroke-width="1.5" />
          <polygon points="45,95 155,55 130,42 20,82" fill="#475569" stroke="#334155" />

          <!-- Heavy stiffener ribs on side plate -->
          <line x1="75" y1="84" x2="75" y2="128" stroke="#334155" stroke-width="2.5" />
          <line x1="115" y1="69" x2="115" y2="113" stroke="#334155" stroke-width="2.5" />

          <!-- Eccentric Vibrator Unit (双轴激振器 - 核心动力源) -->
          <circle cx="95" cy="98" r="14" fill="#0f172a" stroke="#ca8a04" stroke-width="1.5" />
          <circle cx="95" cy="98" r="8" fill="#3b4252" />
          <rect x="91" y="93" width="8" height="10" fill="#eab308" class="fan-spin" /> <!-- Eccentric block rotating -->

          <!-- Multi-tier mesh screens (inside) -->
          <!-- Top Screen (Coarse) -->
          <line x1="45" y1="110" x2="155" y2="70" stroke="#fbbf24" stroke-dasharray="3 3" stroke-width="2.5" />
          <!-- Bottom Screen (Fine) -->
          <line x1="45" y1="125" x2="155" y2="85" stroke="#38bdf8" stroke-dasharray="2 2" stroke-width="2" />

          <!-- Outlets (排料槽) -->
          <!-- Fine material outlet (Fine coal particles pouring down) -->
          <polygon points="20,82 5,92 5,110 45,115" fill="#19243b" stroke="#334155" />
          
          <!-- Falling materials animation particles -->
          <circle cx="2" cy="115" r="1.5" fill="#38bdf8" class="drill-led" />
          <circle cx="6" cy="120" r="1" fill="#38bdf8" class="drill-led" />
          <circle cx="-1" cy="126" r="1.2" fill="#38bdf8" class="drill-led" />
        </g>
      </g>

      <!-- TYPE 6: CONVEYOR_BELT (标准皮带机) -->
      <g v-else-if="deviceType === 'conveyor_belt'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="180" rx="75" ry="12" fill="black" opacity="0.35" />

        <!-- Heavy Structural Support Girders -->
        <line x1="40" y1="130" x2="40" y2="175" stroke="#475569" stroke-width="3" />
        <line x1="160" y1="75" x2="160" y2="120" stroke="#475569" stroke-width="3" />
        <line x1="40" y1="130" x2="60" y2="175" stroke="#334155" stroke-width="1.5" />
        <line x1="160" y1="75" x2="140" y2="120" stroke="#334155" stroke-width="1.5" />

        <!-- Double Layer Steel Truss Structure -->
        <path d="M 20 145 L 180 75" stroke="#1e293b" stroke-width="4" stroke-linecap="round" />
        <path d="M 20 130 L 180 60" stroke="#334155" stroke-width="5" stroke-linecap="round" />
        
        <!-- Cross lattice bars -->
        <path d="M 20 130 L 50 131 M 50 117 L 80 118 M 80 104 L 110 105 M 110 90 L 140 91 M 140 77 L 170 78" stroke="#475569" stroke-width="1.5" />
        <path d="M 20 130 L 50 117 L 80 104 L 110 90 L 140 77 L 170 64" stroke="#475569" stroke-width="1.2" />
        <path d="M 20 145 L 50 130 L 80 117 L 110 104 L 140 90 L 170 77" stroke="#475569" stroke-width="1.2" />

        <path d="M 22 136 L 178 68" stroke="#090d16" stroke-width="1.8" />

        <!-- Carrying Idlers -->
        <circle cx="45" cy="116" r="2.5" fill="#475569" />
        <circle cx="80" cy="101" r="2.5" fill="#475569" />
        <circle cx="115" cy="86" r="2.5" fill="#475569" />
        <circle cx="150" cy="71" r="2.5" fill="#475569" />

        <!-- Rubber Belt -->
        <path d="M 18 128 L 182 56" stroke="#1e293b" stroke-width="3" stroke-linecap="round" />

        <!-- Flowing material -->
        <path d="M 18 127 L 182 55" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="8 14" class="pipe-flow-1" stroke-linecap="round" :filter="'url(#laserGlow-' + id + ')'" />
        <path d="M 18 128 L 182 56" stroke="#ca8a04" stroke-width="3.5" stroke-dasharray="4 22" class="pipe-flow-1" stroke-linecap="round" />

        <!-- Roller wheels -->
        <circle cx="20" cy="132" r="6" fill="url(#metalCylinder)" stroke="#0f172a" stroke-width="1.5" />
        <circle cx="180" cy="62" r="6" fill="url(#metalCylinder)" stroke="#0f172a" stroke-width="1.5" />
      </g>

      <!-- TYPE 6B: CONVEYOR_BELT_LONG (长型皮带机) -->
      <g v-else-if="deviceType === 'conveyor_belt_long'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="180" rx="90" ry="10" fill="black" opacity="0.3" />

        <!-- 3 Support columns (左、中、右) -->
        <line x1="30" y1="140" x2="30" y2="175" stroke="#475569" stroke-width="2.5" />
        <line x1="100" y1="110" x2="100" y2="155" stroke="#475569" stroke-width="2.5" />
        <line x1="170" y1="80" x2="170" y2="120" stroke="#475569" stroke-width="2.5" />

        <!-- Long Flat steel frame structure -->
        <path d="M 10 152 L 190 77" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" />
        <path d="M 10 140 L 190 65" stroke="#334155" stroke-width="4.5" stroke-linecap="round" />

        <!-- Denser Cross Bracing (更密集的桁架格构) -->
        <path d="M 10 140 L 32 141 M 32 129 L 55 130 M 55 117 L 78 118 M 78 105 L 100 106 M 100 93 L 122 94 M 122 81 L 145 82 M 145 69 L 168 70 M 168 57 L 190 58" stroke="#475569" stroke-width="1.2" />
        <path d="M 10 140 L 32 129 L 55 117 L 78 105 L 100 93 L 122 81 L 145 69 L 168 57 L 190 45" stroke="#475569" stroke-width="1" />

        <!-- Return conveyor strand -->
        <path d="M 12 145 L 188 71" stroke="#090d16" stroke-width="1.5" />

        <!-- Idler rollers -->
        <circle cx="30" cy="131" r="2.2" fill="#475569" />
        <circle cx="55" cy="119" r="2.2" fill="#475569" />
        <circle cx="80" cy="107" r="2.2" fill="#475569" />
        <circle cx="105" cy="95" r="2.2" fill="#475569" />
        <circle cx="130" cy="83" r="2.2" fill="#475569" />
        <circle cx="155" cy="71" r="2.2" fill="#475569" />
        <circle cx="180" cy="59" r="2.2" fill="#475569" />

        <!-- Main conveyor rubber belt -->
        <path d="M 8 138 L 192 61" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" />

        <!-- Material flow (Long) -->
        <path d="M 8 137 L 192 60" stroke="#fbbf24" stroke-width="2" stroke-dasharray="8 12" class="pipe-flow-1" stroke-linecap="round" :filter="'url(#laserGlow-' + id + ')'" />
        <path d="M 8 138 L 192 61" stroke="#ca8a04" stroke-width="3" stroke-dasharray="3 18" class="pipe-flow-1" stroke-linecap="round" />

        <!-- End drums -->
        <circle cx="10" cy="142" r="5" fill="url(#metalCylinder)" stroke="#0f172a" />
        <circle cx="190" cy="67" r="5" fill="url(#metalCylinder)" stroke="#0f172a" />
      </g>

      <!-- TYPE 6C: CONVEYOR_BELT_WIDE (宽型重载皮带机) -->
      <g v-else-if="deviceType === 'conveyor_belt_wide'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="180" rx="80" ry="15" fill="black" opacity="0.4" />

        <!-- Heavy Double Support Pillars on each end -->
        <!-- Left Side double legs -->
        <line x1="36" y1="130" x2="36" y2="175" stroke="#475569" stroke-width="3.5" />
        <line x1="44" y1="130" x2="44" y2="175" stroke="#334155" stroke-width="2.5" />
        <line x1="36" y1="150" x2="44" y2="150" stroke="#334155" stroke-width="1.5" />
        <!-- Right Side double legs -->
        <line x1="156" y1="75" x2="156" y2="120" stroke="#475569" stroke-width="3.5" />
        <line x1="164" y1="75" x2="164" y2="120" stroke="#334155" stroke-width="2.5" />
        <line x1="156" y1="95" x2="164" y2="95" stroke="#334155" stroke-width="1.5" />

        <!-- Heavy Girders (宽体粗槽钢桁架) -->
        <path d="M 20 148 L 180 78" stroke="#1e293b" stroke-width="6" stroke-linecap="round" />
        <path d="M 20 130 L 180 60" stroke="#334155" stroke-width="8" stroke-linecap="round" />
        
        <!-- Double cross lattice braces -->
        <path d="M 20 130 L 50 132 M 50 117 L 80 119 M 80 104 L 110 106" stroke="#475569" stroke-width="2.5" />
        <path d="M 20 130 L 80 117 L 140 104 M 50 130 L 110 117 L 170 104" stroke="#475569" stroke-width="2" />

        <!-- Double return strands -->
        <path d="M 22 138 L 178 70" stroke="#090d16" stroke-width="3" />

        <!-- Heavy rollers -->
        <circle cx="45" cy="115" r="4.5" fill="#475569" stroke="#1e293b" stroke-width="1" />
        <circle cx="80" cy="100" r="4.5" fill="#475569" stroke="#1e293b" stroke-width="1" />
        <circle cx="115" cy="85" r="4.5" fill="#475569" stroke="#1e293b" stroke-width="1" />
        <circle cx="150" cy="70" r="4.5" fill="#475569" stroke="#1e293b" stroke-width="1" />

        <!-- Wide heavy rubber belt -->
        <path d="M 16 126 L 184 54" stroke="#1e293b" stroke-width="5.5" stroke-linecap="round" />

        <!-- Heavy flowing ore stream (Thick and glowing) -->
        <path d="M 16 125 L 184 53" stroke="#fbbf24" stroke-width="4.5" stroke-dasharray="10 15" class="pipe-flow-1" stroke-linecap="round" :filter="'url(#laserGlow-' + id + ')'" />
        <path d="M 16 126 L 184 54" stroke="#ca8a04" stroke-width="5.5" stroke-dasharray="5 20" class="pipe-flow-1" stroke-linecap="round" />

        <!-- Massive head and tail drums -->
        <circle cx="20" cy="130" r="8.5" fill="url(#metalCylinder)" stroke="#0f172a" stroke-width="2" />
        <circle cx="180" cy="60" r="8.5" fill="url(#metalCylinder)" stroke="#0f172a" stroke-width="2" />
      </g>

      <!-- TYPE 7: FEEDER_PLATE (重型板式给料机) -->
      <g v-if="deviceType === 'feeder_plate'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="180" rx="65" ry="14" fill="black" opacity="0.4" />

        <!-- Heavy Support Base Frame -->
        <polygon points="40,165 60,135 140,135 160,165" fill="#334155" stroke="#1e293b" />
        <line x1="50" y1="145" x2="50" y2="170" stroke="#475569" stroke-width="3.5" />
        <line x1="150" y1="145" x2="150" y2="170" stroke="#475569" stroke-width="3.5" />

        <!-- Apron Feeder Body (Overlapping metal plates/pans) -->
        <path d="M 30 135 L 170 85" stroke="#1e293b" stroke-width="12" stroke-linecap="round" />
        <!-- Individual overlapping heavy steel pans -->
        <path d="M 40 132 L 40 138 M 60 125 L 60 131 M 80 118 L 80 124 M 100 111 L 100 117 M 120 104 L 120 110 M 140 97 L 140 103 M 160 90 L 160 96" stroke="#475569" stroke-width="2.5" />

        <!-- Rocks / Ore chunks riding on plates (随着给料机移动) -->
        <g class="pipe-flow-1" style="stroke-dasharray: none;">
          <polygon points="50,118 62,112 58,124" fill="url(#metalCylinder)" stroke="#0f172a" />
          <polygon points="90,104 102,98 98,110" fill="url(#metalCylinder)" stroke="#0f172a" />
          <polygon points="130,90 142,84 138,96" fill="url(#metalCylinder)" stroke="#0f172a" />
        </g>

        <!-- Dynamic ore spill / chute connector -->
        <polygon points="20,135 5,145 10,160 35,145" fill="#0f172a" stroke="#475569" />
      </g>

      <!-- TYPE 8: IRON_REMOVER (悬挂除铁器) -->
      <g v-else-if="deviceType === 'iron_remover'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="180" rx="60" ry="12" fill="black" opacity="0.3" />

        <!-- Gantry / Suspension Steel Support Structure (悬挂架) -->
        <line x1="45" y1="170" x2="45" y2="85" stroke="#475569" stroke-width="3" />
        <line x1="155" y1="170" x2="155" y2="85" stroke="#475569" stroke-width="3" />
        <line x1="45" y1="85" x2="155" y2="85" stroke="#475569" stroke-width="3" />
        <!-- Corner gussets -->
        <line x1="45" y1="105" x2="65" y2="85" stroke="#334155" stroke-width="2" />
        <line x1="155" y1="105" x2="135" y2="85" stroke="#334155" stroke-width="2" />

        <!-- 4 Suspension Chains -->
        <line x1="75" y1="85" x2="75" y2="120" stroke="#94a3b8" stroke-dasharray="2 2" stroke-width="1.5" />
        <line x1="125" y1="85" x2="125" y2="120" stroke="#94a3b8" stroke-dasharray="2 2" stroke-width="1.5" />
        <line x1="85" y1="85" x2="85" y2="123" stroke="#64748b" stroke-dasharray="2 2" stroke-width="1" />
        <line x1="115" y1="85" x2="115" y2="123" stroke="#64748b" stroke-dasharray="2 2" stroke-width="1" />

        <!-- Main Rectangular Electromagnet Box (除铁主箱体) -->
        <polygon points="70,135 130,120 140,135 80,150" fill="url(#metalCylinder)" stroke="#0f172a" stroke-width="1.2" />
        <path d="M 70 135 L 70 142 L 80 157 L 140 142 L 140 135 Z" fill="#334155" stroke="#0f172a" />
        
        <!-- Cross scraper conveyor belt (废铁排出小皮带) -->
        <path d="M 60 144 L 148 128" stroke="#ca8a04" stroke-width="2" stroke-linecap="round" />

        <!-- Magnetic Field Pulsing Glow underneath (除铁器磁场发光) -->
        <polygon points="75,148 125,135 140,165 90,180" fill="rgba(56, 189, 248, 0.22)" class="cone-glow" :filter="'url(#laserGlow-' + id + ')'" />
      </g>

      <!-- TYPE 9: BAGHOUSE_FILTER (脉冲布袋除尘器) -->
      <g v-else-if="deviceType === 'baghouse_filter'" class="isometric-group">
        <!-- Shadows -->
        <ellipse cx="100" cy="188" rx="65" ry="16" fill="black" opacity="0.55" />

        <!-- Heavy Structural Columns -->
        <line x1="55" y1="130" x2="55" y2="182" stroke="#475569" stroke-width="3" />
        <line x1="145" y1="130" x2="145" y2="182" stroke="#475569" stroke-width="3" />
        <line x1="100" y1="130" x2="100" y2="175" stroke="#334155" stroke-width="2" />

        <!-- 3 Pyramidal Hopper Bottoms (除尘灰斗组) -->
        <polygon points="50,130 80,130 70,155 45,155" fill="#1e293b" stroke="#334155" />
        <polygon points="80,130 110,130 100,155 75,155" fill="#1e293b" stroke="#334155" />
        <polygon points="110,130 140,130 130,155 105,155" fill="#1e293b" stroke="#334155" />

        <!-- Main Rectangular Filtering Chamber (箱体大室) -->
        <rect x="50" y="55" width="94" height="75" :fill="'url(#towerMetal-' + id + ')'" stroke="#1e293b" stroke-width="1.5" />
        <polygon points="45,55 97,42 149,55 97,68" fill="#475569" stroke="#1e293b" />

        <!-- Pulse Valve manifold pipes along the top (脉冲喷吹管) -->
        <line x1="55" y1="62" x2="138" y2="62" stroke="#cbd5e1" stroke-width="2.5" />
        <circle cx="70" cy="62" r="1.8" fill="#ef4444" />
        <circle cx="95" cy="62" r="1.8" fill="#ef4444" />
        <circle cx="120" cy="62" r="1.8" fill="#ef4444" />

        <!-- Clean air exhaust fan & stack (排风管与烟囱) -->
        <path d="M 144 80 L 165 80 L 165 30" fill="none" stroke="#64748b" stroke-width="4.5" stroke-linecap="round" />
        <!-- Vent cap -->
        <polygon points="160,30 170,30 175,25 155,25" fill="#1e293b" />
        <circle cx="165" cy="40" r="3.5" fill="#10b981" class="drill-led" />
      </g>

      <!-- TYPE 11: PIPELINE (流光连接管道) -->
      <g v-else-if="deviceType === 'pipeline'" class="isometric-group">
        <!-- Standard Slurry Pipe Shape: Double-walled tube with glowing inner core -->
        <path :d="pipePathD" :stroke="bgPipeColor" stroke-width="8" stroke-linecap="round" vector-effect="non-scaling-stroke" />

        <!-- Inner Core Flowing laser line -->
        <path :d="pipePathD" :stroke="corePipeColor" :stroke-width="corePipeWidth" :stroke-dasharray="pipeDashArray" class="pipe-flow-1" stroke-linecap="round" :filter="'url(#laserGlow-' + id + ')'" vector-effect="non-scaling-stroke" />
      </g>

      <!-- TYPE 10: DUST_COLLECTOR (点式除尘器) -->
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
    <div class="info-overlay" v-if="deviceType !== 'pipeline'">
      <div class="name-text">{{ titleText }}</div>
      <div class="metric-text font-mono">
        <span class="value">{{ valueText }}</span>
        <span class="unit">{{ props.unit }}</span>
      </div>
    </div>

    <!-- Status Pulse Beacon (Dynamic UI) -->
    <div class="status-beacon" :class="finalStatus" v-if="deviceType !== 'pipeline'"></div>

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
          <div v-if="deviceType === 'feeder_plate'" class="tooltip-row">
            <span class="lbl">给料板板速:</span>
            <span class="val">0.85 m/s</span>
          </div>
          <div v-if="deviceType === 'iron_remover'" class="tooltip-row">
            <span class="lbl">励磁线圈流:</span>
            <span class="val">24.5 A</span>
          </div>
          <div v-if="deviceType === 'baghouse_filter'" class="tooltip-row">
            <span class="lbl">脉冲滤袋数:</span>
            <span class="val">180 条</span>
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
    deviceType?: 'shaft' | 'silo_metal' | 'silo_concrete' | 'crusher_jaw' | 'sifter_vibratory' | 'conveyor_belt' | 'conveyor_belt_long' | 'conveyor_belt_wide' | 'dust_collector' | 'feeder_plate' | 'iron_remover' | 'baghouse_filter' | 'pipeline'
    status?: 'running' | 'warning' | 'stopped'
    value?: string | number
    unit?: string
    flipX?: boolean
    flipY?: boolean
    transparentBg?: boolean
    pipeShape?: 'slope_up' | 'slope_down' | 'horizontal' | 'vertical' | 'elbow_l'
    pipeColor?: 'cyan' | 'green' | 'gold' | 'red'
    pipeStyle?: 'solid' | 'dashed'
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
    flipX: false,
    flipY: false,
    transparentBg: true,
    pipeShape: 'slope_up',
    pipeColor: 'cyan',
    pipeStyle: 'solid',
    rows: () => []
  }
)

const isHovered = ref(false)

const isTransparent = computed(() => props.transparentBg)

const pipePathD = computed(() => {
  if (props.pipeShape === 'horizontal') return 'M 5 110 L 195 110'
  if (props.pipeShape === 'vertical') return 'M 100 5 L 100 215'
  if (props.pipeShape === 'slope_down') return 'M 10 10 L 190 210'
  if (props.pipeShape === 'elbow_l') return 'M 10 210 L 100 210 L 100 10'
  return 'M 10 210 L 190 10' // default slope_up
})

const bgPipeColor = computed(() => {
  return 'rgba(30, 41, 59, 0.75)'
})

const corePipeColor = computed(() => {
  if (props.pipeColor === 'green') return '#10b981'
  if (props.pipeColor === 'gold') return '#fbbf24'
  if (props.pipeColor === 'red') return '#ef4444'
  return '#38bdf8' // Default cyan
})

const corePipeWidth = computed(() => {
  return props.pipeStyle === 'dashed' ? 2 : 3.5
})

const pipeDashArray = computed(() => {
  return props.pipeStyle === 'dashed' ? '5 15' : '8 12'
})

const svgStyle = computed(() => {
  const transformParts = []
  if (props.flipX) transformParts.push('scaleX(-1)')
  if (props.flipY) transformParts.push('scaleY(-1)')
  return {
    transform: transformParts.length > 0 ? transformParts.join(' ') : undefined
  }
})

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
  if (props.deviceType === 'conveyor_belt_long') return '62'
  if (props.deviceType === 'conveyor_belt_wide') return '62'
  if (props.deviceType === 'dust_collector') return '19'
  if (props.deviceType === 'feeder_plate') return '62.0'
  if (props.deviceType === 'iron_remover') return '正常'
  if (props.deviceType === 'baghouse_filter') return '1.25'
  if (props.deviceType === 'pipeline') return '正常'
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

.mine-device-card.is-transparent {
  background: transparent !important;
  border-color: transparent !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
}
.mine-device-card.is-transparent:hover, .mine-device-card.is-transparent.hovered {
  border-color: transparent !important;
  box-shadow: none !important;
  transform: scale(1.02);
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

.device-svg.is-pipeline {
  height: 100% !important;
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
