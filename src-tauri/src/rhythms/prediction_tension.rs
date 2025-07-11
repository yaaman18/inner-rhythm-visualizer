use serde_json::json;
use rand::Rng;

pub struct PredictionTension {
    error_buffer: Vec<f64>,
    buffer_capacity: usize,
    tension_level: f64,
    release_threshold: f64,
    release_active: bool,
    release_intensity: f64,
}

impl Default for PredictionTension {
    fn default() -> Self {
        Self {
            error_buffer: Vec::new(),
            buffer_capacity: 100,
            tension_level: 0.0,
            release_threshold: 0.8,
            release_active: false,
            release_intensity: 0.0,
        }
    }
}

impl PredictionTension {
    pub fn update(&mut self, delta_time: f64) {
        let mut rng = rand::thread_rng();
        
        // Simulate prediction errors
        let new_error = rng.gen_range(0.0..0.3) * delta_time;
        self.error_buffer.push(new_error);
        
        // Maintain buffer size
        if self.error_buffer.len() > self.buffer_capacity {
            self.error_buffer.remove(0);
        }
        
        // Calculate tension as accumulated error
        self.tension_level = self.error_buffer.iter().sum::<f64>() / self.buffer_capacity as f64;
        
        if self.release_active {
            // During release, tension drops rapidly
            self.release_intensity *= 0.95; // Exponential decay
            self.tension_level *= 0.9;
            
            if self.release_intensity < 0.01 {
                self.release_active = false;
                self.error_buffer.clear(); // Reset after release
            }
        } else if self.tension_level > self.release_threshold {
            // Trigger creative release
            self.release_active = true;
            self.release_intensity = self.tension_level * 2.0;
        }
    }
    
    pub fn get_current_state(&self, timestamp: f64) -> crate::RhythmData {
        let buffer_variance = if self.error_buffer.len() > 1 {
            let mean = self.error_buffer.iter().sum::<f64>() / self.error_buffer.len() as f64;
            self.error_buffer.iter()
                .map(|x| (x - mean).powi(2))
                .sum::<f64>() / self.error_buffer.len() as f64
        } else {
            0.0
        };
        
        crate::RhythmData {
            rhythm_type: "prediction_tension".to_string(),
            timestamp,
            values: vec![self.tension_level, self.release_intensity],
            metadata: json!({
                "release_active": self.release_active,
                "buffer_size": self.error_buffer.len(),
                "variance": buffer_variance,
            }),
        }
    }
}