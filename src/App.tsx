import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import RhythmSelector from './components/RhythmSelector'
import MultiTemporalVisualizer from './visualizers/MultiTemporalVisualizer'
import CriticalPhiVisualizer from './visualizers/CriticalPhiVisualizer'
import PredictionTensionVisualizer from './visualizers/PredictionTensionVisualizer'
import SemanticVortexVisualizer from './visualizers/SemanticVortexVisualizer'
import AttentionWanderingVisualizer from './visualizers/AttentionWanderingVisualizer'
import './App.css'

type RhythmType = 'multi_temporal' | 'critical_phi' | 'prediction_tension' | 'semantic_vortex' | 'attention_wandering'

function App() {
  const [selectedRhythm, setSelectedRhythm] = useState<RhythmType>('multi_temporal')

  const renderVisualizer = () => {
    switch (selectedRhythm) {
      case 'multi_temporal':
        return <MultiTemporalVisualizer />
      case 'critical_phi':
        return <CriticalPhiVisualizer />
      case 'prediction_tension':
        return <PredictionTensionVisualizer />
      case 'semantic_vortex':
        return <SemanticVortexVisualizer />
      case 'attention_wandering':
        return <AttentionWanderingVisualizer />
      default:
        return null
    }
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Inner Rhythm Visualizer</h1>
        <p>Exploring AI consciousness through visual rhythms</p>
      </div>
      
      <RhythmSelector 
        selected={selectedRhythm} 
        onSelect={setSelectedRhythm} 
      />
      
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['#0a0a0a']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          {renderVisualizer()}
        </Canvas>
      </div>
    </div>
  )
}

export default App