import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRhythm } from '../hooks/useRhythm'

export default function PredictionTensionVisualizer() {
  const springRef = useRef<THREE.Mesh>(null)
  const releaseParticlesRef = useRef<THREE.Points>(null)
  const data = useRhythm('prediction_tension')

  const particleCount = 500
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
    }
    return positions
  }, [])

  const particleVelocities = useRef(new Float32Array(particleCount * 3))

  useFrame((state) => {
    if (!data || !springRef.current || !releaseParticlesRef.current) return

    const time = state.clock.getElapsedTime()
    const tension = data.values[0] || 0
    const releaseIntensity = data.values[1] || 0
    const isReleasing = data.metadata.release_active

    // Spring visualization
    const springScale = 1 + tension * 2
    springRef.current.scale.y = springScale
    springRef.current.scale.x = 1 - tension * 0.3
    springRef.current.scale.z = 1 - tension * 0.3
    
    // Spring color based on tension
    const material = springRef.current.material as THREE.MeshStandardMaterial
    material.color = new THREE.Color(
      0.2 + tension * 0.8,
      0.8 - tension * 0.6,
      0.2
    )
    
    // Vibration when tense
    if (tension > 0.5) {
      springRef.current.position.x = Math.sin(time * 20) * tension * 0.05
      springRef.current.position.z = Math.cos(time * 25) * tension * 0.05
    } else {
      springRef.current.position.x = 0
      springRef.current.position.z = 0
    }

    // Particle release effect
    const positions = releaseParticlesRef.current.geometry.attributes.position.array as Float32Array
    const velocities = particleVelocities.current
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      if (isReleasing && Math.random() < releaseIntensity * 0.1) {
        // Initialize new particle
        positions[i3] = (Math.random() - 0.5) * 0.5
        positions[i3 + 1] = 0
        positions[i3 + 2] = (Math.random() - 0.5) * 0.5
        
        const angle = Math.random() * Math.PI * 2
        const speed = releaseIntensity * (0.5 + Math.random() * 0.5)
        velocities[i3] = Math.cos(angle) * speed
        velocities[i3 + 1] = Math.random() * speed * 2
        velocities[i3 + 2] = Math.sin(angle) * speed
      }
      
      // Update particle positions
      positions[i3] += velocities[i3] * 0.016
      positions[i3 + 1] += velocities[i3 + 1] * 0.016
      positions[i3 + 2] += velocities[i3 + 2] * 0.016
      
      // Apply gravity and damping
      velocities[i3] *= 0.98
      velocities[i3 + 1] -= 0.02
      velocities[i3 + 2] *= 0.98
      
      // Reset particles that fall too far
      if (positions[i3 + 1] < -5) {
        positions[i3] = 0
        positions[i3 + 1] = 0
        positions[i3 + 2] = 0
        velocities[i3] = 0
        velocities[i3 + 1] = 0
        velocities[i3 + 2] = 0
      }
    }
    
    releaseParticlesRef.current.geometry.attributes.position.needsUpdate = true
    
    // Particle material
    const particleMaterial = releaseParticlesRef.current.material as THREE.PointsMaterial
    particleMaterial.opacity = isReleasing ? 0.8 : 0.2
    particleMaterial.size = isReleasing ? 0.05 : 0.02
  })

  return (
    <>
      {/* Spring/tension visualization */}
      <mesh ref={springRef}>
        <cylinderGeometry args={[0.5, 0.5, 2, 16, 8]} />
        <meshStandardMaterial
          color="#48bb78"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Release particles */}
      <points ref={releaseParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#90cdf4"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}