import * as THREE from 'three'

function createStandardMaterial(color: number, metalness = 0.55, roughness = 0.45) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness })
}

function addMesh(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
  rotation?: [number, number, number],
) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  if (rotation) {
    mesh.rotation.set(...rotation)
  }
  group.add(mesh)
  return mesh
}

function addLegs(group: THREE.Group, points: Array<[number, number, number]>, height: number, color: number) {
  const legGeo = new THREE.BoxGeometry(0.12, height, 0.12)
  const legMat = createStandardMaterial(color, 0.7, 0.35)
  points.forEach(([x, y, z]) => addMesh(group, legGeo, legMat, [x, y, z]))
}

function createCncMachine(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(3.2, 2, 2.4), createStandardMaterial(0x1f2937, 0.8, 0.25), [0, 1, 0])
  addMesh(group, new THREE.BoxGeometry(2.1, 1.1, 0.08), new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.35,
    metalness: 0.85,
    roughness: 0.08,
  }), [0, 1.15, 1.21])
  addMesh(group, new THREE.BoxGeometry(0.85, 0.45, 0.1), createStandardMaterial(0x0f172a, 0.9, 0.2), [1.4, 1.25, 0.95])
  addMesh(group, new THREE.CylinderGeometry(0.12, 0.12, 0.25, 18), new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 0.55,
    roughness: 0.2,
  }), [1.3, 2.18, 0.9])
}

function createRobotArm(group: THREE.Group) {
  addMesh(group, new THREE.CylinderGeometry(0.9, 0.95, 0.28, 32), createStandardMaterial(0x334155, 0.65, 0.35), [0, 0.14, 0])
  addMesh(group, new THREE.CylinderGeometry(0.2, 0.24, 1.9, 20), createStandardMaterial(0xe5e7eb, 0.35, 0.4), [0, 1.1, 0])

  const armMat = createStandardMaterial(0x0891b2, 0.72, 0.3)
  addMesh(group, new THREE.BoxGeometry(0.34, 1.35, 0.34), armMat, [0.45, 2.15, 0], [0, 0, Math.PI / 4])
  addMesh(group, new THREE.BoxGeometry(0.28, 1.15, 0.28), armMat, [1.2, 2.95, 0], [0, 0, -Math.PI / 6])
  addMesh(group, new THREE.BoxGeometry(0.48, 0.12, 0.12), createStandardMaterial(0xf59e0b, 0.75, 0.25), [1.72, 3.35, 0.14], [0, 0, 0.2])
  addMesh(group, new THREE.BoxGeometry(0.48, 0.12, 0.12), createStandardMaterial(0xf59e0b, 0.75, 0.25), [1.72, 3.35, -0.14], [0, 0, -0.2])
}

function createPump(group: THREE.Group) {
  const bodyGeo = new THREE.CylinderGeometry(0.62, 0.62, 1.9, 28)
  bodyGeo.rotateZ(Math.PI / 2)
  addMesh(group, bodyGeo, createStandardMaterial(0x0369a1, 0.82, 0.24), [0, 0.7, 0])

  const fanGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.28, 28)
  fanGeo.rotateZ(Math.PI / 2)
  addMesh(group, fanGeo, createStandardMaterial(0x64748b, 0.55, 0.48), [-1.08, 0.7, 0])
  addMesh(group, new THREE.BoxGeometry(0.35, 0.3, 2.2), createStandardMaterial(0x94a3b8, 0.45, 0.5), [0, 0.2, 0])
}

function createServerRack(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(1.25, 2.55, 1.1), createStandardMaterial(0x111827, 0.72, 0.28), [0, 1.28, 0])
  addMesh(group, new THREE.BoxGeometry(1.05, 2.25, 0.05), new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.16,
    metalness: 0.92,
    roughness: 0.05,
  }), [0, 1.28, 0.56])

  const slotGeo = new THREE.BoxGeometry(0.9, 0.08, 0.92)
  const slotMat = createStandardMaterial(0x1e293b, 0.78, 0.24)
  for (let i = 0; i < 8; i += 1) {
    addMesh(group, slotGeo, slotMat, [0, 0.42 + i * 0.24, 0.02])
  }

  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 0.65,
  })
  for (let i = 0; i < 4; i += 1) {
    addMesh(group, new THREE.BoxGeometry(0.05, 0.05, 0.02), ledMat, [0.42, 0.52 + i * 0.48, 0.58])
  }
}

function createCoolingUnit(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(1.3, 2.2, 1), createStandardMaterial(0xe2e8f0, 0.35, 0.5), [0, 1.1, 0])
  addMesh(group, new THREE.BoxGeometry(0.9, 0.95, 0.04), createStandardMaterial(0x94a3b8, 0.45, 0.55), [0, 1.4, 0.52])
  addMesh(group, new THREE.BoxGeometry(0.8, 0.28, 0.06), createStandardMaterial(0x0f172a, 0.85, 0.18), [0, 0.45, 0.53])
}

function createRoadSegment(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(8, 0.08, 3.6), createStandardMaterial(0x374151, 0.15, 0.95), [0, 0.04, 0])
  const stripeMat = createStandardMaterial(0xf8fafc, 0.1, 0.85)
  for (let i = -3; i <= 3; i += 2) {
    addMesh(group, new THREE.BoxGeometry(0.8, 0.02, 0.12), stripeMat, [i, 0.09, 0])
  }
  addMesh(group, new THREE.BoxGeometry(8, 0.02, 0.12), createStandardMaterial(0xfacc15, 0.18, 0.75), [0, 0.09, 1.18])
  addMesh(group, new THREE.BoxGeometry(8, 0.02, 0.12), createStandardMaterial(0xfacc15, 0.18, 0.75), [0, 0.09, -1.18])
}

function createConveyor(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(4.2, 0.18, 1.2), createStandardMaterial(0x475569, 0.7, 0.3), [0, 0.92, 0])
  addMesh(group, new THREE.BoxGeometry(4, 0.06, 0.86), createStandardMaterial(0x0f172a, 0.2, 0.8), [0, 1.03, 0])
  addLegs(group, [
    [-1.8, 0.45, -0.42],
    [-1.8, 0.45, 0.42],
    [1.8, 0.45, -0.42],
    [1.8, 0.45, 0.42],
  ], 0.9, 0x64748b)
  addMesh(group, new THREE.BoxGeometry(0.6, 0.35, 0.6), createStandardMaterial(0xd97706, 0.28, 0.65), [-0.7, 1.28, 0])
  addMesh(group, new THREE.BoxGeometry(0.6, 0.35, 0.6), createStandardMaterial(0xc2410c, 0.28, 0.65), [0.35, 1.28, 0])
}

function createStorageTank(group: THREE.Group) {
  addMesh(group, new THREE.CylinderGeometry(1.05, 1.05, 3.4, 32), createStandardMaterial(0xcbd5e1, 0.45, 0.35), [0, 1.7, 0])
  addMesh(group, new THREE.CylinderGeometry(1.12, 1.12, 0.18, 32), createStandardMaterial(0x94a3b8, 0.62, 0.28), [0, 3.5, 0])
  addMesh(group, new THREE.CylinderGeometry(1.12, 1.12, 0.18, 32), createStandardMaterial(0x94a3b8, 0.62, 0.28), [0, -0.1, 0])
  addLegs(group, [
    [-0.65, 0.45, -0.65],
    [-0.65, 0.45, 0.65],
    [0.65, 0.45, -0.65],
    [0.65, 0.45, 0.65],
  ], 0.9, 0x64748b)
}

function createPipeSkid(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(3.2, 0.16, 1.6), createStandardMaterial(0x475569, 0.72, 0.3), [0, 0.08, 0])
  const pipeMat = createStandardMaterial(0x38bdf8, 0.82, 0.2)
  for (const z of [-0.38, 0, 0.38]) {
    const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 18)
    pipeGeo.rotateZ(Math.PI / 2)
    addMesh(group, pipeGeo, pipeMat, [0, 0.95, z])
  }
  addMesh(group, new THREE.BoxGeometry(0.4, 1, 0.4), createStandardMaterial(0xf59e0b, 0.72, 0.28), [-1.15, 0.58, 0])
  addMesh(group, new THREE.BoxGeometry(0.4, 1, 0.4), createStandardMaterial(0xf59e0b, 0.72, 0.28), [1.15, 0.58, 0])
}

function createControlCabinet(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(1.5, 2.2, 0.8), createStandardMaterial(0xe5e7eb, 0.28, 0.65), [0, 1.1, 0])
  addMesh(group, new THREE.BoxGeometry(0.72, 0.54, 0.05), createStandardMaterial(0x0f172a, 0.9, 0.18), [0, 1.55, 0.43])
  addMesh(group, new THREE.BoxGeometry(1.04, 0.18, 0.04), createStandardMaterial(0x94a3b8, 0.22, 0.7), [0, 0.62, 0.43])
  const buttonMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.35 })
  addMesh(group, new THREE.CylinderGeometry(0.08, 0.08, 0.05, 18), buttonMat, [0.5, 0.6, 0.45], [Math.PI / 2, 0, 0])
}

function createWorkbench(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(2.4, 0.14, 1.1), createStandardMaterial(0x8b5e3c, 0.12, 0.88), [0, 1.02, 0])
  addLegs(group, [
    [-1, 0.5, -0.42],
    [-1, 0.5, 0.42],
    [1, 0.5, -0.42],
    [1, 0.5, 0.42],
  ], 1, 0x64748b)
  addMesh(group, new THREE.BoxGeometry(0.45, 0.45, 0.45), createStandardMaterial(0x2563eb, 0.3, 0.55), [-0.45, 1.32, 0])
  addMesh(group, new THREE.BoxGeometry(0.55, 0.12, 0.22), createStandardMaterial(0xf97316, 0.35, 0.45), [0.55, 1.16, 0.18])
}

function createForklift(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(1.8, 0.45, 1.2), createStandardMaterial(0xf59e0b, 0.45, 0.45), [0, 0.6, 0])
  addMesh(group, new THREE.BoxGeometry(0.9, 0.9, 0.95), createStandardMaterial(0xfbbf24, 0.38, 0.48), [-0.2, 1.18, 0])
  addMesh(group, new THREE.BoxGeometry(0.08, 1.9, 0.08), createStandardMaterial(0x334155, 0.82, 0.22), [0.78, 1.1, -0.22])
  addMesh(group, new THREE.BoxGeometry(0.08, 1.9, 0.08), createStandardMaterial(0x334155, 0.82, 0.22), [0.78, 1.1, 0.22])
  addMesh(group, new THREE.BoxGeometry(0.75, 0.08, 0.08), createStandardMaterial(0x475569, 0.78, 0.25), [1.1, 0.18, -0.18])
  addMesh(group, new THREE.BoxGeometry(0.75, 0.08, 0.08), createStandardMaterial(0x475569, 0.78, 0.25), [1.1, 0.18, 0.18])

  const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 18)
  wheelGeo.rotateZ(Math.PI / 2)
  const wheelMat = createStandardMaterial(0x111827, 0.15, 0.92)
  for (const x of [-0.6, 0.55]) {
    for (const z of [-0.55, 0.55]) {
      addMesh(group, wheelGeo, wheelMat, [x, 0.24, z])
    }
  }
}

function createFencePanel(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(2.8, 1.6, 0.05), createStandardMaterial(0x94a3b8, 0.25, 0.82), [0, 1, 0])
  addMesh(group, new THREE.BoxGeometry(2.9, 0.08, 0.08), createStandardMaterial(0x475569, 0.68, 0.32), [0, 1.8, 0])
  addMesh(group, new THREE.BoxGeometry(2.9, 0.08, 0.08), createStandardMaterial(0x475569, 0.68, 0.32), [0, 0.2, 0])
  addLegs(group, [
    [-1.35, 0.9, 0],
    [1.35, 0.9, 0],
  ], 1.8, 0x475569)
}

function createLampPost(group: THREE.Group) {
  addMesh(group, new THREE.CylinderGeometry(0.18, 0.24, 4.2, 18), createStandardMaterial(0x64748b, 0.72, 0.28), [0, 2.1, 0])
  addMesh(group, new THREE.BoxGeometry(1.25, 0.08, 0.08), createStandardMaterial(0x64748b, 0.72, 0.28), [0.52, 4.15, 0])
  addMesh(group, new THREE.BoxGeometry(0.42, 0.2, 0.42), new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  }), [1.02, 3.98, 0])
}

function createFactoryHall(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(10, 3.8, 6.8), createStandardMaterial(0xdbe4ee, 0.2, 0.72), [0, 1.9, 0])
  addMesh(group, new THREE.BoxGeometry(10.4, 0.16, 7.2), createStandardMaterial(0x64748b, 0.48, 0.42), [0, 3.96, 0])
  addMesh(group, new THREE.BoxGeometry(10.2, 0.08, 0.18), createStandardMaterial(0x94a3b8, 0.42, 0.55), [0, 1.9, 3.42])

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.3,
    metalness: 0.82,
    roughness: 0.08,
  })
  for (const x of [-3.5, -1.2, 1.2, 3.5]) {
    addMesh(group, new THREE.BoxGeometry(1.2, 1.2, 0.06), glassMat, [x, 2.2, 3.44])
  }

  const doorMat = createStandardMaterial(0x334155, 0.8, 0.24)
  for (const x of [-2.6, 0, 2.6]) {
    addMesh(group, new THREE.BoxGeometry(1.45, 2.1, 0.08), doorMat, [x, 1.15, 3.44])
  }
}

function createWarehouse(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(8.8, 3.2, 5.8), createStandardMaterial(0xe5e7eb, 0.18, 0.78), [0, 1.6, 0])
  addMesh(group, new THREE.BoxGeometry(9.2, 0.16, 6.2), createStandardMaterial(0x475569, 0.45, 0.38), [0, 3.28, 0])
  addMesh(group, new THREE.BoxGeometry(8.9, 0.45, 1.1), createStandardMaterial(0xcbd5e1, 0.15, 0.9), [0, 0.23, 3.45])

  const dockDoorMat = createStandardMaterial(0x1e293b, 0.7, 0.28)
  for (const x of [-2.6, 0, 2.6]) {
    addMesh(group, new THREE.BoxGeometry(1.55, 2.05, 0.08), dockDoorMat, [x, 1.18, 2.94])
    addMesh(group, new THREE.BoxGeometry(1.8, 0.12, 0.9), createStandardMaterial(0x94a3b8, 0.4, 0.5), [x, 0.1, 3.62])
  }
}

function createOfficeBuilding(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(5.8, 4.8, 3.8), createStandardMaterial(0xf8fafc, 0.15, 0.8), [0, 2.4, 0])
  addMesh(group, new THREE.BoxGeometry(6.1, 0.14, 4.1), createStandardMaterial(0x94a3b8, 0.38, 0.42), [0, 4.88, 0])

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.45,
    metalness: 0.85,
    roughness: 0.05,
  })
  for (const level of [1.3, 2.5, 3.7]) {
    for (const x of [-1.9, -0.6, 0.6, 1.9]) {
      addMesh(group, new THREE.BoxGeometry(0.9, 0.68, 0.05), glassMat, [x, level, 1.93])
    }
  }

  addMesh(group, new THREE.BoxGeometry(1.1, 2.1, 0.08), createStandardMaterial(0x334155, 0.72, 0.24), [0, 1.1, 1.94])
}

function createGateComplex(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(2.2, 1.5, 2), createStandardMaterial(0xe2e8f0, 0.18, 0.72), [-2.2, 0.75, 0])
  addMesh(group, new THREE.BoxGeometry(2.5, 0.12, 2.3), createStandardMaterial(0x64748b, 0.42, 0.38), [-2.2, 1.56, 0])
  addMesh(group, new THREE.BoxGeometry(10, 0.18, 0.18), createStandardMaterial(0x334155, 0.72, 0.24), [0.5, 3.2, 0])
  addMesh(group, new THREE.BoxGeometry(0.24, 3.2, 0.24), createStandardMaterial(0x475569, 0.72, 0.24), [-4, 1.6, 0])
  addMesh(group, new THREE.BoxGeometry(0.24, 3.2, 0.24), createStandardMaterial(0x475569, 0.72, 0.24), [5, 1.6, 0])
  addMesh(group, new THREE.BoxGeometry(3.6, 0.12, 0.12), createStandardMaterial(0xef4444, 0.38, 0.48), [2.2, 0.9, 0], [0, 0, -0.12])
}

function createParkingLot(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(9, 0.06, 5.8), createStandardMaterial(0x4b5563, 0.12, 0.94), [0, 0.03, 0])
  const lineMat = createStandardMaterial(0xf8fafc, 0.06, 0.85)
  for (const x of [-3, -1.5, 0, 1.5, 3]) {
    addMesh(group, new THREE.BoxGeometry(0.08, 0.02, 4.2), lineMat, [x, 0.05, 0])
  }

  const carColors = [0xef4444, 0x2563eb, 0xf59e0b, 0x14b8a6]
  const spots: Array<[number, number]> = [
    [-2.25, -1.3],
    [-0.75, -1.3],
    [0.75, -1.3],
    [2.25, -1.3],
  ]
  spots.forEach(([x, z], index) => {
    addMesh(group, new THREE.BoxGeometry(1, 0.42, 1.9), createStandardMaterial(carColors[index % carColors.length], 0.38, 0.5), [x, 0.24, z])
    addMesh(group, new THREE.BoxGeometry(0.72, 0.25, 0.95), createStandardMaterial(0x0f172a, 0.8, 0.2), [x, 0.55, z - 0.05])
  })
}

function createSubstation(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(5.2, 0.12, 4.2), createStandardMaterial(0xcbd5e1, 0.2, 0.8), [0, 0.06, 0])
  for (const x of [-1.4, 1.4]) {
    addMesh(group, new THREE.BoxGeometry(1.2, 1.3, 0.9), createStandardMaterial(0x94a3b8, 0.55, 0.38), [x, 0.65, -0.7])
    addMesh(group, new THREE.BoxGeometry(1.6, 0.12, 0.18), createStandardMaterial(0xf59e0b, 0.35, 0.5), [x, 1.45, -0.7])
  }
  for (const x of [-1.9, 0, 1.9]) {
    addMesh(group, new THREE.CylinderGeometry(0.08, 0.08, 1.7, 12), createStandardMaterial(0x475569, 0.75, 0.24), [x, 0.85, 1.1])
  }
  addMesh(group, new THREE.BoxGeometry(4.6, 1.6, 0.05), createStandardMaterial(0x94a3b8, 0.25, 0.82), [0, 0.9, 1.95])
}

function createLoadingDock(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(6.4, 0.55, 2.2), createStandardMaterial(0x9ca3af, 0.3, 0.6), [0, 0.28, 0])
  addMesh(group, new THREE.BoxGeometry(5.8, 0.12, 1.9), createStandardMaterial(0x4b5563, 0.75, 0.24), [0, 0.62, 0])
  for (const x of [-2.2, 0, 2.2]) {
    addMesh(group, new THREE.BoxGeometry(0.9, 0.9, 0.9), createStandardMaterial(0xd97706, 0.25, 0.65), [x, 1.1, -0.2])
    addMesh(group, new THREE.BoxGeometry(0.9, 0.9, 0.9), createStandardMaterial(0xb45309, 0.25, 0.65), [x, 2.02, -0.2])
  }
}

function createRaisedFloorZone(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(12, 0.08, 8), createStandardMaterial(0x334155, 0.3, 0.82), [0, 0.04, 0])
  const tileMat = createStandardMaterial(0x475569, 0.35, 0.78)
  for (let x = -5; x <= 5; x += 2) {
    for (let z = -3; z <= 3; z += 2) {
      addMesh(group, new THREE.BoxGeometry(1.8, 0.01, 1.8), tileMat, [x, 0.09, z])
    }
  }
}

function createColdAislePod(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(8, 0.06, 2.4), createStandardMaterial(0x0f172a, 0.18, 0.9), [0, 0.03, 0])
  addMesh(group, new THREE.BoxGeometry(8, 0.08, 2.3), new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.18,
    metalness: 0.85,
    roughness: 0.08,
  }), [0, 2.75, 0])
  addMesh(group, new THREE.BoxGeometry(0.08, 2.4, 2.3), createStandardMaterial(0x64748b, 0.68, 0.26), [-4, 1.2, 0])
  addMesh(group, new THREE.BoxGeometry(0.08, 2.4, 2.3), createStandardMaterial(0x64748b, 0.68, 0.26), [4, 1.2, 0])
  addMesh(group, new THREE.BoxGeometry(7.9, 2.4, 0.06), createStandardMaterial(0x64748b, 0.68, 0.26), [0, 1.2, -1.15])
  addMesh(group, new THREE.BoxGeometry(7.9, 2.4, 0.06), createStandardMaterial(0x64748b, 0.68, 0.26), [0, 1.2, 1.15])
}

function createBusway(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(10, 0.22, 0.34), createStandardMaterial(0x94a3b8, 0.72, 0.24), [0, 3.6, 0])
  for (const x of [-3.6, -1.2, 1.2, 3.6]) {
    addMesh(group, new THREE.BoxGeometry(0.16, 1.8, 0.08), createStandardMaterial(0x64748b, 0.68, 0.26), [x, 2.68, 0])
  }
}

function createPowerCabinet(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(1.4, 2.3, 0.95), createStandardMaterial(0xe5e7eb, 0.24, 0.62), [0, 1.15, 0])
  addMesh(group, new THREE.BoxGeometry(0.95, 1.85, 0.04), createStandardMaterial(0x0f172a, 0.88, 0.16), [0, 1.25, 0.48])
  for (const y of [0.55, 0.95, 1.35, 1.75]) {
    addMesh(group, new THREE.BoxGeometry(0.82, 0.06, 0.05), createStandardMaterial(0x94a3b8, 0.24, 0.72), [0, y, 0.49])
  }
  addMesh(group, new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 0.5,
  }), [0.45, 0.55, 0.5], [Math.PI / 2, 0, 0])
}

function createUpsModule(group: THREE.Group) {
  addMesh(group, new THREE.BoxGeometry(2.1, 2.4, 1), createStandardMaterial(0xe2e8f0, 0.24, 0.58), [0, 1.2, 0])
  addMesh(group, new THREE.BoxGeometry(1.5, 1.2, 0.04), createStandardMaterial(0x0f172a, 0.9, 0.16), [0, 1.6, 0.52])
  addMesh(group, new THREE.BoxGeometry(1.6, 0.12, 0.04), createStandardMaterial(0x94a3b8, 0.28, 0.66), [0, 0.75, 0.52])
  addMesh(group, new THREE.CylinderGeometry(0.08, 0.08, 0.05, 18), new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.45,
  }), [0.72, 0.76, 0.54], [Math.PI / 2, 0, 0])
}

export function createProceduralMesh(type: string, id: string): THREE.Group {
  const group = new THREE.Group()
  group.name = id

  switch (type) {
    case 'cnc':
      createCncMachine(group)
      break
    case 'arm':
      createRobotArm(group)
      break
    case 'pump':
      createPump(group)
      break
    case 'serverRack':
      createServerRack(group)
      break
    case 'coolingUnit':
      createCoolingUnit(group)
      break
    case 'road':
      createRoadSegment(group)
      break
    case 'conveyor':
      createConveyor(group)
      break
    case 'storageTank':
      createStorageTank(group)
      break
    case 'pipeSkid':
      createPipeSkid(group)
      break
    case 'controlCabinet':
      createControlCabinet(group)
      break
    case 'workbench':
      createWorkbench(group)
      break
    case 'forklift':
      createForklift(group)
      break
    case 'fence':
      createFencePanel(group)
      break
    case 'lampPost':
      createLampPost(group)
      break
    case 'factoryHall':
      createFactoryHall(group)
      break
    case 'warehouse':
      createWarehouse(group)
      break
    case 'officeBuilding':
      createOfficeBuilding(group)
      break
    case 'gateComplex':
      createGateComplex(group)
      break
    case 'parkingLot':
      createParkingLot(group)
      break
    case 'substation':
      createSubstation(group)
      break
    case 'loadingDock':
      createLoadingDock(group)
      break
    case 'raisedFloor':
      createRaisedFloorZone(group)
      break
    case 'coldAisle':
      createColdAislePod(group)
      break
    case 'busway':
      createBusway(group)
      break
    case 'powerCabinet':
      createPowerCabinet(group)
      break
    case 'upsModule':
      createUpsModule(group)
      break
    default:
      createPump(group)
      break
  }

  return group
}
