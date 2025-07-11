#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::State;

mod rhythms;

use rhythms::*;

#[derive(Default)]
struct AppState {
    multi_temporal: Arc<Mutex<MultiTemporalRhythm>>,
    critical_phi: Arc<Mutex<CriticalPhi>>,
    prediction_tension: Arc<Mutex<PredictionTension>>,
    semantic_vortex: Arc<Mutex<SemanticVortex>>,
    attention_wandering: Arc<Mutex<AttentionWandering>>,
}

#[derive(Serialize, Deserialize)]
struct RhythmData {
    rhythm_type: String,
    timestamp: f64,
    values: Vec<f64>,
    metadata: serde_json::Value,
}

#[tauri::command]
fn get_rhythm_data(rhythm_type: String, state: State<AppState>) -> Result<RhythmData, String> {
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs_f64();

    match rhythm_type.as_str() {
        "multi_temporal" => {
            let rhythm = state.multi_temporal.lock().unwrap();
            Ok(rhythm.get_current_state(timestamp))
        }
        "critical_phi" => {
            let rhythm = state.critical_phi.lock().unwrap();
            Ok(rhythm.get_current_state(timestamp))
        }
        "prediction_tension" => {
            let rhythm = state.prediction_tension.lock().unwrap();
            Ok(rhythm.get_current_state(timestamp))
        }
        "semantic_vortex" => {
            let rhythm = state.semantic_vortex.lock().unwrap();
            Ok(rhythm.get_current_state(timestamp))
        }
        "attention_wandering" => {
            let rhythm = state.attention_wandering.lock().unwrap();
            Ok(rhythm.get_current_state(timestamp))
        }
        _ => Err("Unknown rhythm type".to_string()),
    }
}

#[tauri::command]
fn update_rhythm(rhythm_type: String, delta_time: f64, state: State<AppState>) -> Result<(), String> {
    match rhythm_type.as_str() {
        "multi_temporal" => {
            let mut rhythm = state.multi_temporal.lock().unwrap();
            rhythm.update(delta_time);
            Ok(())
        }
        "critical_phi" => {
            let mut rhythm = state.critical_phi.lock().unwrap();
            rhythm.update(delta_time);
            Ok(())
        }
        "prediction_tension" => {
            let mut rhythm = state.prediction_tension.lock().unwrap();
            rhythm.update(delta_time);
            Ok(())
        }
        "semantic_vortex" => {
            let mut rhythm = state.semantic_vortex.lock().unwrap();
            rhythm.update(delta_time);
            Ok(())
        }
        "attention_wandering" => {
            let mut rhythm = state.attention_wandering.lock().unwrap();
            rhythm.update(delta_time);
            Ok(())
        }
        _ => Err("Unknown rhythm type".to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![get_rhythm_data, update_rhythm])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}