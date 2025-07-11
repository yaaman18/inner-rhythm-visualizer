use serde_json::json;
use rand::Rng;
use nalgebra::{Vector3, Point3};

pub struct SemanticVortex {
    attractors: Vec<Point3<f64>>,
    repellers: Vec<Point3<f64>>,
    current_position: Point3<f64>,
    velocity: Vector3<f64>,
    vortex_strength: f64,
}

impl Default for SemanticVortex {
    fn default() -> Self {
        let mut rng = rand::thread_rng();
        
        // Initialize random attractors and repellers
        let attractors = (0..3).map(|_| {
            Point3::new(
                rng.gen_range(-1.0..1.0),
                rng.gen_range(-1.0..1.0),
                rng.gen_range(-1.0..1.0),
            )
        }).collect();
        
        let repellers = (0..2).map(|_| {
            Point3::new(
                rng.gen_range(-1.0..1.0),
                rng.gen_range(-1.0..1.0),
                rng.gen_range(-1.0..1.0),
            )
        }).collect();
        
        Self {
            attractors,
            repellers,
            current_position: Point3::origin(),
            velocity: Vector3::zeros(),
            vortex_strength: 0.5,
        }
    }
}

impl SemanticVortex {
    pub fn update(&mut self, delta_time: f64) {
        let mut rng = rand::thread_rng();
        
        // Calculate forces from attractors and repellers
        let mut force = Vector3::zeros();
        
        for attractor in &self.attractors {
            let direction = attractor - self.current_position;
            let distance = direction.norm();
            if distance > 0.01 {
                force += direction.normalize() * (self.vortex_strength / (distance + 0.1));
            }
        }
        
        for repeller in &self.repellers {
            let direction = self.current_position - repeller;
            let distance = direction.norm();
            if distance > 0.01 {
                force += direction.normalize() * (self.vortex_strength * 0.5 / (distance + 0.1));
            }
        }
        
        // Add vortex rotation
        let vortex_force = Vector3::new(
            -self.current_position.y * 0.5,
            self.current_position.x * 0.5,
            rng.gen_range(-0.1..0.1),
        );
        force += vortex_force;
        
        // Update velocity and position
        self.velocity += force * delta_time;
        self.velocity *= 0.98; // Damping
        self.current_position += self.velocity * delta_time;
        
        // Occasionally move attractors/repellers
        if rng.gen::<f64>() < 0.01 * delta_time {
            if let Some(attractor) = self.attractors.get_mut(rng.gen_range(0..self.attractors.len())) {
                *attractor += Vector3::new(
                    rng.gen_range(-0.1..0.1),
                    rng.gen_range(-0.1..0.1),
                    rng.gen_range(-0.1..0.1),
                );
            }
        }
    }
    
    pub fn get_current_state(&self, timestamp: f64) -> crate::RhythmData {
        let flow_magnitude = self.velocity.norm();
        let position_magnitude = self.current_position.coords.norm();
        
        crate::RhythmData {
            rhythm_type: "semantic_vortex".to_string(),
            timestamp,
            values: vec![
                self.current_position.x,
                self.current_position.y,
                self.current_position.z,
                flow_magnitude,
            ],
            metadata: json!({
                "velocity": [self.velocity.x, self.velocity.y, self.velocity.z],
                "num_attractors": self.attractors.len(),
                "num_repellers": self.repellers.len(),
                "position_magnitude": position_magnitude,
            }),
        }
    }
}