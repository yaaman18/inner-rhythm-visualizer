use serde_json::json;
use rand::Rng;
use std::collections::HashMap;

pub struct AttentionWandering {
    attention_position: (f64, f64),
    attention_targets: Vec<(f64, f64)>,
    boredom_level: f64,
    curiosity_map: HashMap<String, f64>,
    current_focus: Option<usize>,
    focus_duration: f64,
}

impl Default for AttentionWandering {
    fn default() -> Self {
        let mut rng = rand::thread_rng();
        
        // Create random attention targets
        let targets = (0..5).map(|_| {
            (
                rng.gen_range(-1.0..1.0),
                rng.gen_range(-1.0..1.0),
            )
        }).collect();
        
        let mut curiosity_map = HashMap::new();
        curiosity_map.insert("novel".to_string(), 0.8);
        curiosity_map.insert("familiar".to_string(), 0.2);
        curiosity_map.insert("complex".to_string(), 0.6);
        
        Self {
            attention_position: (0.0, 0.0),
            attention_targets: targets,
            boredom_level: 0.0,
            curiosity_map,
            current_focus: None,
            focus_duration: 0.0,
        }
    }
}

impl AttentionWandering {
    pub fn update(&mut self, delta_time: f64) {
        let mut rng = rand::thread_rng();
        
        // Increase boredom over time
        self.boredom_level += delta_time * 0.1;
        
        if let Some(focus_idx) = self.current_focus {
            // Currently focused on a target
            self.focus_duration += delta_time;
            
            // Move attention towards target
            if let Some(target) = self.attention_targets.get(focus_idx) {
                let dx = target.0 - self.attention_position.0;
                let dy = target.1 - self.attention_position.1;
                
                self.attention_position.0 += dx * 0.1 * delta_time;
                self.attention_position.1 += dy * 0.1 * delta_time;
            }
            
            // Check if bored enough to switch focus
            if self.boredom_level > 1.0 || self.focus_duration > 5.0 {
                self.current_focus = None;
                self.boredom_level = 0.0;
                self.focus_duration = 0.0;
            }
        } else {
            // Wandering state - looking for something interesting
            let wander_force = (
                rng.gen_range(-1.0..1.0) * 0.5,
                rng.gen_range(-1.0..1.0) * 0.5,
            );
            
            self.attention_position.0 += wander_force.0 * delta_time;
            self.attention_position.1 += wander_force.1 * delta_time;
            
            // Check if close to any target
            for (idx, target) in self.attention_targets.iter().enumerate() {
                let distance = ((target.0 - self.attention_position.0).powi(2) 
                    + (target.1 - self.attention_position.1).powi(2)).sqrt();
                    
                if distance < 0.3 && rng.gen::<f64>() < 0.5 * delta_time {
                    self.current_focus = Some(idx);
                    break;
                }
            }
        }
        
        // Keep attention within bounds
        self.attention_position.0 = self.attention_position.0.clamp(-2.0, 2.0);
        self.attention_position.1 = self.attention_position.1.clamp(-2.0, 2.0);
        
        // Occasionally add new targets
        if rng.gen::<f64>() < 0.01 * delta_time {
            self.attention_targets.push((
                rng.gen_range(-1.0..1.0),
                rng.gen_range(-1.0..1.0),
            ));
            
            // Remove old targets if too many
            if self.attention_targets.len() > 8 {
                self.attention_targets.remove(0);
            }
        }
    }
    
    pub fn get_current_state(&self, timestamp: f64) -> crate::RhythmData {
        let focus_strength = if self.current_focus.is_some() {
            1.0 - self.boredom_level
        } else {
            0.0
        };
        
        crate::RhythmData {
            rhythm_type: "attention_wandering".to_string(),
            timestamp,
            values: vec![
                self.attention_position.0,
                self.attention_position.1,
                self.boredom_level,
                focus_strength,
            ],
            metadata: json!({
                "focused": self.current_focus.is_some(),
                "num_targets": self.attention_targets.len(),
                "focus_duration": self.focus_duration,
                "targets": self.attention_targets,
            }),
        }
    }
}