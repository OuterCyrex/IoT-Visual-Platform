import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export async function loadImportedModel(dataUrl: string) {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(dataUrl)
  const root = gltf.scene || gltf.scenes[0] || new THREE.Group()

  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)

  root.position.sub(center)

  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0) {
    root.scale.setScalar(4 / maxDim)
  }

  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return root
}
