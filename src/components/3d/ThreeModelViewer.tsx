'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center, Bounds } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { cn } from '@/lib/utils'
import {
  RotateCcw, Maximize2, Eye, Grid, Box,
  Palette, Sun, Zap, Layers
} from 'lucide-react'

// ── STL Mesh ──
function STLMesh({ url, color }: { url: string; color: string }) {
  const geometry = useLoader(STLLoader, url)
  return (
    <mesh castShadow receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.1}
        envMapIntensity={0.8}
      />
    </mesh>
  )
}

// ── OBJ Mesh ──
function OBJMesh({ url, color }: { url: string; color: string }) {
  const obj = useLoader(OBJLoader, url)
  useEffect(() => {
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.1 })
      }
    })
  }, [obj, color])
  return <primitive object={obj} />
}

// ── Wireframe Box ──
function BoundingBoxHelper({ geometry }: { geometry: THREE.BufferGeometry }) {
  const bbox = new THREE.Box3()
  bbox.expandByObject(new THREE.Mesh(geometry))
  const size = new THREE.Vector3()
  bbox.getSize(size)
  return (
    <mesh>
      <boxGeometry args={[size.x, size.y, size.z]} />
      <meshBasicMaterial color="#3B82F6" wireframe />
    </mesh>
  )
}

// ── Lighting Presets ──
const LIGHTING_PRESETS = {
  StudioGold: (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 3]} intensity={1.2} color="#FFE5A0" castShadow />
      <pointLight position={[-4, 2, -4]} intensity={0.4} color="#C97E2A" />
    </>
  ),
  CyberNeon: (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-4, 2, -4]} intensity={1} color="#8B5CF6" />
      <pointLight position={[4, -2, 4]} intensity={0.8} color="#3B82F6" />
    </>
  ),
  Technical: (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 10, 0]} intensity={1} color="#ffffff" />
      <directionalLight position={[5, 0, 5]} intensity={0.5} />
    </>
  ),
}

const FILAMENT_COLORS = [
  { name: 'גרפיט', hex: '#333130' },
  { name: 'זהב', hex: '#C97E2A' },
  { name: 'לבן', hex: '#F5F5F5' },
  { name: 'שחור', hex: '#1A1A1A' },
  { name: 'כחול', hex: '#2563EB' },
  { name: 'אדום', hex: '#DC2626' },
  { name: 'ירוק', hex: '#16A34A' },
  { name: 'כתום', hex: '#EA580C' },
]

interface ThreeModelViewerProps {
  fileUrl?: string
  fileType?: 'stl' | 'obj' | '3mf' | string
  colorHex?: string
  className?: string
}

export function ThreeModelViewer({ fileUrl, fileType = 'stl', colorHex = '#C97E2A', className }: ThreeModelViewerProps) {
  const [color, setColor] = useState(colorHex)
  const [lighting, setLighting] = useState<keyof typeof LIGHTING_PRESETS>('StudioGold')
  const [wireframe, setWireframe] = useState(false)
  const [showBBox, setShowBBox] = useState(false)
  const [controlsKey, setControlsKey] = useState(0)

  const resetCamera = () => setControlsKey(k => k + 1)

  if (!fileUrl || fileUrl === 'uploaded_via_admin') {
    return (
      <div className={cn('rounded-2xl glass flex items-center justify-center text-beige-muted', className || 'h-80')}>
        <div className="text-center">
          <Box className="w-16 h-16 mx-auto mb-3 opacity-20" />
          <p className="text-sm">אין קובץ תלת-מימד זמין (או שחסר קובץ מקורי)</p>
        </div>
      </div>
    )
  }

  const type = (fileType || fileUrl.split('.').pop() || 'stl').toLowerCase()

  return (
    <div className={cn('relative rounded-2xl overflow-hidden glass', className || 'h-80')}>
      {/* Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        {/* Lighting */}
        {(['StudioGold', 'CyberNeon', 'Technical'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLighting(l)}
            title={l}
            className={cn('w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all',
              lighting === l ? 'bg-gold/30 border border-gold/50 text-gold' : 'glass text-beige-muted hover:text-beige'
            )}
          >
            {l === 'StudioGold' ? <Sun className="w-3.5 h-3.5" /> :
             l === 'CyberNeon' ? <Zap className="w-3.5 h-3.5" /> :
             <Layers className="w-3.5 h-3.5" />}
          </button>
        ))}
      </div>

      {/* Bottom toolbar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2">
        {/* Color swatches */}
        <div className="flex gap-1.5 flex-1 flex-wrap">
          {FILAMENT_COLORS.map(c => (
            <button
              key={c.hex}
              onClick={() => setColor(c.hex)}
              title={c.name}
              className={cn('w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                color === c.hex ? 'border-white scale-110' : 'border-transparent'
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setWireframe(w => !w)}
            className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-all glass',
              wireframe ? 'text-cyber-blue' : 'text-beige-muted'
            )}
            title="Wireframe"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowBBox(b => !b)}
            className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-all glass',
              showBBox ? 'text-cyber-blue' : 'text-beige-muted'
            )}
            title="Bounding Box"
          >
            <Box className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetCamera}
            className="w-7 h-7 rounded-lg glass flex items-center justify-center text-beige-muted hover:text-beige transition-all"
            title="Reset Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        key={controlsKey}
        shadows
        camera={{ position: [0, 0, 5], fov: 45 }}
        className="three-canvas-wrapper"
        style={{ background: 'transparent' }}
      >
        {LIGHTING_PRESETS[lighting]}
        <Bounds fit clip observe>
          <Center>
            <Suspense fallback={null}>
              {type === 'obj' ? (
                <OBJMesh url={fileUrl} color={color} />
              ) : (
                <STLMesh url={fileUrl} color={color} />
              )}
            </Suspense>
          </Center>
        </Bounds>
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          autoRotate
          autoRotateSpeed={1.5}
        />
      </Canvas>
    </div>
  )
}

// ── Dynamic export (no SSR for Three.js) ──
export default dynamic(() => Promise.resolve(ThreeModelViewer), { ssr: false })
