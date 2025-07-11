import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRhythm } from '../hooks/useRhythm'

export default function MultiTemporalVisualizer() {
  const meshRefs = useRef<THREE.Mesh[]>([])
  const data = useRhythm('multi_temporal')

  useFrame((state) => {
    if (!data) return

    const time = state.clock.getElapsedTime()
    
    // Update meshes based on rhythm data
    meshRefs.current.forEach((mesh, index) => {
      if (mesh && data.values[index] !== undefined) {
        const value = data.values[index]
        const phase = data.metadata.phases?.[index] || 0
        
        // Oscillating motion
        mesh.position.y = value * 2
        mesh.position.x = Math.cos(phase) * (index + 1)
        mesh.position.z = Math.sin(phase) * (index + 1)
        
        // Rotation based on phase
        mesh.rotation.x = phase
        mesh.rotation.y = time * 0.5 + index
        
        // Scale pulsing
        const scale = 0.3 + Math.abs(value) * 0.5
        mesh.scale.setScalar(scale)
        
        // Color based on value
        const material = mesh.material as THREE.MeshStandardMaterial
        material.emissive = new THREE.Color(
          0.5 + value * 0.5,
          0.3 + Math.abs(value) * 0.3,
          0.8 - Math.abs(value) * 0.3
        )
      }
    })
  })

  return (
    <>
      {/* Central sphere */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#444444" 
          emissive="#222222"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Oscillators */}
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) meshRefs.current[index] = el
          }}
        >
          <torusGeometry args={[0.3, 0.1, 16, 32]} />
          <meshStandardMaterial
            color={`hsl(${240 + index * 30}, 70%, 50%)`}
            emissive={`hsl(${240 + index * 30}, 70%, 30%)`}
            emissiveIntensity={0.5}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      ))}
      
      {/* Connection lines */}
      {data && data.metadata.coupling_strength && (
        <group>
          {[0, 1, 2].map((i) => (
            [0, 1, 2].filter(j => j !== i).map(j => (
              <line key={`${i}-${j}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([
                      Math.cos(data.metadata.phases?.[i] || 0) * (i + 1),
                      data.values[i] * 2,
                      Math.sin(data.metadata.phases?.[i] || 0) * (i + 1),
                      Math.cos(data.metadata.phases?.[j] || 0) * (j + 1),
                      data.values[j] * 2,
                      Math.sin(data.metadata.phases?.[j] || 0) * (j + 1),
                    ])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color="#667eea"
                  opacity={data.metadata.coupling_strength}
                  transparent
                />
              </line>
            ))
          ))}
        </group>
      )}
    </>
  )
}