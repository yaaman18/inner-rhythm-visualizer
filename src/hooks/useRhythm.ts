import { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/tauri'

export interface RhythmData {
  rhythm_type: string
  timestamp: number
  values: number[]
  metadata: any
}

export function useRhythm(rhythmType: string) {
  const [data, setData] = useState<RhythmData | null>(null)
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    let mounted = true

    const update = async () => {
      const currentTime = Date.now()
      const deltaTime = (currentTime - lastTimeRef.current) / 1000
      lastTimeRef.current = currentTime

      try {
        // Update rhythm state in backend
        await invoke('update_rhythm', { rhythmType, deltaTime })
        
        // Get current state
        const rhythmData = await invoke<RhythmData>('get_rhythm_data', { rhythmType })
        
        if (mounted) {
          setData(rhythmData)
        }
      } catch (error) {
        console.error('Error updating rhythm:', error)
      }

      if (mounted) {
        animationFrameRef.current = requestAnimationFrame(update)
      }
    }

    update()

    return () => {
      mounted = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [rhythmType])

  return data
}