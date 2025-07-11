import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRhythm } from '../hooks/useRhythm'

export default function CriticalPhiVisualizer() {
  const meshRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const data = useRhythm('critical_phi')

  const particleCount = 1000
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    return positions
  }, [])

  useFrame((state) => {
    if (!data || !meshRef.current || !particlesRef.current) return

    const time = state.clock.getElapsedTime()
    const phi = data.values[0] || 0.5
    const isAvalanche = data.metadata.avalanche_active

    // Central mesh represents phi value
    meshRef.current.scale.setScalar(0.5 + phi * 1.5)
    meshRef.current.rotation.x = time * 0.2
    meshRef.current.rotation.y = time * 0.3

    // Material changes during avalanche
    const material = meshRef.current.material as THREE.MeshStandardMaterial
    if (isAvalanche) {
      material.emissive = new THREE.Color(1, 0.2, 0.2)
      material.emissiveIntensity = phi
    } else {
      material.emissive = new THREE.Color(0.8, 0.3, 0.3)
      material.emissiveIntensity = phi * 0.5
    }

    // Particle system represents integration
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    const criticality = data.metadata.criticality || 0
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const x = positions[i3]
      const y = positions[i3 + 1]
      const z = positions[i3 + 2]
      
      // Particles attracted to center based on phi
      const distance = Math.sqrt(x * x + y * y + z * z)
      const force = phi * 0.01 / (distance + 0.1)
      
      positions[i3] -= x * force
      positions[i3 + 1] -= y * force
      positions[i3 + 2] -= z * force
      
      // Add turbulence during avalanche
      if (isAvalanche) {
        positions[i3] += (Math.random() - 0.5) * 0.1
        positions[i3 + 1] += (Math.random() - 0.5) * 0.1
        positions[i3 + 2] += (Math.random() - 0.5) * 0.1
      }
      
      // Reset particles that get too close or too far
      if (distance < 0.5 || distance > 3) {
        positions[i3] = (Math.random() - 0.5) * 4
        positions[i3 + 1] = (Math.random() - 0.5) * 4
        positions[i3 + 2] = (Math.random() - 0.5) * 4
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true
    
    // Particle color based on criticality
    const particleMaterial = particlesRef.current.material as THREE.PointsMaterial
    particleMaterial.color = new THREE.Color(
      1,
      1 - criticality,
      1 - criticality
    )
  })

  return (
    <>
      {/* Central integrated information sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#ff6b6b"
          emissive="#ff0000"
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
          wireframe={false}
        />
      </mesh>
      
      {/* Particle system */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#ffffff"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}