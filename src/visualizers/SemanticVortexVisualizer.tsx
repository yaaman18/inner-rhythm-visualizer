import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRhythm } from '../hooks/useRhythm'

export default function SemanticVortexVisualizer() {
  const currentPosRef = useRef<THREE.Mesh>(null)
  const flowFieldRef = useRef<THREE.InstancedMesh>(null)
  const trailRef = useRef<THREE.Points>(null)
  const data = useRhythm('semantic_vortex')

  const trailLength = 100
  const trailPositions = useRef(new Float32Array(trailLength * 3))
  const trailIndex = useRef(0)

  const flowFieldCount = 20 * 20
  const flowFieldMatrix = useMemo(() => {
    const matrices = []
    for (let x = 0; x < 20; x++) {
      for (let z = 0; z < 20; z++) {
        const matrix = new THREE.Matrix4()
        matrix.setPosition(
          (x - 10) * 0.3,
          0,
          (z - 10) * 0.3
        )
        matrices.push(matrix)
      }
    }
    return matrices
  }, [])

  useFrame((state) => {
    if (!data || !currentPosRef.current || !flowFieldRef.current || !trailRef.current) return

    const time = state.clock.getElapsedTime()
    const [x, y, z, flowMagnitude] = data.values
    const velocity = data.metadata.velocity || [0, 0, 0]

    // Update current position indicator
    currentPosRef.current.position.set(x * 2, y * 2, z * 2)
    currentPosRef.current.rotation.x = time * velocity[0]
    currentPosRef.current.rotation.y = time * velocity[1]
    currentPosRef.current.rotation.z = time * velocity[2]

    // Update trail
    const positions = trailPositions.current
    positions[trailIndex.current * 3] = x * 2
    positions[trailIndex.current * 3 + 1] = y * 2
    positions[trailIndex.current * 3 + 2] = z * 2
    trailIndex.current = (trailIndex.current + 1) % trailLength
    
    trailRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )

    // Update flow field visualization
    for (let i = 0; i < flowFieldCount; i++) {
      const matrix = flowFieldMatrix[i]
      const position = new THREE.Vector3()
      matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3())
      
      // Calculate vector field at this position
      const dx = position.x - x * 2
      const dz = position.z - z * 2
      const distance = Math.sqrt(dx * dx + dz * dz)
      
      // Vortex effect
      const angle = Math.atan2(dz, dx) + Math.PI / 2
      const strength = flowMagnitude / (distance + 1)
      
      // Update arrow orientation
      const newMatrix = new THREE.Matrix4()
      const rotation = new THREE.Euler(0, angle, strength * Math.PI / 4)
      const scale = new THREE.Vector3(0.1, 0.1 + strength * 0.2, 0.1)
      newMatrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale)
      
      flowFieldRef.current.setMatrixAt(i, newMatrix)
    }
    flowFieldRef.current.instanceMatrix.needsUpdate = true

    // Material effects
    const material = currentPosRef.current.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = flowMagnitude
  })

  return (
    <>
      {/* Current position */}
      <mesh ref={currentPosRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#ed8936"
          emissive="#ed8936"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Flow field arrows */}
      <instancedMesh ref={flowFieldRef} args={[undefined, undefined, flowFieldCount]}>
        <coneGeometry args={[0.05, 0.2, 4]} />
        <meshStandardMaterial
          color="#4299e1"
          transparent
          opacity={0.4}
        />
      </instancedMesh>
      
      {/* Trail */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={trailLength}
            array={trailPositions.current}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#fbd38d"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}