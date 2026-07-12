<template>
  <div
    class="pv-device-card"
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
      :style="svgStyle"
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

        <!-- Solar Panel Blue Specular Gradient -->
        <linearGradient :id="'solarBlue-' + id" x1="0%" y1="100%" x2="40%" y2="0%">
          <stop offset="0%" stop-color="#00f3ff" />
          <stop offset="25%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#071426" />
        </linearGradient>

        <!-- Laser Glow Filters -->
        <filter :id="'laserGlow-' + id" filterUnits="userSpaceOnUse" x="-50" y="-50" width="300" height="320">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        
        
        <pattern id="新建图案" data-name="新建图案" width="18.57" height="32.16" patternTransform="translate(3911.37 663.11)" patternUnits="userSpaceOnUse" viewBox="0 0 18.57 32.16">
            <rect class="cls-1" width="18.57" height="32.16"/>
            <polyline class="cls-2" points="18.57 21.44 18.57 32.16 18.57 42.88"/>
            <polyline class="cls-2" points="9.29 26.8 18.57 32.16 27.85 37.51 27.85 37.52"/>
            <polyline class="cls-2" points="9.29 37.52 9.29 37.51 18.57 32.16 27.85 26.8"/>
            <polygon class="cls-2" points="27.85 37.52 27.85 26.8 18.57 21.44 9.28 26.8 9.28 37.52 18.57 42.88 27.85 37.52"/>
            <polyline class="cls-2" points="0 21.44 0 32.16 0 42.88"/>
            <polyline class="cls-2" points="-9.28 26.8 0 32.16 9.28 37.51 9.28 37.52"/>
            <polyline class="cls-2" points="-9.28 37.52 -9.28 37.51 0 32.16 9.28 26.8"/>
            <polygon class="cls-2" points="9.28 37.52 9.28 26.8 0 21.44 -9.29 26.8 -9.29 37.52 0 42.88 9.28 37.52"/>
            <polyline class="cls-2" points="18.57 10.72 27.85 16.08 37.13 21.43 37.13 21.44"/>
            <polyline class="cls-2" points="18.57 21.44 18.57 21.43 27.85 16.08 37.13 10.72"/>
            <polygon class="cls-2" points="37.14 21.44 37.14 10.72 27.85 5.36 18.57 10.72 18.57 21.44 27.85 26.8 37.14 21.44"/>
            <polyline class="cls-2" points="9.29 5.36 9.29 16.08 9.29 26.8"/>
            <polyline class="cls-2" points="0.01 10.72 9.29 16.08 18.57 21.43 18.57 21.44"/>
            <polyline class="cls-2" points="0.01 21.44 0.01 21.43 9.29 16.08 18.57 10.72"/>
            <polygon class="cls-2" points="18.57 21.44 18.57 10.72 9.28 5.36 0 10.72 0 21.44 9.28 26.8 18.57 21.44"/>
            <polyline class="cls-2" points="-18.56 10.72 -9.28 16.08 0 21.43 0 21.44"/>
            <polyline class="cls-2" points="-18.56 21.44 -18.56 21.43 -9.28 16.08 0 10.72"/>
            <polygon class="cls-2" points="0 21.44 0 10.72 -9.29 5.36 -18.57 10.72 -18.57 21.44 -9.29 26.8 0 21.44"/>
            <polyline class="cls-2" points="18.57 -10.72 18.57 0 18.57 10.72"/>
            <polyline class="cls-2" points="9.29 -5.36 18.57 0 27.85 5.35 27.85 5.36"/>
            <polyline class="cls-2" points="9.29 5.36 9.29 5.35 18.57 0 27.85 -5.36"/>
            <polygon class="cls-2" points="27.85 5.36 27.85 -5.36 18.57 -10.72 9.28 -5.36 9.28 5.36 18.57 10.72 27.85 5.36"/>
            <polyline class="cls-2" points="0 -10.72 0 0 0 10.72"/>
            <polyline class="cls-2" points="-9.28 -5.36 0 0 9.28 5.35 9.28 5.36"/>
            <polyline class="cls-2" points="-9.28 5.36 -9.28 5.35 0 0 9.28 -5.36"/>
            <polygon class="cls-2" points="9.28 5.36 9.28 -5.36 0 -10.72 -9.29 -5.36 -9.29 5.36 0 10.72 9.28 5.36"/>
        </pattern>
        <linearGradient id="未命名的渐变_70" x1="12.3" y1="42.33" x2="85.81" y2="42.33" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#4cfafe"/>
            <stop offset="0.4" stop-color="#4cfafe" stop-opacity="0"/>
            <stop offset="0.5" stop-color="#4cfafe"/>
            <stop offset="0.6" stop-color="#4cfafe" stop-opacity="0"/>
            <stop offset="1" stop-color="#4cfafe"/>
        </linearGradient>
        <linearGradient id="未命名的渐变_41" x1="20.94" y1="56.66" x2="27.54" y2="56.66" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#eafefe"/>
            <stop offset="0.09" stop-color="#e4fefe" stop-opacity="0.96"/>
            <stop offset="0.22" stop-color="#d5fdfe" stop-opacity="0.87"/>
            <stop offset="0.4" stop-color="#bcfdfe" stop-opacity="0.71"/>
            <stop offset="0.6" stop-color="#9afcfe" stop-opacity="0.49"/>
            <stop offset="0.83" stop-color="#6ffbfe" stop-opacity="0.22"/>
            <stop offset="1" stop-color="#4cfafe" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="未命名的渐变_41-2" x1="50.04" y1="38.94" x2="59.82" y2="38.94" xlink:href="#未命名的渐变_41"></linearGradient>
        <linearGradient id="未命名的渐变_506" x1="58.82" y1="36.31" x2="59.12" y2="36.31" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#283140"/>
            <stop offset="0.16" stop-color="#89abe6"/>
            <stop offset="0.24" stop-color="#89abe6"/>
            <stop offset="0.9" stop-color="#12161a"/>
            <stop offset="1" stop-color="#283140"/>
        </linearGradient>
        <linearGradient id="未命名的渐变_13" x1="58.82" y1="36.05" x2="59.12" y2="36.05" gradientTransform="translate(94.85 -23.02) rotate(89.84)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#89abe6"/>
            <stop offset="1" stop-color="#547099"/>
        </linearGradient>
        <linearGradient id="未命名的渐变_506-2" x1="58.74" y1="35.86" x2="59.2" y2="35.86" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-2" x1="58.74" y1="35.5" x2="59.2" y2="35.5" gradientTransform="translate(94.3 -23.57) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-3" x1="58.67" y1="35.47" x2="59.27" y2="35.47" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-3" x1="58.67" y1="35.1" x2="59.27" y2="35.1" gradientTransform="translate(93.9 -23.97) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_16679" x1="57.97" y1="35.02" x2="59.97" y2="35.02" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#8ce2ff"/>
            <stop offset="1" stop-color="#008dff"/>
        </linearGradient>
        <linearGradient id="未命名的渐变_515" x1="58.45" y1="34.53" x2="59.48" y2="34.53" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#0073e6"/>
            <stop offset="0.16" stop-color="#59c8ff"/>
            <stop offset="0.24" stop-color="#59c8ff"/>
            <stop offset="0.9" stop-color="#1433cc"/>
            <stop offset="1" stop-color="#0073e6"/>
        </linearGradient>
        <linearGradient id="未命名的渐变_16679-2" x1="57.97" y1="34.13" x2="59.97" y2="34.13" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-2" x1="58.45" y1="33.63" x2="59.48" y2="33.63" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-3" x1="57.97" y1="33.23" x2="59.97" y2="33.23" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-3" x1="58.45" y1="32.73" x2="59.48" y2="32.73" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-4" x1="57.97" y1="32.34" x2="59.97" y2="32.34" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-4" x1="58.45" y1="31.84" x2="59.48" y2="31.84" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-5" x1="57.97" y1="31.37" x2="59.97" y2="31.37" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-5" x1="58.45" y1="30.88" x2="59.48" y2="30.88" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-6" x1="57.97" y1="30.45" x2="59.97" y2="30.45" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_506-4" x1="58.67" y1="29.85" x2="59.27" y2="29.85" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-4" x1="58.67" y1="29.48" x2="59.27" y2="29.48" gradientTransform="translate(88.28 -29.58) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-5" x1="58.74" y1="29.24" x2="59.2" y2="29.24" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-5" x1="58.74" y1="28.88" x2="59.2" y2="28.88" gradientTransform="translate(87.69 -30.17) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-6" x1="58.82" y1="28.69" x2="59.12" y2="28.69" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-6" x1="58.82" y1="28.43" x2="59.12" y2="28.43" gradientTransform="translate(87.23 -30.62) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-7" x1="109.47" y1="66.35" x2="109.77" y2="66.35" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-7" x1="109.47" y1="66.09" x2="109.77" y2="66.09" gradientTransform="translate(175.4 -43.71) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-8" x1="109.39" y1="65.9" x2="109.85" y2="65.9" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-8" x1="109.39" y1="65.55" x2="109.85" y2="65.55" gradientTransform="translate(174.86 -44.26) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-9" x1="109.32" y1="65.52" x2="109.92" y2="65.52" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-9" x1="109.32" y1="65.14" x2="109.92" y2="65.14" gradientTransform="translate(174.45 -44.66) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_16679-7" x1="108.62" y1="65.07" x2="110.62" y2="65.07" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-6" x1="109.1" y1="64.57" x2="110.14" y2="64.57" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-8" x1="108.62" y1="64.17" x2="110.62" y2="64.17" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-7" x1="109.1" y1="63.68" x2="110.14" y2="63.68" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-9" x1="108.62" y1="63.28" x2="110.62" y2="63.28" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-8" x1="109.1" y1="62.78" x2="110.14" y2="62.78" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-10" x1="108.62" y1="62.38" x2="110.62" y2="62.38" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-9" x1="109.1" y1="61.88" x2="110.14" y2="61.88" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-11" x1="108.62" y1="61.41" x2="110.62" y2="61.41" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-10" x1="109.1" y1="60.93" x2="110.14" y2="60.93" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-12" x1="108.62" y1="60.49" x2="110.62" y2="60.49" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_506-10" x1="109.32" y1="59.9" x2="109.92" y2="59.9" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-10" x1="109.32" y1="59.52" x2="109.92" y2="59.52" gradientTransform="translate(168.83 -50.26) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-11" x1="109.39" y1="59.29" x2="109.85" y2="59.29" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-11" x1="109.39" y1="58.93" x2="109.85" y2="58.93" gradientTransform="translate(168.24 -50.86) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-12" x1="109.47" y1="58.74" x2="109.77" y2="58.74" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-12" x1="109.47" y1="58.48" x2="109.77" y2="58.48" gradientTransform="translate(167.79 -51.31) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_71" x1="88.91" y1="74.41" x2="98.77" y2="74.41" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#425266"/>
            <stop offset="1" stop-color="#596b8c"/>
        </linearGradient>
        <linearGradient id="未命名的渐变_107" x1="90.04" y1="74.38" x2="99.91" y2="74.38" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#283140"/>
            <stop offset="0.34" stop-color="#232b37"/>
            <stop offset="0.9" stop-color="#15191f"/>
            <stop offset="1" stop-color="#12161a"/>
        </linearGradient>
        <linearGradient id="未命名的渐变_13-13" x1="88.91" y1="12.85" x2="91.18" y2="12.85" gradientTransform="matrix(1, 0, 0, 1, 0, 0)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_71-2" x1="75.79" y1="135.56" x2="75.79" y2="5.29" xlink:href="#未命名的渐变_71"></linearGradient>
        <linearGradient id="未命名的渐变_107-2" x1="76.92" y1="135.56" x2="76.92" y2="5.29" xlink:href="#未命名的渐变_107"></linearGradient>
        <linearGradient id="未命名的渐变_13-14" x1="75.36" y1="5.29" x2="77.63" y2="5.29" gradientTransform="matrix(1, 0, 0, 1, 0, 0)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_71-3" x1="75.79" y1="150" x2="75.79" y2="19.74" xlink:href="#未命名的渐变_71"></linearGradient>
        <linearGradient id="未命名的渐变_107-3" x1="76.92" y1="150" x2="76.92" y2="19.74" xlink:href="#未命名的渐变_107"></linearGradient>
        <linearGradient id="未命名的渐变_13-15" x1="75.36" y1="19.74" x2="77.63" y2="19.74" gradientTransform="matrix(1, 0, 0, 1, 0, 0)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_71-4" x1="57.73" y1="134.26" x2="57.73" y2="13.08" xlink:href="#未命名的渐变_71"></linearGradient>
        <linearGradient id="未命名的渐变_13-16" x1="62.6" y1="13.11" x2="64.87" y2="13.11" gradientTransform="matrix(1, 0, 0, 1, 0, 0)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_107-4" x1="58.86" y1="134.26" x2="58.86" y2="13.15" xlink:href="#未命名的渐变_107"></linearGradient>
        <linearGradient id="未命名的渐变_506-13" x1="93.86" y1="75.42" x2="94.16" y2="75.42" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-17" x1="93.86" y1="75.16" x2="94.16" y2="75.16" gradientTransform="translate(168.9 -19.06) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-14" x1="93.78" y1="74.97" x2="94.24" y2="74.97" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-18" x1="93.78" y1="74.61" x2="94.24" y2="74.61" gradientTransform="translate(168.35 -19.61) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-15" x1="93.71" y1="74.58" x2="94.31" y2="74.58" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-19" x1="93.71" y1="74.21" x2="94.31" y2="74.21" gradientTransform="translate(167.95 -20.01) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_16679-13" x1="93.01" y1="74.13" x2="95.01" y2="74.13" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-11" x1="93.49" y1="73.64" x2="94.52" y2="73.64" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-14" x1="93.01" y1="73.24" x2="95.01" y2="73.24" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-12" x1="93.49" y1="72.74" x2="94.52" y2="72.74" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-15" x1="93.01" y1="72.34" x2="95.01" y2="72.34" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-13" x1="93.49" y1="71.84" x2="94.52" y2="71.84" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-16" x1="93.01" y1="71.45" x2="95.01" y2="71.45" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-14" x1="93.49" y1="70.95" x2="94.52" y2="70.95" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-17" x1="93.01" y1="70.48" x2="95.01" y2="70.48" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-15" x1="93.49" y1="69.99" x2="94.52" y2="69.99" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-18" x1="93.01" y1="69.56" x2="95.01" y2="69.56" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_506-16" x1="93.71" y1="68.97" x2="94.31" y2="68.97" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-20" x1="93.71" y1="68.59" x2="94.31" y2="68.59" gradientTransform="translate(162.33 -25.61) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-17" x1="93.78" y1="68.35" x2="94.24" y2="68.35" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-21" x1="93.78" y1="67.99" x2="94.24" y2="67.99" gradientTransform="translate(161.74 -26.21) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-18" x1="93.86" y1="67.8" x2="94.16" y2="67.8" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-22" x1="93.86" y1="67.54" x2="94.16" y2="67.54" gradientTransform="translate(161.28 -26.66) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-19" x1="42.86" y1="45.42" x2="43.16" y2="45.42" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-23" x1="42.86" y1="45.16" x2="43.16" y2="45.16" gradientTransform="translate(88.05 2.02) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-20" x1="42.78" y1="44.97" x2="43.24" y2="44.97" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-24" x1="42.78" y1="44.61" x2="43.24" y2="44.61" gradientTransform="translate(87.5 1.48) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-21" x1="42.71" y1="44.58" x2="43.31" y2="44.58" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-25" x1="42.71" y1="44.21" x2="43.31" y2="44.21" gradientTransform="translate(87.09 1.07) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_16679-19" x1="42.01" y1="44.13" x2="44.01" y2="44.13" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-16" x1="42.49" y1="43.64" x2="43.52" y2="43.64" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-20" x1="42.01" y1="43.24" x2="44.01" y2="43.24" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-17" x1="42.49" y1="42.74" x2="43.52" y2="42.74" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-21" x1="42.01" y1="42.34" x2="44.01" y2="42.34" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-18" x1="42.49" y1="41.84" x2="43.52" y2="41.84" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-22" x1="42.01" y1="41.45" x2="44.01" y2="41.45" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-19" x1="42.49" y1="40.95" x2="43.52" y2="40.95" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-23" x1="42.01" y1="40.48" x2="44.01" y2="40.48" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_515-20" x1="42.49" y1="39.99" x2="43.52" y2="39.99" xlink:href="#未命名的渐变_515"></linearGradient>
        <linearGradient id="未命名的渐变_16679-24" x1="42.01" y1="39.56" x2="44.01" y2="39.56" xlink:href="#未命名的渐变_16679"></linearGradient>
        <linearGradient id="未命名的渐变_506-22" x1="42.71" y1="38.97" x2="43.31" y2="38.97" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-26" x1="42.71" y1="38.59" x2="43.31" y2="38.59" gradientTransform="translate(81.48 -4.53) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-23" x1="42.78" y1="38.35" x2="43.24" y2="38.35" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-27" x1="42.78" y1="37.99" x2="43.24" y2="37.99" gradientTransform="translate(80.88 -5.12) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_506-24" x1="42.86" y1="37.8" x2="43.16" y2="37.8" xlink:href="#未命名的渐变_506"></linearGradient>
        <linearGradient id="未命名的渐变_13-28" x1="42.86" y1="37.54" x2="43.16" y2="37.54" gradientTransform="translate(80.43 -5.57) rotate(89.84)" xlink:href="#未命名的渐变_13"></linearGradient>
        <linearGradient id="未命名的渐变_70-2" x1="64.32" y1="71.64" x2="137.58" y2="71.64" xlink:href="#未命名的渐变_70"></linearGradient>
        <linearGradient id="未命名的渐变_41-3" x1="72.83" y1="85.97" x2="79.43" y2="85.97" xlink:href="#未命名的渐变_41"></linearGradient>
        <linearGradient id="未命名的渐变_41-4" x1="101.94" y1="68.25" x2="111.71" y2="68.25" xlink:href="#未命名的渐变_41"></linearGradient>
        <linearGradient id="未命名的渐变_81" x1="76.5" y1="134.59" x2="76.5" y2="100.41" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#4cfafe"/>
            <stop offset="0.04" stop-color="#4cfafe" stop-opacity="0.6"/>
            <stop offset="0.09" stop-color="#41e1fe" stop-opacity="0.46"/>
            <stop offset="0.14" stop-color="#36cafe" stop-opacity="0.34"/>
            <stop offset="0.21" stop-color="#2db7ff" stop-opacity="0.23"/>
            <stop offset="0.28" stop-color="#26a7ff" stop-opacity="0.15"/>
            <stop offset="0.36" stop-color="#209bff" stop-opacity="0.08"/>
            <stop offset="0.46" stop-color="#1c92ff" stop-opacity="0.03"/>
            <stop offset="0.6" stop-color="#1a8dff" stop-opacity="0.01"/>
            <stop offset="1" stop-color="#198cff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="未命名的渐变_86" x1="76.5" y1="134.59" x2="76.5" y2="100.41" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#4cfafe"/>
            <stop offset="0.04" stop-color="#4cfafe" stop-opacity="0.6"/>
            <stop offset="0.05" stop-color="#4bf8fe" stop-opacity="0.59"/>
            <stop offset="0.21" stop-color="#3cd7fe" stop-opacity="0.41"/>
            <stop offset="0.37" stop-color="#2fbcff" stop-opacity="0.26"/>
            <stop offset="0.53" stop-color="#25a7ff" stop-opacity="0.15"/>
            <stop offset="0.69" stop-color="#1f98ff" stop-opacity="0.07"/>
            <stop offset="0.85" stop-color="#1a8fff" stop-opacity="0.02"/>
            <stop offset="1" stop-color="#198cff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="未命名的渐变_81-2" x1="76.5" y1="98" x2="76.5" y2="69" xlink:href="#未命名的渐变_81"></linearGradient>
        <linearGradient id="未命名的渐变_86-2" x1="76.5" y1="98" x2="76.5" y2="69" xlink:href="#未命名的渐变_86"></linearGradient>
        <linearGradient id="未命名的渐变_81-3" x1="76.5" y1="61" x2="76.5" y2="36" xlink:href="#未命名的渐变_81"></linearGradient>
        <linearGradient id="未命名的渐变_86-3" x1="76.5" y1="61" x2="76.5" y2="36" xlink:href="#未命名的渐变_86"></linearGradient>
    
        <pattern id="新建图案-box" data-name="新建图案" width="18.57" height="32.16" patternTransform="translate(3730.37 663.11)" patternUnits="userSpaceOnUse" viewBox="0 0 18.57 32.16"><rect class="cls-1" width="18.57" height="32.16"/><polyline class="cls-2" points="18.57 21.44 18.57 32.16 18.57 42.88"/><polyline class="cls-2" points="9.29 26.8 18.57 32.16 27.85 37.51 27.85 37.52"/><polyline class="cls-2" points="9.29 37.52 9.29 37.51 18.57 32.16 27.85 26.8"/><polygon class="cls-2" points="27.85 37.52 27.85 26.8 18.57 21.44 9.28 26.8 9.28 37.52 18.57 42.88 27.85 37.52"/><polyline class="cls-2" points="0 21.44 0 32.16 0 42.88"/><polyline class="cls-2" points="-9.28 26.8 0 32.16 9.28 37.51 9.28 37.52"/><polyline class="cls-2" points="-9.28 37.52 -9.28 37.51 0 32.16 9.28 26.8"/><polygon class="cls-2" points="9.28 37.52 9.28 26.8 0 21.44 -9.29 26.8 -9.29 37.52 0 42.88 9.28 37.52"/><polyline class="cls-2" points="18.57 10.72 27.85 16.08 37.13 21.43 37.13 21.44"/><polyline class="cls-2" points="18.57 21.44 18.57 21.43 27.85 16.08 37.13 10.72"/><polygon class="cls-2" points="37.14 21.44 37.14 10.72 27.85 5.36 18.57 10.72 18.57 21.44 27.85 26.8 37.14 21.44"/><polyline class="cls-2" points="9.29 5.36 9.29 16.08 9.29 26.8"/><polyline class="cls-2" points="0.01 10.72 9.29 16.08 18.57 21.43 18.57 21.44"/><polyline class="cls-2" points="0.01 21.44 0.01 21.43 9.29 16.08 18.57 10.72"/><polygon class="cls-2" points="18.57 21.44 18.57 10.72 9.28 5.36 0 10.72 0 21.44 9.28 26.8 18.57 21.44"/><polyline class="cls-2" points="-18.56 10.72 -9.28 16.08 0 21.43 0 21.44"/><polyline class="cls-2" points="-18.56 21.44 -18.56 21.43 -9.28 16.08 0 10.72"/><polygon class="cls-2" points="0 21.44 0 10.72 -9.29 5.36 -18.57 10.72 -18.57 21.44 -9.29 26.8 0 21.44"/><polyline class="cls-2" points="18.57 -10.72 18.57 0 18.57 10.72"/><polyline class="cls-2" points="9.29 -5.36 18.57 0 27.85 5.35 27.85 5.36"/><polyline class="cls-2" points="9.29 5.36 9.29 5.35 18.57 0 27.85 -5.36"/><polygon class="cls-2" points="27.85 5.36 27.85 -5.36 18.57 -10.72 9.28 -5.36 9.28 5.36 18.57 10.72 27.85 5.36"/><polyline class="cls-2" points="0 -10.72 0 0 0 10.72"/><polyline class="cls-2" points="-9.28 -5.36 0 0 9.28 5.35 9.28 5.36"/><polyline class="cls-2" points="-9.28 5.36 -9.28 5.35 0 0 9.28 -5.36"/><polygon class="cls-2" points="9.28 5.36 9.28 -5.36 0 -10.72 -9.29 -5.36 -9.29 5.36 0 10.72 9.28 5.36"/></pattern><linearGradient id="未命名的渐变_71-box" x1="64.28" y1="136.99" x2="-4.49" y2="68.22" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#425266"/><stop offset="1" stop-color="#596b8c"/></linearGradient><linearGradient id="未命名的渐变_27-box" x1="51.21" y1="141.04" x2="150.61" y2="41.65" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#384459"/><stop offset="1" stop-color="#2c3640"/></linearGradient><linearGradient id="未命名的渐变_13-box" x1="0.01" y1="34.27" x2="120.12" y2="34.27" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#89abe6"/><stop offset="1" stop-color="#547099"/></linearGradient><linearGradient id="未命名的渐变_71-2-box" x1="54.45" y1="97.12" x2="5.33" y2="48" xlink:href="#未命名的渐变_71-box"></linearGradient><linearGradient id="未命名的渐变_13-2-box" x1="29.9" y1="51.52" x2="150" y2="51.52" xlink:href="#未命名的渐变_13-box"></linearGradient><linearGradient id="未命名的渐变_107-box" x1="59.77" y1="63.6" x2="150" y2="63.6" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#283140"/><stop offset="0.34" stop-color="#232b37"/><stop offset="0.9" stop-color="#15191f"/><stop offset="1" stop-color="#12161a"/></linearGradient><linearGradient id="未命名的渐变_17259-box" x1="71.98" y1="109.21" x2="73.67" y2="109.21" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#096dd9"/><stop offset="1" stop-color="#40a9ff"/></linearGradient><linearGradient id="未命名的渐变_17259-2-box" x1="101.98" y1="92.21" x2="103.67" y2="92.21" xlink:href="#未命名的渐变_17259-box"></linearGradient><linearGradient id="未命名的渐变_17259-3-box" x1="129.98" y1="76.21" x2="131.67" y2="76.21" xlink:href="#未命名的渐变_17259-box"></linearGradient>
      </defs>

      <!-- TYPE 1: PV_PANEL (太阳能电板组 - 晶硅排板与悬挑支架组) -->
      <g v-if="deviceType === 'pv_panel'" class="isometric-group">
        <!-- Shadow -->
        <ellipse cx="100" cy="180" rx="80" ry="18" fill="black" opacity="0.35" />

        <!-- Support Frame (Rendered behind panel surface) -->
        <g fill="none" stroke="#475569" stroke-width="2.5" stroke-linejoin="round">
          <!-- Left Triangle Frame -->
          <polygon points="72,50 72,96 8,130" />
          <line x1="8" y1="130" x2="72" y2="50" stroke-width="3" />
          
          <!-- Right Triangle Frame -->
          <polygon points="192,114 192,160 128,194" />
          <line x1="128" y1="194" x2="192" y2="114" stroke-width="3" />
          
          <!-- Connecting crossbeams -->
          <line x1="72" y1="96" x2="192" y2="160" stroke="#334155" />
          <line x1="8" y1="130" x2="128" y2="194" stroke="#334155" />
        </g>

        <!-- The 4 Silicon Panels (Unified coplanar surface) -->
        <polygon points="72,50 8,130 128,194 192,114" :fill="'url(#solarBlue-' + id + ')'" stroke="#0f172a" stroke-width="1.5" />

        <!-- Horizontal Cell Grids -->
        <g stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.8">
          <line x1="61.8" y1="62.8" x2="181.8" y2="126.8" />
          <line x1="50.9" y1="76.4" x2="170.9" y2="140.4" />
          <line x1="40.0" y1="90.0" x2="160.0" y2="154.0" />
          <line x1="29.8" y1="102.8" x2="149.8" y2="166.8" />
          <line x1="18.9" y1="116.4" x2="138.9" y2="180.4" />
        </g>

        <!-- Vertical Cell Grids & Panel Dividers -->
        <g stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.8">
          <!-- Panel 1 -->
          <line x1="18.0" y1="135.3" x2="82.0" y2="55.3" />
          <line x1="28.0" y1="140.7" x2="92.0" y2="60.7" />
          <!-- Panel 2 -->
          <line x1="48.0" y1="151.3" x2="112.0" y2="71.3" />
          <line x1="58.0" y1="156.7" x2="122.0" y2="76.7" />
          <!-- Panel 3 -->
          <line x1="78.0" y1="167.3" x2="142.0" y2="87.3" />
          <line x1="88.0" y1="172.7" x2="152.0" y2="92.7" />
          <!-- Panel 4 -->
          <line x1="108.0" y1="183.3" x2="172.0" y2="103.3" />
          <line x1="118.0" y1="188.7" x2="182.0" y2="108.7" />
        </g>

        <!-- Panel Dividers (Thick black separators) -->
        <g stroke="#0f172a" stroke-width="1.5">
          <line x1="38" y1="146" x2="102" y2="66" />
          <line x1="68" y1="162" x2="132" y2="82" />
          <line x1="98" y1="178" x2="162" y2="98" />
        </g>

        <!-- Bottom glowing borders (Bright cyan light flow at the bottom edge) -->
        <line x1="8" y1="130" x2="128" y2="194" stroke="#00f3ff" stroke-width="2.5" :filter="'url(#laserGlow-' + id + ')'" />
        <line x1="8" y1="130" x2="128" y2="194" stroke="#e0f2fe" stroke-width="1" />
      </g>

      <!-- TYPE 2: COMBINER_BOX (光伏汇流箱 - 智能监测接线箱) -->
      <g v-else-if="deviceType === 'combiner_box'" class="isometric-group">
        <!-- Shadow -->
        <ellipse cx="100" cy="180" rx="45" ry="12" fill="black" opacity="0.4" />

        <!-- Mounting Stand Leg -->
        <rect x="96" y="120" width="8" height="60" fill="#475569" stroke="#1e293b" />
        <polygon points="80,180 120,180 110,175 90,175" fill="#334155" />

        <!-- Junction Box Body -->
        <!-- Left panel -->
        <path d="M 70 80 L 100 95 L 100 135 L 70 120 Z" fill="#334155" stroke="#1e293b" />
        <!-- Front panel (Right side) -->
        <path d="M 100 95 L 130 80 L 130 120 L 100 135 Z" :fill="'url(#metalCylinder-' + id + ')'" stroke="#1e293b" />
        <!-- Top cap -->
        <polygon points="70,80 100,95 130,80 100,65" fill="#475569" stroke="#1e293b" />

        <!-- Heavy door hinge & locking latch keyhole -->
        <line x1="124" y1="88" x2="124" y2="112" stroke="#1e293b" stroke-width="1.5" />
        <circle cx="106" cy="110" r="1.5" fill="#0f172a" />

        <!-- Status Light Indicators (Vibrant Neon blue/cyan indicators) -->
        <circle cx="106" cy="98" r="2.5" fill="#00f3ff" class="power-glow" />
        <circle cx="114" cy="94" r="2.2" fill="#38bdf8" opacity="0.3" />

        <!-- Cable Conduits -->
        <path d="M 85 125 L 85 145" stroke="#00f3ff" stroke-width="2.5" />
        <path d="M 115 125 L 115 145" stroke="#38bdf8" stroke-width="2.5" />
      </g>

      <!-- TYPE 3: INVERTER (光伏逆变器 - 智能逆变柜组) -->
      <g v-else-if="deviceType === 'inverter'" class="isometric-group">
        <!-- Shadow -->
        <ellipse cx="100" cy="182" rx="55" ry="14" fill="black" opacity="0.45" />

        <!-- Concrete foundation base block -->
        <polygon points="60,165 140,165 130,177 50,177" fill="#475569" stroke="#334155" />
        <polygon points="50,177 130,177 130,182 50,182" fill="#334155" />

        <!-- Main Inverter Cabinet body -->
        <!-- Left Side Panel -->
        <path d="M 60 70 L 95 88 L 95 165 L 60 147 Z" fill="#334155" stroke="#1e293b" stroke-width="1.5" />
        <!-- Front Side Door (Right side) -->
        <path d="M 95 88 L 140 68 L 140 145 L 95 165 Z" :fill="'url(#metalCylinder-' + id + ')'" stroke="#1e293b" stroke-width="1.5" />
        <!-- Top Hood -->
        <polygon points="60,70 95,88 140,68 105,50" fill="#475569" stroke="#1e293b" />

        <!-- Horizontal cooling vents -->
        <g stroke="#1e293b" stroke-width="1.5">
          <line x1="105" y1="120" x2="130" y2="108" />
          <line x1="105" y1="128" x2="130" y2="116" />
          <line x1="105" y1="136" x2="130" y2="124" />
        </g>

        <!-- Integrated Glowing LCD Controller Display -->
        <polygon points="105,82 130,70 130,92 105,104" fill="#020617" stroke="#38bdf8" stroke-width="1" />
        <polygon points="107,83 128,72 128,90 107,101" fill="rgba(56, 189, 248, 0.15)" />
        
        <!-- Blinking data sync indicators (Recolored to high-tech blue/cyan) -->
        <circle cx="105" cy="112" r="2" fill="#00f3ff" class="power-glow" />
        <circle cx="112" cy="109" r="2" fill="#38bdf8" class="power-glow" />

        <!-- Connection Pipeline Output -->
        <path d="M 78 156 L 78 172" stroke="#64748b" stroke-width="4.5" />
      </g>

      <!-- TYPE 4: BOX_TRANSFORMER (箱式变压器 - 户外集成箱变) -->
      <!-- TYPE 4: BOX_TRANSFORMER (箱式变压器 - 户外集成箱变) -->
      <g v-else-if="deviceType === 'box_transformer'" class="isometric-group">
        <!-- Shadow -->
        <ellipse cx="100" cy="180" rx="55" ry="12" fill="black" opacity="0.3" />

        <!-- Wrapped in scale/translation group to fit 200x220 viewbox -->
        <g transform="translate(25, 20) scale(1.0)">
          <polygon class="box-cls-6" points="55.8 145.5 55.8 149.11 3.98 119.2 3.99 115.59 55.8 145.5"/><polygon class="box-cls-7" points="55.8 145.5 146.03 93.07 146.02 96.68 55.8 149.11 55.8 145.5"/><g class="box-cls-8"><polygon class="box-cls-9" points="55.88 89.57 55.72 145.55 3.91 115.63 4.06 62.72 4.07 59.66 55.73 89.48 55.88 89.57"/><polygon class="box-cls-10" points="55.88 89.57 146.1 37.14 145.94 93.12 55.72 145.55 55.88 89.57"/><polygon class="box-cls-11" points="58.44 91.05 85.95 75.06 85.95 125.02 58.29 141.09 58.44 91.05"/><polygon class="box-cls-11" points="88.51 73.57 114.37 58.54 114.37 108.5 88.51 123.53 88.51 73.57"/><polygon class="box-cls-11" points="143.53 41.6 143.39 91.64 116.93 107.02 116.93 57.05 143.53 41.6"/></g><polygon class="box-cls-12" points="0.01 53.32 90.23 0.89 120.12 15.22 29.9 67.65 0.01 53.32"/><polygon class="box-cls-13" points="29.9 67.65 59.78 87.83 59.77 91.8 0 57.3 0.01 53.32 29.9 67.65"/><polygon class="box-cls-14" points="29.9 67.65 120.12 15.22 150 35.39 59.78 87.83 29.9 67.65"/><polygon class="box-cls-15" points="59.78 87.83 150 35.39 149.99 39.37 59.77 91.8 59.78 87.83"/><path class="box-cls-16" d="M72.26,104.62a.26.26,0,0,1,.34,0L76,109.36c.15.21,0,.68-.33.85L69,114.06c-.3.17-.49-.09-.34-.47L71.93,105a.9.9,0,0,1,.33-.42"/><path class="box-cls-17" d="M73.2,107.43l-.87.5L72,109.59l.69-.4-.34,1.8,1.34-3-.74.42.27-1"/><path class="box-cls-16" d="M102.26,87.62a.26.26,0,0,1,.34,0L106,92.36c.15.21,0,.68-.33.85L99,97.06c-.3.17-.49-.09-.34-.47L101.93,88a.9.9,0,0,1,.33-.42"/><path class="box-cls-18" d="M103.2,90.43l-.87.5L102,92.59l.69-.4-.34,1.8,1.34-3-.74.42.27-1"/><path class="box-cls-16" d="M130.26,71.62a.26.26,0,0,1,.34,0L134,76.36c.15.21,0,.68-.33.85L127,81.06c-.3.17-.49-.09-.34-.47L129.93,72a.9.9,0,0,1,.33-.42"/><path class="box-cls-19" d="M131.2,74.43l-.87.5L130,76.59l.69-.4-.34,1.8,1.34-3-.74.42.27-1"/>
          <!-- Warning flashing LED at the top of the box transformer -->
          <circle cx="60" cy="10" r="3" fill="#00f3ff" class="power-glow" :filter="'url(#laserGlow-' + id + ')'" />
        </g>
      </g>

      <!-- TYPE 5: TRANSMISSION_TOWER (高压电塔 - 特高压输电铁塔) -->
      <g v-else class="isometric-group">
        <!-- Shadow -->
        <ellipse cx="100" cy="180" rx="45" ry="10" fill="black" opacity="0.3" />

        <!-- Wrapped in scale/translation group to fit 200x220 viewbox -->
        <g transform="translate(25, 20) scale(1.0)">
          <image width="77" height="46" transform="translate(10.5 19.5)" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAuCAYAAABtaZREAAAACXBIWXMAAAsSAAALEgHS3X78AAABxklEQVRoQ+2bvU7DMBhFj6WMsDGTHaZ2Z4MX6oP0WdgZO7DBM6RzmYDZDHFLWjmf6zY//jtSlijpcHXvkVupSmtNoR+1RgE3wL251VTC89mj1tzShlUDC+AXeC2hWei0awE8AQr4ABpgp8o8/zmZYm2uxlxb4Eev0KVpWMNaAhrYAJ+YsPbPZx/aibeW5vZ+ilu94vv0nWxDc3jrMEXru7k57Vxv9X9CZk2zTLHXWxJZhOaaos1bEknPc4gp2kiyab5HCF+SC+2SI4QvyYTm8hZXtqtL9E4by1sS0TZtbG9JRBnaFN6SiCq0Kb0lEYXT5vCWRNBNm9NbEsGGNre3JIILLRRvSQTjtNC8JRFE04b6yWYqZg3NNcU5vSUxyzxjmqKNSZsW6hHCl8lCC/kI4cvoobm8RSTt6jKa02L3lsTgTUvFWxKDhpaStyQGCS1Fb0lc5bSUvSVxcdNi++ozJN6huaaYirckzp5nrlO04WxaDkcIX8TQcjlC+GINzeUtMmxXlyOnFW+dRwVHYdW0gWXvLYlKrQ9hPQLPwBdtWFl7S6IC7oAX4MHc25irtKuHCtgBb8A77d9YmtIuGaW13jsNgNIuN38x1kx/+/VlHAAAAABJRU5ErkJggg=="/>
                <line class="cls-6" x1="85.68" y1="21.19" x2="12.42" y2="63.48"/>
                <image width="11" height="8" transform="translate(18.5 52.5)" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAICAYAAAAvOAWIAAAACXBIWXMAAAsSAAALEgHS3X78AAAAhUlEQVQYV3XQIQ7CUBRE0fOTyuLQ1INiATjYUBfStSDx+LKGelAU/RD80qbQcS+5uW8yKSIsJTUSRC0gLcGpscImn13U+h8420rsccALZ3TFH6jKxgo3dLhHLYoMDtAORzxwQYt+6Fxk4xonbPOjK9qoPU2SImJqLn06dnPwCzPOxDjVPG9JETOfhiMcAwAAAABJRU5ErkJggg=="/>
                <line class="cls-7" x1="27.41" y1="54.83" x2="21.06" y2="58.5"/>
                <image width="13" height="9" transform="translate(48.5 34.5)" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAJCAYAAADpeqZqAAAACXBIWXMAAAsSAAALEgHS3X78AAAAlUlEQVQYV33OsQ3CQBBE0XfShaYFoAU7pxlKcCGuggLogRxqsGMgAQKiI/CdBJbxSJus/ox+SClZSugEVFjnVx8XeKGzyvAGNV44zpa+1mvsEHBGj2v41puobPL1+QY8UyvFP3CDhBMuBS7jMXQqbHOhyf+iMqTWwyTRuLzH27j8ozItlBLcjBqnJbgkGpcPuM+pzOUDuEA0Jw+PNXUAAAAASUVORK5CYII="/>
                <line class="cls-8" x1="59.69" y1="36.19" x2="50.17" y2="41.69"/>
                <g class="cls-9">
                    <path class="cls-10" d="M59.07,36.11a.26.26,0,0,1-.21,0s0,0,0-.06v.43a.06.06,0,0,0,0,.06.2.2,0,0,0,.21,0,.06.06,0,0,0,0-.06v-.43S59.1,36.09,59.07,36.11Z"/>
                    <ellipse class="cls-11" cx="58.97" cy="36.05" rx="0.09" ry="0.15" transform="translate(22.76 94.92) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-12" d="M59.13,35.6a.33.33,0,0,1-.32,0,.1.1,0,0,1-.07-.09v.58a.11.11,0,0,0,.06.09.35.35,0,0,0,.33,0s.07-.06.07-.1V35.5S59.18,35.57,59.13,35.6Z"/>
                    <ellipse class="cls-13" cx="58.97" cy="35.5" rx="0.13" ry="0.23" transform="translate(23.3 94.37) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-14" d="M59.18,35.22a.48.48,0,0,1-.42,0q-.09-.06-.09-.12v.58s0,.08.09.12a.45.45,0,0,0,.42,0,.15.15,0,0,0,.09-.12V35.1A.15.15,0,0,1,59.18,35.22Z"/>
                    <ellipse class="cls-15" cx="58.97" cy="35.1" rx="0.17" ry="0.3" transform="translate(23.71 93.97) rotate(-89.84)"/>
                </g>
                <ellipse class="cls-16" cx="58.97" cy="34.59" rx="0.3" ry="0.51" transform="translate(24.21 93.46) rotate(-89.84)"/>
                <path class="cls-17" d="M58.17,34.71l.39-.3c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.21-.28.05-.4h0l.39.3c.3.23.26.56-.1.76a1.55,1.55,0,0,1-1.42,0C57.9,35.25,57.88,34.93,58.17,34.71Z"/>
                <ellipse class="cls-18" cx="58.97" cy="34.13" rx="0.3" ry="0.51" transform="translate(24.67 93) rotate(-89.84)"/>
                <path class="cls-19" d="M59.33,34.35a.82.82,0,0,1-.73,0,.25.25,0,0,1-.14-.21v.49a.25.25,0,0,0,.15.21.82.82,0,0,0,.73,0,.27.27,0,0,0,.15-.22v-.49A.27.27,0,0,1,59.33,34.35Z"/>
                <ellipse class="cls-16" cx="58.97" cy="33.7" rx="0.3" ry="0.51" transform="translate(25.11 92.57) rotate(-89.84)"/>
                <path class="cls-20" d="M58.17,33.81l.39-.3a.22.22,0,0,0,0,.39.82.82,0,0,0,.73,0c.19-.11.21-.27.05-.39h0l.39.3c.3.23.26.55-.1.76a1.58,1.58,0,0,1-1.42,0A.42.42,0,0,1,58.17,33.81Z"/>
                <ellipse class="cls-18" cx="58.97" cy="33.24" rx="0.3" ry="0.51" transform="translate(25.57 92.11) rotate(-89.84)"/>
                <path class="cls-21" d="M59.33,33.45a.82.82,0,0,1-.73,0,.24.24,0,0,1-.14-.21v.5a.24.24,0,0,0,.15.2.78.78,0,0,0,.73,0,.25.25,0,0,0,.15-.21v-.49A.27.27,0,0,1,59.33,33.45Z"/>
                <ellipse class="cls-16" cx="58.97" cy="32.8" rx="0.3" ry="0.51" transform="translate(26 91.68) rotate(-89.84)"/>
                <path class="cls-22" d="M58.17,32.92l.39-.3c-.15.11-.14.28,0,.39a.79.79,0,0,0,.73,0c.19-.1.21-.27.05-.39h0l.39.3c.3.23.26.56-.1.76a1.55,1.55,0,0,1-1.42,0C57.9,33.46,57.88,33.14,58.17,32.92Z"/>
                <ellipse class="cls-18" cx="58.97" cy="32.34" rx="0.3" ry="0.51" transform="translate(26.46 91.22) rotate(-89.84)"/>
                <path class="cls-23" d="M59.33,32.55a.79.79,0,0,1-.73,0,.25.25,0,0,1-.14-.21v.49a.25.25,0,0,0,.15.21.82.82,0,0,0,.73,0,.27.27,0,0,0,.15-.22v-.49A.24.24,0,0,1,59.33,32.55Z"/>
                <ellipse class="cls-16" cx="58.97" cy="31.9" rx="0.3" ry="0.51" transform="translate(26.9 90.78) rotate(-89.84)"/>
                <path class="cls-24" d="M58.17,32l.39-.3c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.21-.28.05-.39h0l.39.29c.3.23.26.56-.1.77a1.58,1.58,0,0,1-1.42,0C57.9,32.56,57.88,32.24,58.17,32Z"/>
                <ellipse class="cls-18" cx="58.97" cy="31.44" rx="0.3" ry="0.51" transform="translate(27.36 90.33) rotate(-89.84)"/>
                <path class="cls-25" d="M59.33,31.66a.82.82,0,0,1-.73,0,.24.24,0,0,1-.14-.21v.49a.24.24,0,0,0,.15.21.78.78,0,0,0,.73,0,.25.25,0,0,0,.15-.21v-.49A.27.27,0,0,1,59.33,31.66Z"/>
                <ellipse class="cls-16" cx="58.97" cy="30.93" rx="0.3" ry="0.51" transform="matrix(0, -1, 1, 0, 27.87, 89.82)"/>
                <path class="cls-26" d="M58.17,31.05l0,0,0,0,0,0,0,0h0l0,0,.19-.15c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.21-.28.05-.4l.39.3c.3.23.26.56-.1.77a1.58,1.58,0,0,1-1.42,0C57.9,31.59,57.88,31.27,58.17,31.05Z"/>
                <ellipse class="cls-18" cx="58.97" cy="30.5" rx="0.3" ry="0.51" transform="translate(28.3 89.39) rotate(-89.84)"/>
                <path class="cls-27" d="M59.33,30.72a.82.82,0,0,1-.73,0,.24.24,0,0,1-.14-.21V31a.25.25,0,0,0,.15.21.82.82,0,0,0,.73,0,.27.27,0,0,0,.15-.21v-.46A.27.27,0,0,1,59.33,30.72Z"/>
                <ellipse class="cls-16" cx="58.97" cy="30" rx="0.17" ry="0.3" transform="translate(28.81 88.88) rotate(-89.84)"/>
                <path class="cls-28" d="M59.12,29.85l.34.11.23.1a.44.44,0,0,1,0,.82,1.58,1.58,0,0,1-1.42,0,.44.44,0,0,1,0-.82l.49-.18c-.11.07-.12.18,0,.25a.48.48,0,0,0,.42,0c.11-.07.12-.17,0-.24Z"/>
                <g class="cls-9">
                    <path class="cls-29" d="M59.18,29.6a.45.45,0,0,1-.42,0q-.09-.06-.09-.12v.58a.15.15,0,0,0,.09.12.45.45,0,0,0,.42,0,.14.14,0,0,0,.09-.12v-.58A.15.15,0,0,1,59.18,29.6Z"/>
                    <ellipse class="cls-30" cx="58.97" cy="29.48" rx="0.17" ry="0.3" transform="translate(29.32 88.37) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-31" d="M59.13,29a.36.36,0,0,1-.32,0c-.05,0-.07-.06-.07-.1v.58a.12.12,0,0,0,.06.1.38.38,0,0,0,.33,0s.07-.06.07-.09v-.59S59.18,29,59.13,29Z"/>
                    <ellipse class="cls-32" cx="58.97" cy="28.88" rx="0.13" ry="0.23" transform="translate(29.92 87.77) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-33" d="M59.07,28.49a.22.22,0,0,1-.21,0s0,0,0-.06v.43a.05.05,0,0,0,0,.06.22.22,0,0,0,.21,0s0,0,0-.06v-.44A.07.07,0,0,1,59.07,28.49Z"/>
                    <ellipse class="cls-34" cx="58.97" cy="28.43" rx="0.09" ry="0.15" transform="matrix(0, -1, 1, 0, 30.37, 87.32)"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-35" points="70.54 1.61 69.98 1.94 76.95 12.19 77.51 11.87 70.54 1.61"/>
                    <polygon class="cls-36" points="77.51 11.87 76.95 12.19 90.41 19.97 90.98 19.64 77.51 11.87"/>
                    <polygon class="cls-37" points="90.98 19.64 90.41 19.97 97.42 17.79 97.98 17.46 90.98 19.64"/>
                    <path class="cls-38" d="M68.31.33l8.44,12.4,13.86,8,8.48-2.64ZM90.41,20,77,12.19,70,1.94,97.42,17.79Z"/>
                    <polygon class="cls-36" points="68.88 0 68.31 0.33 99.09 18.09 99.65 17.77 68.88 0"/>
                </g>
                <g class="cls-9">
                    <path class="cls-39" d="M109.72,66.16a.22.22,0,0,1-.21,0,.07.07,0,0,1,0-.06v.44s0,0,0,.06a.26.26,0,0,0,.21,0s0,0,0-.06v-.44S109.75,66.14,109.72,66.16Z"/>
                    <ellipse class="cls-40" cx="109.62" cy="66.09" rx="0.09" ry="0.15" transform="matrix(0, -1, 1, 0, 43.22, 175.53)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-41" d="M109.78,65.64a.36.36,0,0,1-.32,0s-.07-.06-.07-.09v.58s0,.06.07.09a.36.36,0,0,0,.32,0,.12.12,0,0,0,.07-.09v-.58A.1.1,0,0,1,109.78,65.64Z"/>
                    <ellipse class="cls-42" cx="109.62" cy="65.55" rx="0.13" ry="0.23" transform="translate(43.76 174.98) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-43" d="M109.83,65.27a.48.48,0,0,1-.42,0,.15.15,0,0,1-.09-.12v.58a.14.14,0,0,0,.09.12.48.48,0,0,0,.42,0c.06,0,.09-.08.09-.13v-.58S109.89,65.23,109.83,65.27Z"/>
                    <ellipse class="cls-44" cx="109.62" cy="65.14" rx="0.17" ry="0.3" transform="translate(44.17 174.58) rotate(-89.84)"/>
                </g>
                <ellipse class="cls-16" cx="109.62" cy="64.64" rx="0.3" ry="0.51" transform="translate(44.67 174.07) rotate(-89.84)"/>
                <path class="cls-45" d="M108.82,64.75l.39-.29c-.15.11-.14.28,0,.38a.79.79,0,0,0,.73,0c.19-.1.21-.27,0-.39h0l.39.3c.3.23.26.56-.1.76a1.58,1.58,0,0,1-1.42,0C108.55,65.3,108.53,65,108.82,64.75Z"/>
                <ellipse class="cls-18" cx="109.62" cy="64.18" rx="0.3" ry="0.51" transform="matrix(0, -1, 1, 0, 45.13, 173.62)"/>
                <path class="cls-46" d="M110,64.39a.79.79,0,0,1-.73,0,.23.23,0,0,1-.14-.2v.49a.27.27,0,0,0,.15.21.82.82,0,0,0,.73,0,.24.24,0,0,0,.15-.21v-.49C110.14,64.26,110.08,64.33,110,64.39Z"/>
                <ellipse class="cls-16" cx="109.62" cy="63.74" rx="0.3" ry="0.51" transform="translate(45.57 173.18) rotate(-89.84)"/>
                <path class="cls-47" d="M108.82,63.86l.39-.3c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.21-.28,0-.4h0l.39.3c.3.23.26.56-.1.76a1.55,1.55,0,0,1-1.42,0C108.55,64.4,108.53,64.08,108.82,63.86Z"/>
                <ellipse class="cls-18" cx="109.62" cy="63.28" rx="0.3" ry="0.51" transform="translate(46.03 172.72) rotate(-89.84)"/>
                <path class="cls-48" d="M110,63.5a.82.82,0,0,1-.73,0,.25.25,0,0,1-.14-.21v.49a.25.25,0,0,0,.15.21.82.82,0,0,0,.73,0,.27.27,0,0,0,.15-.21v-.5A.28.28,0,0,1,110,63.5Z"/>
                <ellipse class="cls-16" cx="109.62" cy="62.85" rx="0.3" ry="0.51" transform="translate(46.46 172.29) rotate(-89.84)"/>
                <path class="cls-49" d="M108.82,63l.39-.29c-.15.11-.14.28,0,.38a.79.79,0,0,0,.73,0c.19-.1.21-.27,0-.39h0l.39.3c.3.23.26.55-.1.76a1.58,1.58,0,0,1-1.42,0A.42.42,0,0,1,108.82,63Z"/>
                <ellipse class="cls-18" cx="109.62" cy="62.39" rx="0.3" ry="0.51" transform="translate(46.92 171.83) rotate(-89.84)"/>
                <path class="cls-50" d="M110,62.6a.82.82,0,0,1-.73,0,.24.24,0,0,1-.14-.21v.5a.27.27,0,0,0,.15.21.82.82,0,0,0,.73,0,.25.25,0,0,0,.15-.21v-.49A.28.28,0,0,1,110,62.6Z"/>
                <ellipse class="cls-16" cx="109.62" cy="61.95" rx="0.3" ry="0.51" transform="translate(47.36 171.4) rotate(-89.84)"/>
                <path class="cls-51" d="M108.82,62.07l.39-.3c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.21-.28,0-.4h0l.39.3c.3.23.26.56-.1.76a1.55,1.55,0,0,1-1.42,0C108.55,62.61,108.53,62.29,108.82,62.07Z"/>
                <ellipse class="cls-18" cx="109.62" cy="61.49" rx="0.3" ry="0.51" transform="matrix(0, -1, 1, 0, 47.82, 170.94)"/>
                <path class="cls-52" d="M110,61.7a.79.79,0,0,1-.73,0,.25.25,0,0,1-.14-.21V62a.25.25,0,0,0,.15.21.82.82,0,0,0,.73,0,.27.27,0,0,0,.15-.22v-.49A.25.25,0,0,1,110,61.7Z"/>
                <ellipse class="cls-16" cx="109.62" cy="60.98" rx="0.3" ry="0.51" transform="translate(48.33 170.43) rotate(-89.84)"/>
                <path class="cls-53" d="M108.82,61.09l0,0h0l0,0,0,0h0l0,0,.19-.15c-.15.11-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.1.21-.27,0-.39l.39.3c.3.23.26.56-.1.76a1.58,1.58,0,0,1-1.42,0C108.55,61.64,108.53,61.32,108.82,61.09Z"/>
                <ellipse class="cls-18" cx="109.62" cy="60.55" rx="0.3" ry="0.51" transform="translate(48.76 170) rotate(-89.84)"/>
                <path class="cls-54" d="M110,60.77a.82.82,0,0,1-.73,0,.25.25,0,0,1-.14-.21V61a.27.27,0,0,0,.15.21.79.79,0,0,0,.73,0,.24.24,0,0,0,.15-.21v-.46A.3.3,0,0,1,110,60.77Z"/>
                <ellipse class="cls-16" cx="109.62" cy="60.04" rx="0.17" ry="0.3" transform="translate(49.27 169.49) rotate(-89.84)"/>
                <path class="cls-55" d="M109.77,59.89l.34.11.23.11c.38.23.37.59,0,.82a1.58,1.58,0,0,1-1.42,0c-.38-.23-.37-.59,0-.82l.49-.17c-.11.07-.12.17,0,.24a.48.48,0,0,0,.42,0c.11-.07.12-.18,0-.25Z"/>
                <g class="cls-9">
                    <path class="cls-56" d="M109.83,59.65a.48.48,0,0,1-.42,0,.14.14,0,0,1-.09-.12v.59s0,.08.09.12a.48.48,0,0,0,.42,0,.15.15,0,0,0,.09-.12v-.58A.15.15,0,0,1,109.83,59.65Z"/>
                    <ellipse class="cls-57" cx="109.62" cy="59.52" rx="0.17" ry="0.3" transform="translate(49.79 168.98) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-58" d="M109.78,59a.33.33,0,0,1-.32,0,.1.1,0,0,1-.07-.09v.58a.1.1,0,0,0,.07.09.33.33,0,0,0,.32,0s.07-.06.07-.1v-.58A.1.1,0,0,1,109.78,59Z"/>
                    <ellipse class="cls-59" cx="109.62" cy="58.93" rx="0.13" ry="0.23" transform="translate(50.38 168.38) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-60" d="M109.72,58.54a.26.26,0,0,1-.21,0s0,0,0-.06v.43s0,0,0,.06a.22.22,0,0,0,.21,0,.07.07,0,0,0,0-.06v-.43S109.75,58.52,109.72,58.54Z"/>
                    <ellipse class="cls-61" cx="109.62" cy="58.48" rx="0.09" ry="0.15" transform="translate(50.83 167.93) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-37" points="58.29 28.36 57.72 28.68 76.73 29.46 77.3 29.13 58.29 28.36"/>
                    <polygon class="cls-36" points="77.3 29.13 76.73 29.46 91.51 37.99 92.07 37.66 77.3 29.13"/>
                    <polygon class="cls-36" points="60.85 29.18 60.28 29.51 107.84 56.96 108.4 56.63 60.85 29.18"/>
                    <path class="cls-38" d="M91.51,38,76.73,29.46l-19-.78,52.67,30.41ZM76.79,30.15l14.59,8.42L107.84,57,60.28,29.51Z"/>
                    <polygon class="cls-35" points="92.07 37.66 91.51 37.99 110.39 59.09 110.96 58.76 92.07 37.66"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="68.97 0.85 55.08 8.92 55.37 9.09 69.25 1.02 68.97 0.85"/>
                    <polygon class="cls-62" points="55.37 9.09 55.37 9.41 69.25 1.34 69.25 1.02 55.37 9.09"/>
                    <polygon class="cls-63" points="55.08 8.92 55.08 9.25 55.37 9.41 55.37 9.09 55.08 8.92"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-64" points="94.32 97.34 90.05 13.48 88.91 12.89 93.19 96.81 97.65 135.47 98.78 135.94 94.32 97.34"/>
                    <polygon class="cls-65" points="95.45 96.68 91.18 12.82 90.05 13.48 94.32 97.34 98.78 135.94 99.91 135.28 95.45 96.68"/>
                    <polygon class="cls-66" points="90.04 12.23 88.91 12.89 90.05 13.48 91.18 12.82 90.04 12.23"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-67" points="75.36 5.29 75.07 134.9 76.21 135.56 76.5 5.95 75.36 5.29"/>
                    <polygon class="cls-68" points="76.5 5.95 76.21 135.56 77.34 134.9 77.63 5.29 76.5 5.95"/>
                    <polygon class="cls-69" points="75.36 5.29 76.49 4.64 77.63 5.29 76.5 5.95 75.36 5.29"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="75.83 12.48 63.11 19.86 63.39 20.02 76.11 12.64 75.83 12.48"/>
                    <polygon class="cls-62" points="63.39 20.02 63.39 20.35 76.11 12.97 76.11 12.64 63.39 20.02"/>
                    <polygon class="cls-63" points="63.11 19.86 63.11 20.18 63.39 20.35 63.39 20.02 63.11 19.86"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="89.7 20.14 76.98 27.52 77.27 27.68 89.99 20.31 89.7 20.14"/>
                    <polygon class="cls-62" points="77.27 27.68 77.27 28.01 89.99 20.63 89.99 20.31 77.27 27.68"/>
                    <polygon class="cls-63" points="76.98 27.52 76.98 27.84 77.27 28.01 77.27 27.68 76.98 27.52"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="89.41 13.58 76.69 20.96 76.98 21.12 89.7 13.75 89.41 13.58"/>
                    <polygon class="cls-62" points="76.98 21.12 76.98 21.45 89.69 14.07 89.7 13.75 76.98 21.12"/>
                    <polygon class="cls-63" points="76.69 20.96 76.69 21.29 76.98 21.45 76.98 21.12 76.69 20.96"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="75.77 6.36 63.05 13.74 63.34 13.9 76.06 6.53 75.77 6.36"/>
                    <polygon class="cls-62" points="63.34 13.9 63.34 14.23 76.06 6.85 76.06 6.53 63.34 13.9"/>
                    <polygon class="cls-63" points="63.05 13.74 63.05 14.06 63.34 14.23 63.34 13.9 63.05 13.74"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="108.9 57.72 93.63 66.6 93.92 66.76 109.19 57.89 108.9 57.72"/>
                    <polygon class="cls-62" points="93.92 66.76 93.92 67.09 109.19 58.22 109.19 57.89 93.92 66.76"/>
                    <polygon class="cls-38" points="93.63 66.6 93.63 66.92 93.92 67.09 93.92 66.76 93.63 66.6"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="90.59 37.67 75.32 46.54 75.61 46.71 90.88 37.84 90.59 37.67"/>
                    <polygon class="cls-62" points="75.61 46.71 75.61 47.04 90.88 38.16 90.88 37.84 75.61 46.71"/>
                    <polygon class="cls-38" points="75.32 46.54 75.32 46.87 75.61 47.04 75.61 46.71 75.32 46.54"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="91.21 47.76 75.94 56.63 76.23 56.8 91.5 47.93 91.21 47.76"/>
                    <polygon class="cls-62" points="76.23 56.8 76.23 57.13 91.5 48.26 91.5 47.93 76.23 56.8"/>
                    <polygon class="cls-38" points="75.94 56.63 75.94 56.96 76.23 57.13 76.23 56.8 75.94 56.63"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="97.87 17.5 83.98 25.57 84.27 25.73 98.16 17.66 97.87 17.5"/>
                    <polygon class="cls-62" points="84.27 25.73 84.27 26.06 98.15 17.99 98.16 17.66 84.27 25.73"/>
                    <polygon class="cls-63" points="83.98 25.57 83.98 25.9 84.27 26.06 84.27 25.73 83.98 25.57"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="95.86 117.67 76.24 129.11 76.8 129.44 96.43 118 95.86 117.67"/>
                    <polygon class="cls-62" points="76.8 129.44 76.8 130.09 96.43 118.66 96.43 118 76.8 129.44"/>
                    <polygon class="cls-63" points="76.24 129.11 76.23 129.77 76.8 130.09 76.8 129.44 76.24 129.11"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="92.82 82.53 76.24 92.2 76.8 92.53 93.39 82.86 92.82 82.53"/>
                    <polygon class="cls-62" points="76.8 92.53 76.8 93.19 93.39 83.51 93.39 82.86 76.8 92.53"/>
                    <polygon class="cls-38" points="76.24 92.2 76.23 92.86 76.8 93.19 76.8 92.53 76.24 92.2"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-70" points="75.36 19.74 75.07 149.34 76.21 150 76.5 20.39 75.36 19.74"/>
                    <polygon class="cls-71" points="76.5 20.39 76.21 150 77.34 149.34 77.63 19.74 76.5 20.39"/>
                    <polygon class="cls-72" points="76.49 19.08 75.36 19.74 76.5 20.39 77.63 19.74 76.49 19.08"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="75.43 71.09 58.63 80.86 59.2 81.19 76 71.42 75.43 71.09"/>
                    <polygon class="cls-62" points="59.2 81.19 59.2 81.85 76 72.07 76 71.42 59.2 81.19"/>
                    <polygon class="cls-38" points="59.2 81.19 59.2 81.85 58.63 81.52 58.63 80.86 59.2 81.19"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="75.43 105 55.16 116.82 55.73 117.15 76 105.33 75.43 105"/>
                    <polygon class="cls-62" points="55.73 117.15 55.73 117.8 76 105.99 76 105.33 55.73 117.15"/>
                    <polygon class="cls-63" points="55.16 116.82 55.16 117.47 55.73 117.8 55.73 117.15 55.16 116.82"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="75.78 30.07 61.8 38.2 62.09 38.36 76.07 30.24 75.78 30.07"/>
                    <polygon class="cls-62" points="62.09 38.36 62.08 38.69 76.07 30.56 76.07 30.24 62.09 38.36"/>
                    <polygon class="cls-38" points="61.8 38.2 61.8 38.53 62.08 38.69 62.09 38.36 61.8 38.2"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="75.78 39.07 61.8 47.2 62.09 47.36 76.07 39.24 75.78 39.07"/>
                    <polygon class="cls-62" points="62.09 47.36 62.08 47.69 76.07 39.56 76.07 39.24 62.09 47.36"/>
                    <polygon class="cls-38" points="61.8 47.2 61.8 47.53 62.08 47.69 62.09 47.36 61.8 47.2"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="58.79 28.84 43.52 37.71 43.81 37.88 59.08 29 58.79 28.84"/>
                    <polygon class="cls-62" points="43.81 37.88 43.81 38.2 59.08 29.33 59.08 29 43.81 37.88"/>
                    <polygon class="cls-38" points="43.52 37.71 43.52 38.04 43.81 38.2 43.81 37.88 43.52 37.71"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-73" points="62.6 13.08 56.38 96.87 51.73 133.42 52.86 134.26 57.52 97.65 63.74 13.8 62.6 13.08"/>
                    <polygon class="cls-74" points="63.73 12.42 62.6 13.08 63.74 13.8 64.87 13.15 63.73 12.42"/>
                    <polygon class="cls-75" points="63.74 13.8 57.52 97.65 52.86 134.26 53.99 133.6 58.65 96.99 64.87 13.15 63.74 13.8"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="75.07 128.29 75.07 128.94 55.19 117.46 55.75 117.13 75.07 128.29"/>
                    <polygon class="cls-38" points="75.07 128.94 75.07 129.6 55.19 118.12 55.19 117.46 75.07 128.94"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="95.34 115.47 95.42 116.16 76.66 105.33 77.22 105 95.34 115.47"/>
                    <polygon class="cls-38" points="95.5 116.87 76.66 105.99 76.66 105.33 95.42 116.16 95.5 116.87"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="75.18 91.45 75.18 92.1 58.87 82.71 59.43 82.38 75.18 91.45"/>
                    <polygon class="cls-38" points="75.18 92.1 75.18 92.75 58.86 83.36 58.87 82.71 75.18 92.1"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-36" points="92.35 80.34 76.82 71.4 77.38 71.07 92.32 79.67 92.35 80.34"/>
                    <polygon class="cls-38" points="92.38 81.01 76.81 72.05 76.82 71.4 92.35 80.34 92.38 81.01"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-35" points="56.1 9.54 55.53 9.87 62.5 20.11 63.07 19.79 56.1 9.54"/>
                    <polygon class="cls-36" points="63.07 19.79 62.5 20.11 75.97 27.89 76.54 27.56 63.07 19.79"/>
                    <polygon class="cls-37" points="76.54 27.56 75.97 27.89 82.98 25.71 83.54 25.38 76.54 27.56"/>
                    <path class="cls-38" d="M53.87,8.25l8.44,12.41,13.85,8L84.64,26ZM76,27.89,62.5,20.12l-7-10.26L83,25.71Z"/>
                    <polygon class="cls-36" points="54.44 7.92 53.87 8.25 84.64 26.02 85.21 25.69 54.44 7.92"/>
                </g>
                <g class="cls-9">
                    <path class="cls-76" d="M94.11,75.22a.26.26,0,0,1-.21,0,.07.07,0,0,1,0-.06v.43a.06.06,0,0,0,0,.06.2.2,0,0,0,.21,0,.06.06,0,0,0,0-.06v-.43S94.14,75.2,94.11,75.22Z"/>
                    <ellipse class="cls-77" cx="94.01" cy="75.16" rx="0.09" ry="0.15" transform="translate(18.58 168.95) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-78" d="M94.17,74.71a.33.33,0,0,1-.32,0,.1.1,0,0,1-.07-.09v.58a.1.1,0,0,0,.06.09.35.35,0,0,0,.33,0s.07-.06.07-.1v-.58S94.21,74.68,94.17,74.71Z"/>
                    <ellipse class="cls-79" cx="94.01" cy="74.61" rx="0.13" ry="0.23" transform="translate(19.13 168.41) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-80" d="M94.22,74.33a.48.48,0,0,1-.42,0q-.09-.06-.09-.12v.58a.17.17,0,0,0,.08.12.45.45,0,0,0,.42,0,.15.15,0,0,0,.09-.12v-.58A.15.15,0,0,1,94.22,74.33Z"/>
                    <ellipse class="cls-81" cx="94.01" cy="74.21" rx="0.17" ry="0.3" transform="translate(19.54 168.01) rotate(-89.84)"/>
                </g>
                <ellipse class="cls-16" cx="94.01" cy="73.7" rx="0.3" ry="0.51" transform="translate(20.04 167.5) rotate(-89.84)"/>
                <path class="cls-82" d="M93.21,73.82l.39-.3c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.2-.28,0-.4h0l.39.3c.3.23.26.56-.11.76a1.53,1.53,0,0,1-1.41,0C92.94,74.36,92.92,74,93.21,73.82Z"/>
                <ellipse class="cls-18" cx="94.01" cy="73.24" rx="0.3" ry="0.51" transform="matrix(0, -1, 1, 0, 20.5, 167.04)"/>
                <path class="cls-83" d="M94.37,73.46a.82.82,0,0,1-.73,0,.25.25,0,0,1-.15-.21v.49a.25.25,0,0,0,.15.21.82.82,0,0,0,.73,0,.27.27,0,0,0,.15-.21v-.5A.27.27,0,0,1,94.37,73.46Z"/>
                <ellipse class="cls-16" cx="94.01" cy="72.81" rx="0.3" ry="0.51" transform="translate(20.94 166.61) rotate(-89.84)"/>
                <path class="cls-84" d="M93.21,72.92l.39-.29c-.15.11-.14.28,0,.38a.78.78,0,0,0,.73,0,.22.22,0,0,0,0-.39h0l.39.3c.3.23.26.55-.11.76a1.53,1.53,0,0,1-1.41,0A.42.42,0,0,1,93.21,72.92Z"/>
                <ellipse class="cls-18" cx="94.01" cy="72.35" rx="0.3" ry="0.51" transform="translate(21.4 166.15) rotate(-89.84)"/>
                <path class="cls-85" d="M94.37,72.56a.82.82,0,0,1-.73,0,.25.25,0,0,1-.15-.21v.5a.27.27,0,0,0,.15.21.82.82,0,0,0,.73,0,.25.25,0,0,0,.15-.21v-.49A.27.27,0,0,1,94.37,72.56Z"/>
                <ellipse class="cls-16" cx="94.01" cy="71.91" rx="0.3" ry="0.51" transform="matrix(0, -1, 1, 0, 21.83, 165.72)"/>
                <path class="cls-86" d="M93.21,72l.39-.3c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.2-.28,0-.4h0l.39.3c.3.23.26.56-.11.76a1.53,1.53,0,0,1-1.41,0C92.94,72.57,92.92,72.25,93.21,72Z"/>
                <ellipse class="cls-18" cx="94.01" cy="71.45" rx="0.3" ry="0.51" transform="translate(22.29 165.26) rotate(-89.84)"/>
                <path class="cls-87" d="M94.37,71.66a.79.79,0,0,1-.73,0,.27.27,0,0,1-.15-.21v.49a.25.25,0,0,0,.15.21.82.82,0,0,0,.73,0,.27.27,0,0,0,.15-.22v-.49A.24.24,0,0,1,94.37,71.66Z"/>
                <ellipse class="cls-16" cx="94.01" cy="71.02" rx="0.3" ry="0.51" transform="translate(22.73 164.82) rotate(-89.84)"/>
                <path class="cls-88" d="M93.21,71.13l.39-.3c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.2-.27,0-.39h0l.39.3c.3.23.26.55-.11.76a1.56,1.56,0,0,1-1.41,0A.42.42,0,0,1,93.21,71.13Z"/>
                <ellipse class="cls-18" cx="94.01" cy="70.55" rx="0.3" ry="0.51" transform="matrix(0, -1, 1, 0, 23.19, 164.36)"/>
                <path class="cls-89" d="M94.37,70.77a.82.82,0,0,1-.73,0,.25.25,0,0,1-.15-.21v.5a.24.24,0,0,0,.15.2.78.78,0,0,0,.73,0,.25.25,0,0,0,.15-.21v-.49A.27.27,0,0,1,94.37,70.77Z"/>
                <ellipse class="cls-16" cx="94.01" cy="70.04" rx="0.3" ry="0.51" transform="translate(23.7 163.85) rotate(-89.84)"/>
                <path class="cls-90" d="M93.21,70.16l0,0,0,0,0,0,0,0,0,0,0,0,.2-.15c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.2-.28,0-.39l.39.29c.3.23.26.56-.11.77a1.56,1.56,0,0,1-1.41,0C92.94,70.7,92.92,70.38,93.21,70.16Z"/>
                <ellipse class="cls-18" cx="94.01" cy="69.62" rx="0.3" ry="0.51" transform="translate(24.13 163.43) rotate(-89.84)"/>
                <path class="cls-91" d="M94.37,69.83a.82.82,0,0,1-.73,0,.25.25,0,0,1-.15-.21v.46a.25.25,0,0,0,.15.21.82.82,0,0,0,.73,0,.27.27,0,0,0,.15-.21v-.46A.27.27,0,0,1,94.37,69.83Z"/>
                <ellipse class="cls-16" cx="94.01" cy="69.11" rx="0.17" ry="0.3" transform="translate(24.63 162.92) rotate(-89.84)"/>
                <path class="cls-92" d="M94.15,69l.35.11a1.12,1.12,0,0,1,.22.1c.39.23.38.6,0,.82a1.56,1.56,0,0,1-1.41,0,.43.43,0,0,1,0-.82L93.8,69a.13.13,0,0,0,0,.25.45.45,0,0,0,.42,0c.11-.06.12-.17,0-.24Z"/>
                <g class="cls-9">
                    <path class="cls-93" d="M94.22,68.71a.45.45,0,0,1-.42,0,.15.15,0,0,1-.09-.12v.58a.15.15,0,0,0,.08.12.45.45,0,0,0,.42,0,.14.14,0,0,0,.09-.12v-.58A.15.15,0,0,1,94.22,68.71Z"/>
                    <ellipse class="cls-94" cx="94.01" cy="68.59" rx="0.17" ry="0.3" transform="translate(25.15 162.4) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-95" d="M94.17,68.09a.36.36,0,0,1-.32,0s-.07-.06-.07-.1v.58a.12.12,0,0,0,.06.1.38.38,0,0,0,.33,0s.07-.06.07-.09V68S94.21,68.06,94.17,68.09Z"/>
                    <ellipse class="cls-96" cx="94.01" cy="67.99" rx="0.13" ry="0.23" transform="translate(25.75 161.81) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-97" d="M94.11,67.6a.2.2,0,0,1-.21,0,.07.07,0,0,1,0-.06V68a.07.07,0,0,0,0,.06.26.26,0,0,0,.21,0s0,0,0-.06v-.44A.07.07,0,0,1,94.11,67.6Z"/>
                    <ellipse class="cls-98" cx="94.01" cy="67.54" rx="0.09" ry="0.15" transform="matrix(0, -1, 1, 0, 26.2, 161.36)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-99" d="M43.11,45.22a.26.26,0,0,1-.21,0,.07.07,0,0,1,0-.06v.43a.06.06,0,0,0,0,.06.2.2,0,0,0,.21,0,.06.06,0,0,0,0-.06v-.43S43.14,45.2,43.11,45.22Z"/>
                    <ellipse class="cls-100" cx="43.01" cy="45.16" rx="0.09" ry="0.15" transform="translate(-2.27 88.04) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-101" d="M43.17,44.71a.33.33,0,0,1-.32,0,.1.1,0,0,1-.07-.09v.58a.1.1,0,0,0,.06.09.35.35,0,0,0,.33,0s.07-.06.07-.1v-.58S43.21,44.68,43.17,44.71Z"/>
                    <ellipse class="cls-102" cx="43.01" cy="44.61" rx="0.13" ry="0.23" transform="translate(-1.72 87.49) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-103" d="M43.22,44.33a.48.48,0,0,1-.42,0q-.09-.06-.09-.12v.58a.17.17,0,0,0,.08.12.45.45,0,0,0,.42,0,.15.15,0,0,0,.09-.12v-.58A.15.15,0,0,1,43.22,44.33Z"/>
                    <ellipse class="cls-104" cx="43.01" cy="44.21" rx="0.17" ry="0.3" transform="translate(-1.32 87.09) rotate(-89.84)"/>
                </g>
                <ellipse class="cls-16" cx="43.01" cy="43.7" rx="0.3" ry="0.51" transform="translate(-0.81 86.59) rotate(-89.84)"/>
                <path class="cls-105" d="M42.21,43.82l.39-.3c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.2-.28.05-.4h0l.39.3c.3.23.26.56-.11.76a1.53,1.53,0,0,1-1.41,0C41.94,44.36,41.92,44,42.21,43.82Z"/>
                <ellipse class="cls-18" cx="43.01" cy="43.24" rx="0.3" ry="0.51" transform="matrix(0, -1, 1, 0, -0.35, 86.13)"/>
                <path class="cls-106" d="M43.37,43.46a.82.82,0,0,1-.73,0,.25.25,0,0,1-.15-.21v.49a.25.25,0,0,0,.15.21.82.82,0,0,0,.73,0,.27.27,0,0,0,.15-.21v-.5A.27.27,0,0,1,43.37,43.46Z"/>
                <ellipse class="cls-16" cx="43.01" cy="42.81" rx="0.3" ry="0.51" transform="translate(0.08 85.69) rotate(-89.84)"/>
                <path class="cls-107" d="M42.21,42.92l.39-.29c-.15.11-.14.28,0,.38a.78.78,0,0,0,.73,0,.22.22,0,0,0,.05-.39h0l.39.3c.3.23.26.55-.11.76a1.53,1.53,0,0,1-1.41,0A.42.42,0,0,1,42.21,42.92Z"/>
                <ellipse class="cls-18" cx="43.01" cy="42.35" rx="0.3" ry="0.51" transform="translate(0.54 85.23) rotate(-89.84)"/>
                <path class="cls-108" d="M43.37,42.56a.82.82,0,0,1-.73,0,.25.25,0,0,1-.15-.21v.5a.27.27,0,0,0,.15.21.82.82,0,0,0,.73,0,.25.25,0,0,0,.15-.21v-.49A.27.27,0,0,1,43.37,42.56Z"/>
                <ellipse class="cls-16" cx="43.01" cy="41.91" rx="0.3" ry="0.51" transform="matrix(0, -1, 1, 0, 0.98, 84.8)"/>
                <path class="cls-109" d="M42.21,42l.39-.3c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.2-.28.05-.4h0l.39.3c.3.23.26.56-.11.76a1.53,1.53,0,0,1-1.41,0C41.94,42.57,41.92,42.25,42.21,42Z"/>
                <ellipse class="cls-18" cx="43.01" cy="41.45" rx="0.3" ry="0.51" transform="translate(1.44 84.34) rotate(-89.84)"/>
                <path class="cls-110" d="M43.37,41.66a.79.79,0,0,1-.73,0,.27.27,0,0,1-.15-.21v.49a.25.25,0,0,0,.15.21.82.82,0,0,0,.73,0,.27.27,0,0,0,.15-.22v-.49A.24.24,0,0,1,43.37,41.66Z"/>
                <ellipse class="cls-16" cx="43.01" cy="41.02" rx="0.3" ry="0.51" transform="translate(1.87 83.91) rotate(-89.84)"/>
                <path class="cls-111" d="M42.21,41.13l.39-.3c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.2-.27.05-.39h0l.39.3c.3.23.26.55-.11.76a1.56,1.56,0,0,1-1.41,0A.42.42,0,0,1,42.21,41.13Z"/>
                <ellipse class="cls-18" cx="43.01" cy="40.55" rx="0.3" ry="0.51" transform="matrix(0, -1, 1, 0, 2.33, 83.45)"/>
                <path class="cls-112" d="M43.37,40.77a.82.82,0,0,1-.73,0,.25.25,0,0,1-.15-.21v.5a.24.24,0,0,0,.15.2.78.78,0,0,0,.73,0,.25.25,0,0,0,.15-.21v-.49A.27.27,0,0,1,43.37,40.77Z"/>
                <ellipse class="cls-16" cx="43.01" cy="40.04" rx="0.3" ry="0.51" transform="translate(2.84 82.94) rotate(-89.84)"/>
                <path class="cls-113" d="M42.21,40.16l0,0,0,0,0,0,0,0,0,0,0,0,.2-.15c-.15.12-.14.28,0,.39a.82.82,0,0,0,.73,0c.19-.11.2-.28.05-.39l.39.29c.3.23.26.56-.11.77a1.56,1.56,0,0,1-1.41,0C41.94,40.7,41.92,40.38,42.21,40.16Z"/>
                <ellipse class="cls-18" cx="43.01" cy="39.62" rx="0.3" ry="0.51" transform="translate(3.27 82.51) rotate(-89.84)"/>
                <path class="cls-114" d="M43.37,39.83a.82.82,0,0,1-.73,0,.25.25,0,0,1-.15-.21v.46a.25.25,0,0,0,.15.21.82.82,0,0,0,.73,0,.27.27,0,0,0,.15-.21v-.46A.27.27,0,0,1,43.37,39.83Z"/>
                <ellipse class="cls-16" cx="43.01" cy="39.11" rx="0.17" ry="0.3" transform="translate(3.78 82.01) rotate(-89.84)"/>
                <path class="cls-115" d="M43.15,39l.35.11a1.12,1.12,0,0,1,.22.1c.39.23.38.6,0,.82a1.56,1.56,0,0,1-1.41,0,.43.43,0,0,1,0-.82L42.8,39a.13.13,0,0,0,0,.25.45.45,0,0,0,.42,0c.11-.06.12-.17,0-.24Z"/>
                <g class="cls-9">
                    <path class="cls-116" d="M43.22,38.71a.45.45,0,0,1-.42,0,.15.15,0,0,1-.09-.12v.58a.15.15,0,0,0,.08.12.45.45,0,0,0,.42,0,.14.14,0,0,0,.09-.12v-.58A.15.15,0,0,1,43.22,38.71Z"/>
                    <ellipse class="cls-117" cx="43.01" cy="38.59" rx="0.17" ry="0.3" transform="translate(4.3 81.49) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-118" d="M43.17,38.09a.36.36,0,0,1-.32,0c-.05,0-.07-.06-.07-.1v.58a.12.12,0,0,0,.06.1.38.38,0,0,0,.33,0s.07-.06.07-.09V38S43.21,38.06,43.17,38.09Z"/>
                    <ellipse class="cls-119" cx="43.01" cy="37.99" rx="0.13" ry="0.23" transform="translate(4.89 80.9) rotate(-89.84)"/>
                </g>
                <g class="cls-9">
                    <path class="cls-120" d="M43.11,37.6a.2.2,0,0,1-.21,0,.07.07,0,0,1,0-.06V38a.07.07,0,0,0,0,.06.26.26,0,0,0,.21,0s0,0,0-.06v-.44A.07.07,0,0,1,43.11,37.6Z"/>
                    <ellipse class="cls-121" cx="43.01" cy="37.54" rx="0.09" ry="0.15" transform="matrix(0, -1, 1, 0, 5.35, 80.44)"/>
                </g>
                <g class="cls-9">
                    <polygon class="cls-37" points="42.24 37.12 41.68 37.45 60.69 38.23 61.25 37.9 42.24 37.12"/>
                    <polygon class="cls-36" points="61.25 37.9 60.69 38.23 75.46 46.75 76.02 46.42 61.25 37.9"/>
                    <polygon class="cls-36" points="44.8 37.95 44.24 38.27 91.79 65.73 92.36 65.4 44.8 37.95"/>
                    <path class="cls-38" d="M75.46,46.75,60.69,38.23l-19-.78L94.35,67.86ZM60.75,38.91l14.58,8.42,16.46,18.4L44.24,38.27Z"/>
                    <polygon class="cls-35" points="76.02 46.42 75.46 46.75 94.34 67.86 94.91 67.53 76.02 46.42"/>
                </g>
                <image width="77" height="46" transform="translate(62.5 48.5)" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAuCAYAAABtaZREAAAACXBIWXMAAAsSAAALEgHS3X78AAABr0lEQVRoQ+2bP04CQRxG3yRbaqO9nAF77uBZOIhnsbSnxzNoLZX0Y8Giqwzf7MLu7Px7CQUJNi/f77khwVhrqWjMMwa4Ae6AXeP5fNF0ZD20r3tgU6U5+CdrATwCFthQl3aKeeaWv7IAtsA78GHX7Ku0ls66lsAKMHRkAXu7xgKY0v8ROE5xwUHUiawjxS7N0603HLKOFCmtR7e+zv0tFCZtSLcURTTtkm4psl+a4xR7dUuRrTTfKfq6pcjuPMc+RRfZLO2aR4ihZCHt2keIoSQtzdctRlxXlySbFqJbiqSWFrJbimSkhe6WInppc3VLEW3T5u6WIrqlxdItRVTSYuqWIgppMXZLMWvTYu6WYralTfGVTSiCS/OdYizdUgQ7z1RP0cXkS0vhEWIok0pL5RFiKJNI83WLBNfVZdSm5dQtxShLy7Fbiqul5dotxcXScu+WYnDTSumWovfSSuuWope0ErulkNJK7pbC2bTaLc3J0lL+yiYUP9J8p1hatxTGWntc14LfhdVTFDStsBXwBOyAVw4Lq7LO0HD46cqyfb8BtvUUNQ3wCby072u7evAN/rVIn0eT280AAAAASUVORK5CYII="/>
                <line class="cls-122" x1="137.58" y1="50.49" x2="64.32" y2="92.79"/>
                <image width="11" height="7" transform="translate(70.5 82.5)" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAHCAYAAADebrddAAAACXBIWXMAAAsSAAALEgHS3X78AAAAeklEQVQYV3XOMQ6CUBAE0PcTSirpxTNwJI/wD+Kl7PUM0GMjjdXaLESJTrLd28mUiPAr5aKgxQFzVEvZ4w90zOtwxdT8QT0GRMI5qmgStjglHPL/hhFTVAs02djjjFc2jZiwRLXt3GZgxj3xF1pTImKd0eER1XOP1rwBhZItnXVH4NoAAAAASUVORK5CYII="/>
                <line class="cls-123" x1="79.3" y1="84.14" x2="72.95" y2="87.8"/>
                <image width="14" height="10" transform="translate(99.5 63.5)" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAACXBIWXMAAAsSAAALEgHS3X78AAAAl0lEQVQoU43QsRGCUBAE0HczhppoLjVoTg/WQiHUY25OD5gbaX4GgCKKujNkvNm9H5npn0QtsMQal8WP/8dg238bnGbhBBTYI3Ey1xi11QRAgxbnrNxe4KhlhxIxBrhlJSGGx+lbCs+m9hMYshihEgdccOyb3sAD9vM2unl0xzdZuX4CQyIzRW2pm0d3/FfE640Bc9OmuQPseDneszoUngAAAABJRU5ErkJggg=="/>
                <line class="cls-124" x1="111.58" y1="65.5" x2="102.06" y2="71"/>
                <polygon class="cls-125" points="106 117.5 76.59 134.59 47 117.5 76.41 100.41 106 117.5"/>
                <path class="cls-126" d="M76.41,100.7l29.09,16.8L76.59,134.3,47.5,117.5l28.91-16.8m0-.29L47,117.5l29.59,17.09L106,117.5,76.41,100.41Z"/>
                <polygon class="cls-127" points="101.54 83.5 76.58 98 51.47 83.5 76.42 69 101.54 83.5"/>
                <path class="cls-128" d="M76.43,69.29,101,83.5,76.58,97.71,52,83.5,76.43,69.29m0-.29-25,14.5L76.58,98l25-14.5L76.42,69Z"/>
                <polygon class="cls-129" points="98.08 48.5 76.57 61 54.92 48.5 76.44 36 98.08 48.5"/>
                <path class="cls-130" d="M76.44,36.29,97.58,48.5l-21,12.21L55.42,48.5l21-12.21m0-.29L54.92,48.5,76.57,61,98.08,48.5,76.44,36Z"/>
                <g class="cls-131">
                    <path d="M56.77,79.79c-.17.37-.39.79-.65,1.25s-.54.95-.84,1.44-.6,1-.9,1.43-.59.88-.85,1.25L51.19,84c.27-.37.56-.77.87-1.22s.61-.9.89-1.36.55-.91.79-1.36.44-.83.59-1.18Zm4-1.85v4.12a4.2,4.2,0,0,1-.13,1.17,1.73,1.73,0,0,1-.45.73,2.5,2.5,0,0,1-.81.46c-.33.11-.73.23-1.21.34L57,85.05l-.83-2.59.9-.22a3.13,3.13,0,0,0,.72-.27.67.67,0,0,0,.2-.55V78.31l-5.59.74.6-7.74L55,71l2.11-.34,2.14-.39c.71-.13,1.4-.27,2.06-.41s1.29-.27,1.87-.41,1.11-.26,1.57-.39l.55,2.63-2.08.48c-.76.17-1.57.34-2.41.5l-2.6.49-2.58.45-.17,2.55L58,75.84V73.63l2.78-.31v2.15l4.93-.65v2.47Zm2.72-.22c.17.19.39.45.65.78s.54.69.83,1.08.58.79.86,1.2.54.81.77,1.18l-2.36,1.82c-.18-.35-.4-.74-.65-1.15s-.51-.83-.79-1.24L62,80.25c-.27-.36-.51-.66-.73-.91Z"/>
                    <path d="M82.29,72.9v2.21L67.65,77V74.82l3.27-.43.25-1-2.39.31V71.84l2.84-.37.21-.87-3.4.44V68.85l13.08-1.73v2.2l-6.85.9-.21.88,6-.79-.15,2.85ZM69.1,77.56,80.85,76v5.63L69.1,83.19Zm2.59,3.09,6.44-.84V78.52l-6.44.85ZM73.77,74l3.87-.51.07-1L74,73.05Z"/>
                    <path d="M89,75.55c-.17.37-.39.79-.65,1.25s-.54,1-.84,1.44-.6,1-.9,1.43-.59.88-.85,1.25l-2.34-1.13c.27-.36.56-.76.87-1.21s.61-.9.9-1.36.55-.91.79-1.36.43-.83.58-1.18Zm4-1.85v4.12A3.91,3.91,0,0,1,92.83,79a1.55,1.55,0,0,1-.45.73,2,2,0,0,1-.8.45c-.33.12-.74.23-1.22.35l-1.17.29-.83-2.6.9-.21a2.12,2.12,0,0,0,.72-.28.59.59,0,0,0,.21-.54V74.07l-5.6.74.58-7.74,2-.29,2.11-.34,2.14-.39c.72-.13,1.4-.27,2.07-.41s1.28-.27,1.87-.41,1.1-.26,1.56-.39l.55,2.63-2.1.53c-.77.17-1.57.34-2.42.5L90.36,69l-2.58.45L87.6,72l2.59-.34V69.38l2.78-.3v2.15l4.93-.65v2.47Zm2.71-.22q.27.28.66.78l.83,1.08c.29.39.58.79.86,1.2s.53.81.76,1.18l-2.36,1.82c-.18-.35-.4-.74-.65-1.16s-.51-.82-.79-1.23-.54-.78-.81-1.14-.51-.66-.72-.91Z"/>
                </g>
          <!-- Warning flashing LED at the top of the tower -->
          <circle cx="76.5" cy="5.3" r="3" fill="#00f3ff" class="power-glow" :filter="'url(#laserGlow-' + id + ')'" />
        </g>
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
              {{ finalStatus === 'running' ? '正常发供电' : finalStatus === 'warning' ? '负载超负荷' : '离线停机' }}
            </span>
          </div>
          <div class="tooltip-row">
            <span class="lbl">实时指标:</span>
            <span class="val text-cyan-400">{{ valueText }} {{ props.unit }}</span>
          </div>
          <div v-if="deviceType === 'pv_panel'" class="tooltip-body-group">
            <div class="tooltip-row"><span class="lbl">组件温度:</span><span class="val">26.5 °C</span></div>
            <div class="tooltip-row"><span class="lbl">实时光照:</span><span class="val">933.8 W/m²</span></div>
          </div>
          <div v-if="deviceType === 'inverter'" class="tooltip-body-group">
            <div class="tooltip-row"><span class="lbl">转换效率:</span><span class="val">98.8 %</span></div>
            <div class="tooltip-row"><span class="lbl">输入直流电压:</span><span class="val">680 V</span></div>
          </div>
          <div v-if="deviceType === 'box_transformer'" class="tooltip-body-group">
            <div class="tooltip-row"><span class="lbl">绕组温度:</span><span class="val">54.2 °C</span></div>
            <div class="tooltip-row"><span class="lbl">绝缘电阻:</span><span class="val">2500 MΩ</span></div>
          </div>
          <div v-if="deviceType === 'transmission_tower'" class="tooltip-body-group">
            <div class="tooltip-row"><span class="lbl">并网频率:</span><span class="val">50.02 Hz</span></div>
            <div class="tooltip-row"><span class="lbl">线路相电压:</span><span class="val">110.2 kV</span></div>
          </div>
          <div class="tooltip-row">
            <span class="lbl">环境温度:</span>
            <span class="val">26.0 °C</span>
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
    deviceType?: 'pv_panel' | 'combiner_box' | 'inverter' | 'box_transformer' | 'transmission_tower'
    status?: 'running' | 'warning' | 'stopped'
    value?: string | number
    unit?: string
    flipX?: boolean
    flipY?: boolean
    transparentBg?: boolean
    xField?: string
    yField?: string
    rows?: Record<string, unknown>[]
  }>(),
  {
    id: () => 'pv-' + Math.random().toString(36).substr(2, 9),
    deviceType: 'pv_panel',
    status: 'running',
    value: '',
    unit: '',
    flipX: false,
    flipY: false,
    transparentBg: true,
    rows: () => []
  }
)

const isHovered = ref(false)

const isTransparent = computed(() => props.transparentBg)

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

const titleText = computed(() => props.text || getDefaultTitle())

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
  }
  return props.status
})

function getDefaultTitle() {
  if (props.deviceType === 'pv_panel') return '光伏发电板组'
  if (props.deviceType === 'combiner_box') return '智能汇流箱'
  if (props.deviceType === 'inverter') return '智能逆变器'
  if (props.deviceType === 'box_transformer') return '箱式变压器'
  if (props.deviceType === 'transmission_tower') return '并网高压电塔'
  return '光伏组件'
}

function getDefaultStaticValue() {
  if (props.deviceType === 'pv_panel') return '25.4'
  if (props.deviceType === 'combiner_box') return '315'
  if (props.deviceType === 'inverter') return '254.5'
  if (props.deviceType === 'box_transformer') return '10.5'
  if (props.deviceType === 'transmission_tower') return '110'
  return '--'
}
</script>

<style scoped>
.pv-device-card {
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

.pv-device-card:hover, .pv-device-card.hovered {
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 
    0 8px 30px rgba(56, 189, 248, 0.2),
    inset 0 0 15px rgba(56, 189, 248, 0.08);
  transform: translateY(-2px) scale(1.02);
}

.pv-device-card.is-transparent {
  background: transparent !important;
  border-color: transparent !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
}
.pv-device-card.is-transparent:hover, .pv-device-card.is-transparent.hovered {
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

.isometric-group {
  transition: all 0.3s ease;
}

/* Animations */
.power-glow {
  animation: led-flash 1.5s steps(2, start) infinite;
}

@keyframes led-flash {
  to { visibility: hidden; }
}

.gauge-fluid {
  animation: fluid-pulse 3s ease-in-out infinite alternate;
  transform-origin: bottom;
}
@keyframes fluid-pulse {
  from { transform: scaleY(0.7); }
  to { transform: scaleY(1); }
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric-text {
  font-size: 13px;
  font-weight: 700;
  color: #38bdf8;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
}

.metric-text .unit {
  font-size: 9px;
  color: #64748b;
  margin-left: 2px;
}

/* Status dots */
.status-beacon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  z-index: 4;
}

.status-beacon.running {
  background-color: #10b981;
  box-shadow: 0 0 8px #10b981;
}
.status-beacon.warning {
  background-color: #fbbf24;
  box-shadow: 0 0 8px #fbbf24;
  animation: beacon-ping 1s ease-in-out infinite alternate;
}
.status-beacon.stopped {
  background-color: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

@keyframes beacon-ping {
  from { transform: scale(0.9); opacity: 0.7; }
  to { transform: scale(1.3); opacity: 1; }
}

/* Telemetry Tooltip styles */
.device-tooltip {
  position: absolute;
  width: 180px;
  background: rgba(8, 14, 28, 0.95);
  border: 1px solid rgba(56, 189, 248, 0.4);
  border-radius: 6px;
  padding: 10px;
  box-shadow: 
    0 10px 25px -5px rgba(0, 0, 0, 0.8),
    0 0 15px rgba(56, 189, 248, 0.15);
  backdrop-filter: blur(8px);
  z-index: 100;
  bottom: 105%;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
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
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
  padding-bottom: 4px;
  margin-bottom: 6px;
}

.tooltip-led {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.tooltip-led.running { background-color: #10b981; box-shadow: 0 0 4px #10b981; }
.tooltip-led.warning { background-color: #fbbf24; box-shadow: 0 0 4px #fbbf24; }
.tooltip-led.stopped { background-color: #ef4444; box-shadow: 0 0 4px #ef4444; }

.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-body-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 2px 0;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
  padding: 3px 0;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
}

.tooltip-row .lbl {
  color: #64748b;
}

.tooltip-row .val {
  color: #cbd5e1;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px) scale(0.95);
}
  

            .cls-1,.cls-122,.cls-123,.cls-124,.cls-2,.cls-6,.cls-7,.cls-8 {
                fill: none;
            }

            .cls-2 {
                stroke: #fff;
                stroke-width: 0.1px;
            }

            .cls-122,.cls-123,.cls-124,.cls-2,.cls-6,.cls-7,.cls-8 {
                stroke-miterlimit: 10;
            }

            .cls-3 {
                opacity: 0;
            }

            .cls-4 {
                fill: #000714;
            }

            .cls-5 {
                opacity: 0.1;
                fill: url(#新建图案);
            }

            .cls-122,.cls-123,.cls-124,.cls-6,.cls-7,.cls-8 {
                stroke-linecap: round;
                stroke-width: 0.25px;
            }

            .cls-6 {
                stroke: url(#未命名的渐变_70);
            }

            .cls-7 {
                stroke: url(#未命名的渐变_41);
            }

            .cls-8 {
                stroke: url(#未命名的渐变_41-2);
            }

            .cls-9 {
                isolation: isolate;
            }

            .cls-10 {
                fill: url(#未命名的渐变_506);
            }

            .cls-11 {
                fill: url(#未命名的渐变_13);
            }

            .cls-12 {
                fill: url(#未命名的渐变_506-2);
            }

            .cls-13 {
                fill: url(#未命名的渐变_13-2);
            }

            .cls-14 {
                fill: url(#未命名的渐变_506-3);
            }

            .cls-15 {
                fill: url(#未命名的渐变_13-3);
            }

            .cls-16 {
                fill: #0ea5e9;
            }

            .cls-17 {
                fill: url(#未命名的渐变_16679);
            }

            .cls-18 {
                fill: #0284c7;
            }

            .cls-19 {
                fill: url(#未命名的渐变_515);
            }

            .cls-20 {
                fill: url(#未命名的渐变_16679-2);
            }

            .cls-21 {
                fill: url(#未命名的渐变_515-2);
            }

            .cls-22 {
                fill: url(#未命名的渐变_16679-3);
            }

            .cls-23 {
                fill: url(#未命名的渐变_515-3);
            }

            .cls-24 {
                fill: url(#未命名的渐变_16679-4);
            }

            .cls-25 {
                fill: url(#未命名的渐变_515-4);
            }

            .cls-26 {
                fill: url(#未命名的渐变_16679-5);
            }

            .cls-27 {
                fill: url(#未命名的渐变_515-5);
            }

            .cls-28 {
                fill: url(#未命名的渐变_16679-6);
            }

            .cls-29 {
                fill: url(#未命名的渐变_506-4);
            }

            .cls-30 {
                fill: url(#未命名的渐变_13-4);
            }

            .cls-31 {
                fill: url(#未命名的渐变_506-5);
            }

            .cls-32 {
                fill: url(#未命名的渐变_13-5);
            }

            .cls-33 {
                fill: url(#未命名的渐变_506-6);
            }

            .cls-34 {
                fill: url(#未命名的渐变_13-6);
            }

            .cls-35 {
                fill: #314159;
            }

            .cls-36 {
                fill: #7696cb;
            }

            .cls-37 {
                fill: #95b4e6;
            }

            .cls-38 {
                fill: #4e5f79;
            }

            .cls-39 {
                fill: url(#未命名的渐变_506-7);
            }

            .cls-40 {
                fill: url(#未命名的渐变_13-7);
            }

            .cls-41 {
                fill: url(#未命名的渐变_506-8);
            }

            .cls-42 {
                fill: url(#未命名的渐变_13-8);
            }

            .cls-43 {
                fill: url(#未命名的渐变_506-9);
            }

            .cls-44 {
                fill: url(#未命名的渐变_13-9);
            }

            .cls-45 {
                fill: url(#未命名的渐变_16679-7);
            }

            .cls-46 {
                fill: url(#未命名的渐变_515-6);
            }

            .cls-47 {
                fill: url(#未命名的渐变_16679-8);
            }

            .cls-48 {
                fill: url(#未命名的渐变_515-7);
            }

            .cls-49 {
                fill: url(#未命名的渐变_16679-9);
            }

            .cls-50 {
                fill: url(#未命名的渐变_515-8);
            }

            .cls-51 {
                fill: url(#未命名的渐变_16679-10);
            }

            .cls-52 {
                fill: url(#未命名的渐变_515-9);
            }

            .cls-53 {
                fill: url(#未命名的渐变_16679-11);
            }

            .cls-54 {
                fill: url(#未命名的渐变_515-10);
            }

            .cls-55 {
                fill: url(#未命名的渐变_16679-12);
            }

            .cls-56 {
                fill: url(#未命名的渐变_506-10);
            }

            .cls-57 {
                fill: url(#未命名的渐变_13-10);
            }

            .cls-58 {
                fill: url(#未命名的渐变_506-11);
            }

            .cls-59 {
                fill: url(#未命名的渐变_13-11);
            }

            .cls-60 {
                fill: url(#未命名的渐变_506-12);
            }

            .cls-61 {
                fill: url(#未命名的渐变_13-12);
            }

            .cls-62 {
                fill: #171d23;
            }

            .cls-63 {
                fill: #898989;
            }

            .cls-64 {
                fill: url(#未命名的渐变_71);
            }

            .cls-65 {
                fill: url(#未命名的渐变_107);
            }

            .cls-66 {
                fill: url(#未命名的渐变_13-13);
            }

            .cls-67 {
                fill: url(#未命名的渐变_71-2);
            }

            .cls-68 {
                fill: url(#未命名的渐变_107-2);
            }

            .cls-69 {
                fill: url(#未命名的渐变_13-14);
            }

            .cls-70 {
                fill: url(#未命名的渐变_71-3);
            }

            .cls-71 {
                fill: url(#未命名的渐变_107-3);
            }

            .cls-72 {
                fill: url(#未命名的渐变_13-15);
            }

            .cls-73 {
                fill: url(#未命名的渐变_71-4);
            }

            .cls-74 {
                fill: url(#未命名的渐变_13-16);
            }

            .cls-75 {
                fill: url(#未命名的渐变_107-4);
            }

            .cls-76 {
                fill: url(#未命名的渐变_506-13);
            }

            .cls-77 {
                fill: url(#未命名的渐变_13-17);
            }

            .cls-78 {
                fill: url(#未命名的渐变_506-14);
            }

            .cls-79 {
                fill: url(#未命名的渐变_13-18);
            }

            .cls-80 {
                fill: url(#未命名的渐变_506-15);
            }

            .cls-81 {
                fill: url(#未命名的渐变_13-19);
            }

            .cls-82 {
                fill: url(#未命名的渐变_16679-13);
            }

            .cls-83 {
                fill: url(#未命名的渐变_515-11);
            }

            .cls-84 {
                fill: url(#未命名的渐变_16679-14);
            }

            .cls-85 {
                fill: url(#未命名的渐变_515-12);
            }

            .cls-86 {
                fill: url(#未命名的渐变_16679-15);
            }

            .cls-87 {
                fill: url(#未命名的渐变_515-13);
            }

            .cls-88 {
                fill: url(#未命名的渐变_16679-16);
            }

            .cls-89 {
                fill: url(#未命名的渐变_515-14);
            }

            .cls-90 {
                fill: url(#未命名的渐变_16679-17);
            }

            .cls-91 {
                fill: url(#未命名的渐变_515-15);
            }

            .cls-92 {
                fill: url(#未命名的渐变_16679-18);
            }

            .cls-93 {
                fill: url(#未命名的渐变_506-16);
            }

            .cls-94 {
                fill: url(#未命名的渐变_13-20);
            }

            .cls-95 {
                fill: url(#未命名的渐变_506-17);
            }

            .cls-96 {
                fill: url(#未命名的渐变_13-21);
            }

            .cls-97 {
                fill: url(#未命名的渐变_506-18);
            }

            .cls-98 {
                fill: url(#未命名的渐变_13-22);
            }

            .cls-99 {
                fill: url(#未命名的渐变_506-19);
            }

            .cls-100 {
                fill: url(#未命名的渐变_13-23);
            }

            .cls-101 {
                fill: url(#未命名的渐变_506-20);
            }

            .cls-102 {
                fill: url(#未命名的渐变_13-24);
            }

            .cls-103 {
                fill: url(#未命名的渐变_506-21);
            }

            .cls-104 {
                fill: url(#未命名的渐变_13-25);
            }

            .cls-105 {
                fill: url(#未命名的渐变_16679-19);
            }

            .cls-106 {
                fill: url(#未命名的渐变_515-16);
            }

            .cls-107 {
                fill: url(#未命名的渐变_16679-20);
            }

            .cls-108 {
                fill: url(#未命名的渐变_515-17);
            }

            .cls-109 {
                fill: url(#未命名的渐变_16679-21);
            }

            .cls-110 {
                fill: url(#未命名的渐变_515-18);
            }

            .cls-111 {
                fill: url(#未命名的渐变_16679-22);
            }

            .cls-112 {
                fill: url(#未命名的渐变_515-19);
            }

            .cls-113 {
                fill: url(#未命名的渐变_16679-23);
            }

            .cls-114 {
                fill: url(#未命名的渐变_515-20);
            }

            .cls-115 {
                fill: url(#未命名的渐变_16679-24);
            }

            .cls-116 {
                fill: url(#未命名的渐变_506-22);
            }

            .cls-117 {
                fill: url(#未命名的渐变_13-26);
            }

            .cls-118 {
                fill: url(#未命名的渐变_506-23);
            }

            .cls-119 {
                fill: url(#未命名的渐变_13-27);
            }

            .cls-120 {
                fill: url(#未命名的渐变_506-24);
            }

            .cls-121 {
                fill: url(#未命名的渐变_13-28);
            }

            .cls-122 {
                stroke: url(#未命名的渐变_70-2);
            }

            .cls-123 {
                stroke: url(#未命名的渐变_41-3);
            }

            .cls-124 {
                stroke: url(#未命名的渐变_41-4);
            }

            .cls-125 {
                fill: url(#未命名的渐变_81);
            }

            .cls-126 {
                fill: url(#未命名的渐变_86);
            }

            .cls-127 {
                fill: url(#未命名的渐变_81-2);
            }

            .cls-128 {
                fill: url(#未命名的渐变_86-2);
            }

            .cls-129 {
                fill: url(#未命名的渐变_81-3);
            }

            .cls-130 {
                fill: url(#未命名的渐变_86-3);
            }

            .cls-131 {
                opacity: 0.2;
            }
        
.box-cls-1,.box-cls-2{fill:none;}.box-cls-2{stroke:#fff;stroke-width:0.1px;}.box-cls-16,.box-cls-2{stroke-miterlimit:10;}.box-cls-3{opacity:0;}.box-cls-11,.box-cls-4{fill:#000714;}.box-cls-5{opacity:0.1;fill:url(#新建图案);}.box-cls-6{fill:#2e3c4d;}.box-cls-7{fill:#1a1f27;}.box-cls-8{isolation:isolate;}.box-cls-9{fill:url(#未命名的渐变_71);}.box-cls-10{fill:url(#未命名的渐变_27);}.box-cls-11{opacity:0.4;mix-blend-mode:overlay;}.box-cls-12{fill:url(#未命名的渐变_13);}.box-cls-13{fill:url(#未命名的渐变_71-2);}.box-cls-14{fill:url(#未命名的渐变_13-2);}.box-cls-15{fill:url(#未命名的渐变_107);}.box-cls-16{fill:#08121b;stroke:#1d83e7;stroke-width:0.5px;}.box-cls-17{fill:url(#未命名的渐变_17259);}.box-cls-18{fill:url(#未命名的渐变_17259-2);}.box-cls-19{fill:url(#未命名的渐变_17259-3);}.box-cls-20{opacity:0.2;}
</style>
