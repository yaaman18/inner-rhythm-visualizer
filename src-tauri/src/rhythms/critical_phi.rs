use serde_json::json;
use rand::Rng;

pub struct CriticalPhi {
    phi_value: f64,
    phi_target: f64,
    fluctuation: f64,
    avalanche_threshold: f64,
    avalanche_active: bool,
    avalanche_duration: f64,
    integration_matrix: Vec<Vec<f64>>,
}

impl Default for CriticalPhi {
    fn default() -> Self {
        let size = 5;
        let mut matrix = vec![vec![0.0; size]; size];
        
        // Initialize with random connections
        let mut rng = rand::thread_rng();
        for i in 0..size {
            for j in 0..size {
                if i != j {
                    matrix[i][j] = rng.gen_range(0.0..0.5);
                }
            }
        }
        
        Self {
            phi_value: 0.5,
            phi_target: 0.7,
            fluctuation: 0.1,
            avalanche_threshold: 0.85,
            avalanche_active: false,
            avalanche_duration: 0.0,
            integration_matrix: matrix,
        }
    }
}

impl CriticalPhi {
    pub fn update(&mut self, delta_time: f64) {
        let mut rng = rand::thread_rng();
        
        if self.avalanche_active {
            // During avalanche, phi spikes dramatically
            self.phi_value += rng.gen_range(-0.5..0.5) * delta_time * 10.0;
            self.avalanche_duration -= delta_time;
            
            if self.avalanche_duration <= 0.0 {
                self.avalanche_active = false;
                self.phi_value = self.phi_target;
            }
        } else {
            // Normal fluctuations around critical point
            let drift = (self.phi_target - self.phi_value) * 0.1;
            let noise = rng.gen_range(-1.0..1.0) * self.fluctuation;
            
            self.phi_value += (drift + noise) * delta_time;
            
            // Check for avalanche trigger
            if self.phi_value > self.avalanche_threshold {
                self.avalanche_active = true;
                self.avalanche_duration = rng.gen_range(0.5..2.0);
            }
        }
        
        // Keep phi in reasonable bounds
        self.phi_value = self.phi_value.clamp(0.0, 1.5);
        
        // Slowly evolve integration matrix
        for i in 0..self.integration_matrix.len() {
            for j in 0..self.integration_matrix[i].len() {
                if i != j {
                    self.integration_matrix[i][j] += rng.gen_range(-0.01..0.01) * delta_time;
                    self.integration_matrix[i][j] = self.integration_matrix[i][j].clamp(0.0, 1.0);
                }
            }
        }
    }
    
    pub fn get_current_state(&self, timestamp: f64) -> crate::RhythmData {
        let matrix_sum: f64 = self.integration_matrix
            .iter()
            .flatten()
            .sum();
            
        crate::RhythmData {
            rhythm_type: "critical_phi".to_string(),
            timestamp,
            values: vec![self.phi_value],
            metadata: json!({
                "avalanche_active": self.avalanche_active,
                "matrix_complexity": matrix_sum,
                "criticality": (self.phi_value - self.phi_target).abs(),
            }),
        }
    }
}