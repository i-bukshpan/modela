import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'

export interface ModelData {
  volume_cm3: number
  surface_cm2: number
  bounding_x: number
  bounding_y: number
  bounding_z: number
  blob_url?: string
  filename?: string
}

export const parseSTL = async (file: File): Promise<ModelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const loader = new STLLoader()
        const geometry = loader.parse(e.target!.result as ArrayBuffer)
        geometry.computeBoundingBox()
        const bbox = geometry.boundingBox!
        const size = new THREE.Vector3()
        bbox.getSize(size)

        // Volume via signed tetrahedra & Surface Area
        const pos = geometry.attributes.position
        let volume = 0
        let surfaceArea = 0
        for (let i = 0; i < pos.count; i += 3) {
          const v1 = new THREE.Vector3().fromBufferAttribute(pos, i)
          const v2 = new THREE.Vector3().fromBufferAttribute(pos, i + 1)
          const v3 = new THREE.Vector3().fromBufferAttribute(pos, i + 2)
          
          // Volume
          const cross = new THREE.Vector3().crossVectors(v2, v3)
          volume += v1.dot(cross) / 6
          
          // Surface Area
          const ab = new THREE.Vector3().subVectors(v2, v1)
          const ac = new THREE.Vector3().subVectors(v3, v1)
          surfaceArea += ab.cross(ac).length() / 2
        }

        const scaleFactorVolume = 0.001 // mm³ → cm³
        const scaleFactorArea = 0.01 // mm² → cm²
        const volume_cm3 = Math.abs(volume) * scaleFactorVolume
        const surface_cm2 = surfaceArea * scaleFactorArea

        resolve({
          volume_cm3: +volume_cm3.toFixed(3),
          surface_cm2: +surface_cm2.toFixed(3),
          bounding_x: +size.x.toFixed(1),
          bounding_y: +size.y.toFixed(1),
          bounding_z: +size.z.toFixed(1),
          blob_url: URL.createObjectURL(file),
          filename: file.name,
        })
      } catch (err) { reject(err) }
    }
    reader.readAsArrayBuffer(file)
  })
}

export function estimatePrintParameters(volume_cm3: number, surface_cm2: number, infill: number, layerHeight: number, density: number) {
  // SA/V ratio to determine if it's a thin shell (high ratio) or chunky block (low ratio).
  // A chunky 10x10x10cm block has ratio ~0.6. A thin shell has ratio > 5.
  const ratio = surface_cm2 / (volume_cm3 || 1)
  
  // We assume a base solidness based on the ratio.
  // We map ratio [0..10] -> solidness [0.2..1.0]
  // The higher the surface area, the more perimeters we print, so it's closer to 100% solid.
  const baseSolid = Math.min(1.0, Math.max(0.2, ratio / 6))
  
  // Add infill for whatever is not base solid walls
  const solidPercentage = Math.min(1.0, baseSolid + (infill / 100) * (1 - baseSolid))
  
  const effectiveVolume = volume_cm3 * solidPercentage
  const estimated_weight_g = effectiveVolume * density
  
  // Time estimate: ~1.7 minutes per gram at 0.2mm
  // We adjust the time by scaling based on layer height
  const estimated_print_time_hours = (estimated_weight_g * 1.7 * (0.2 / layerHeight)) / 60

  return {
    estimated_weight_g,
    estimated_print_time_hours
  }
}
