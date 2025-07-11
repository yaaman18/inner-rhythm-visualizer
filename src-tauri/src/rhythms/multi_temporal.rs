use serde::{Deserialize, Serialize};
use serde_json::json;
use std::f64::consts::PI;
use rand::Rng;

#[derive(Serialize, Deserialize)]
struct Oscillator {
    frequency: f64,
    phase: f64,
    amplitude: f64,
    chaos_factor: f64,
}

pub struct MultiTemporalRhythm {
    oscillators: Vec<Oscillator>,
    coupling_strength: f64,
    time: f64,
}

impl Default for MultiTemporalRhythm {
    fn default() -> Self {
        Self {
            oscillators: vec![
                Oscillator {
                    frequency: 0.1,
                    phase: 0.0,
                    amplitude: 1.0,
                    chaos_factor: 0.3,
                },
                Oscillator {
                    frequency: 0.01,
                    phase: PI / 4.0,
                    amplitude: 0.8,
                    chaos_factor: 0.5,
                },
                Oscillator {
                    frequency: 0.001,
                    phase: PI / 2.0,
                    amplitude: 0.6,
                    chaos_factor: 0.7,
                },
            ],
            coupling_strength: 0.2,
            time: 0.0,
        }
    }
}

impl MultiTemporalRhythm {
    pub fn update(&mut self, delta_time: f64) {
        self.time += delta_time;
        let mut rng = rand::thread_rng();
        
        // Update each oscillator with coupling effects
        for i in 0..self.oscillators.len() {
            let mut coupling_effect = 0.0;
            
            // Calculate coupling from other oscillators
            for j in 0..self.oscillators.len() {
                if i != j {
                    let phase_diff = self.oscillators[j].phase - self.oscillators[i].phase;
                    coupling_effect += self.coupling_strength * phase_diff.sin();
                }
            }
            
            // Add chaotic perturbation
            let chaos = rng.gen_range(-1.0..1.0) * self.oscillators[i].chaos_factor * 0.01;
            
            // Update phase
            self.oscillators[i].phase += 2.0 * PI * self.oscillators[i].frequency * delta_time
                + coupling_effect * delta_time
                + chaos;
            
            // Keep phase in [0, 2π]
            self.oscillators[i].phase = self.oscillators[i].phase % (2.0 * PI);
        }
    }
    
    pub fn get_current_state(&self, timestamp: f64) -> crate::RhythmData {
        let values: Vec<f64> = self.oscillators
            .iter()
            .map(|osc| osc.amplitude * osc.phase.sin())
            .collect();
            
        let phases: Vec<f64> = self.oscillators
            .iter()
            .map(|osc| osc.phase)
            .collect();
            
        crate::RhythmData {
            rhythm_type: "multi_temporal".to_string(),
            timestamp,
            values,
            metadata: json!({
                "phases": phases,
                "coupling_strength": self.coupling_strength,
                "time": self.time,
            }),
        }
    }
}