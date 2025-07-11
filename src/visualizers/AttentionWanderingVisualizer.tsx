import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRhythm } from '../hooks/useRhythm'

export default function AttentionWanderingVisualizer() {
  const attentionRef = useRef<THREE.Mesh>(null)
  const targetsRef = useRef<THREE.Group>(null)
  const focusBeamRef = useRef<THREE.Mesh>(null)
  const data = useRhythm('attention_wandering')

  useFrame((state) => {
    if (!data || !attentionRef.current || !targetsRef.current) return

    const time = state.clock.getElapsedTime()
    const [x, y, boredom, focusStrength] = data.values
    const targets = data.metadata.targets || []
    const isFocused = data.metadata.focused
    const currentFocus = data.metadata.current_focus

    // Update attention position
    attentionRef.current.position.x = x * 2
    attentionRef.current.position.z = y * 2
    attentionRef.current.position.y = Math.sin(time * 2) * 0.1

    // Attention appearance based on state
    const material = attentionRef.current.material as THREE.MeshStandardMaterial
    if (isFocused) {
      material.color = new THREE.Color(0.5, 0.3, 1)
      material.emissiveIntensity = focusStrength
      attentionRef.current.scale.setScalar(0.5 + focusStrength * 0.3)
    } else {
      material.color = new THREE.Color(0.7, 0.5, 0.9)
      material.emissiveIntensity = 0.3 + boredom * 0.2
      attentionRef.current.scale.setScalar(0.4 + Math.sin(time * 3) * 0.1)
    }

    // Rotation based on wandering/focusing
    attentionRef.current.rotation.y = time * (isFocused ? 0.5 : 2)
    attentionRef.current.rotation.x = Math.sin(time * 1.5) * (isFocused ? 0.1 : 0.3)

    // Update targets
    targetsRef.current.clear()
    targets.forEach((target: [number, number], index: number) => {
      const targetMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({
          color: index === currentFocus ? '#fbbf24' : '#6366f1',
          emissive: index === currentFocus ? '#f59e0b' : '#4f46e5',
          emissiveIntensity: index === currentFocus ? 0.8 : 0.2,
          metalness: 0.5,
          roughness: 0.5
        })
      )
      targetMesh.position.x = target[0] * 2
      targetMesh.position.z = target[1] * 2
      targetMesh.position.y = 0
      targetsRef.current.add(targetMesh)
    })

    // Focus beam visualization
    if (focusBeamRef.current && isFocused && currentFocus !== undefined && targets[currentFocus]) {
      const target = targets[currentFocus]
      const distance = Math.sqrt(
        Math.pow(target[0] * 2 - x * 2, 2) + 
        Math.pow(target[1] * 2 - y * 2, 2)
      )
      
      focusBeamRef.current.visible = true
      focusBeamRef.current.scale.y = distance
      focusBeamRef.current.position.x = (x * 2 + target[0] * 2) / 2
      focusBeamRef.current.position.z = (y * 2 + target[1] * 2) / 2
      
      const angle = Math.atan2(target[1] * 2 - y * 2, target[0] * 2 - x * 2)
      focusBeamRef.current.rotation.z = -angle - Math.PI / 2
      
      const beamMaterial = focusBeamRef.current.material as THREE.MeshStandardMaterial
      beamMaterial.opacity = focusStrength * 0.3
    } else if (focusBeamRef.current) {
      focusBeamRef.current.visible = false
    }
  })

  return (
    <>
      {/* Attention cursor */}
      <mesh ref={attentionRef}>
        <coneGeometry args={[0.3, 0.5, 8]} />
        <meshStandardMaterial
          color="#9f7aea"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Target objects */}
      <group ref={targetsRef} />
      
      {/* Focus beam */}
      <mesh ref={focusBeamRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={1}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Wandering particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={useMemo(() => {
              const positions = new Float32Array(100 * 3)
              for (let i = 0; i < 100; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 8
                positions[i * 3 + 1] = Math.random() * 2
                positions[i * 3 + 2] = (Math.random() - 0.5) * 8
              }
              return positions
            }, [])}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#e0e7ff"
          transparent
          opacity={0.3}
        />
      </points>
    </>
  )
}