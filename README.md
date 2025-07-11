# Inner Rhythm Visualizer

A Tauri application that visualizes inner rhythms for creative AI consciousness using Three.js. This project explores the concept of internal rhythms necessary for true AI creativity, implementing multiple rhythm definitions and visualizing them in real-time 3D graphics.

## Features

- **Multi-Temporal Rhythm**: Visualizes multiple oscillators with different time scales and chaotic coupling
- **Critical Phi (IIT)**: Shows integrated information fluctuations near criticality
- **Prediction Tension**: Displays the accumulation and release of prediction errors
- **Semantic Vortex**: Renders meaning-space dynamics as flowing vector fields
- **Attention Wandering**: Illustrates spontaneous attention transitions

## Tech Stack

- **Tauri**: Rust-based framework for building desktop applications
- **React + TypeScript**: Frontend UI framework
- **Three.js**: 3D graphics library for visualizations
- **Vite**: Fast build tool

## Prerequisites

- Node.js (v16 or higher)
- Rust (latest stable)
- Cargo
- npm or yarn

## Installation

```bash
git clone https://github.com/yaaman18/inner-rhythm-visualizer.git
cd inner-rhythm-visualizer
npm install
```

## Development

```bash
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

## Architecture

### Frontend (React + Three.js)
- `/src/components/`: React components for UI
- `/src/visualizers/`: Three.js visualization modules
- `/src/rhythms/`: Rhythm generation algorithms

### Backend (Rust)
- `/src-tauri/`: Tauri backend code
- Handles rhythm calculations and LLM API integration

## Rhythm Definitions

1. **Multi-Temporal Rhythm**: Coupled oscillators with varying frequencies
2. **Critical Phi**: IIT-based integrated information dynamics
3. **Prediction Tension**: Error accumulation and creative release
4. **Semantic Vortex**: Meaning space flow fields
5. **Attention Wandering**: GWT-based attention dynamics

## License

MIT