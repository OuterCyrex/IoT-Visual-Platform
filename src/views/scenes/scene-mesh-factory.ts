import * as THREE from 'three'

export function createProceduralMesh(type: string, id: string): THREE.Group {
  const group = new THREE.Group()
  group.name = id

  if (type === 'cnc') {
    const baseGeo = new THREE.BoxGeometry(3, 1.8, 2.2)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = 0.9
    group.add(baseMesh)

    const glassGeo = new THREE.BoxGeometry(2.2, 1, 0.1)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.9,
    })
    const glassMesh = new THREE.Mesh(glassGeo, glassMat)
    glassMesh.position.set(0, 1.1, 1.1)
    group.add(glassMesh)

    const beaconGeo = new THREE.SphereGeometry(0.15, 16, 16)
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.5 })
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat)
    beaconMesh.name = 'beacon'
    beaconMesh.position.set(1.2, 1.9, 0.9)
    group.add(beaconMesh)
    return group
  }

  if (type === 'arm') {
    const baseGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = 0.15
    group.add(baseMesh)

    const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 16)
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat)
    shaftMesh.position.set(0, 1.0, 0)
    group.add(shaftMesh)

    const jointGroup = new THREE.Group()
    jointGroup.name = 'joint'
    jointGroup.position.set(0, 1.8, 0)

    const jointGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3)
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, metalness: 0.7 })
    const jointMesh = new THREE.Mesh(jointGeo, jointMat)
    jointMesh.position.set(0.3, 0.6, 0)
    jointMesh.rotation.z = Math.PI / 4
    jointGroup.add(jointMesh)
    group.add(jointGroup)
    return group
  }

  const motorGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.8, 32)
  motorGeo.rotateZ(Math.PI / 2)
  const motorMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.9, roughness: 0.3 })
  const motorMesh = new THREE.Mesh(motorGeo, motorMat)
  motorMesh.position.y = 0.6
  group.add(motorMesh)

  const fanGroup = new THREE.Group()
  fanGroup.name = 'rotor'
  fanGroup.position.set(-1.05, 0.6, 0)

  const fanGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.3, 32)
  fanGeo.rotateZ(Math.PI / 2)
  const fanMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 })
  const fanMesh = new THREE.Mesh(fanGeo, fanMat)
  fanGroup.add(fanMesh)
  group.add(fanGroup)

  return group
}
