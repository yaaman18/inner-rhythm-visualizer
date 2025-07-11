# Build Instructions

## Prerequisites

1. Install Rust: https://www.rust-lang.org/tools/install
2. Install Node.js (v16+): https://nodejs.org/
3. Install Tauri CLI:
   ```bash
   npm install -g @tauri-apps/cli
   ```

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yaaman18/inner-rhythm-visualizer.git
   cd inner-rhythm-visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

## Building

### For your current platform:
```bash
npm run tauri build
```

### Platform-specific builds:

#### Windows
- Produces `.msi` and `.exe` installers
- Located in `src-tauri/target/release/bundle/`

#### macOS
- Produces `.app` and `.dmg` files
- Requires code signing for distribution

#### Linux
- Produces `.deb` and `.AppImage` files
- May require additional system dependencies

## Icons

Place your application icons in `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

You can generate these using Tauri's icon generator:
```bash
npm run tauri icon path/to/your/icon.png
```

## Troubleshooting

### Common Issues

1. **Rust compilation errors**: Update Rust to the latest version
   ```bash
   rustup update
   ```

2. **Missing system dependencies (Linux)**: Install required packages
   ```bash
   sudo apt-get install libwebkit2gtk-4.0-dev \
       build-essential \
       curl \
       wget \
       libssl-dev \
       libgtk-3-dev \
       libayatana-appindicator3-dev \
       librsvg2-dev
   ```

3. **Build fails on macOS**: Ensure Xcode Command Line Tools are installed
   ```bash
   xcode-select --install
   ```

## Configuration

- Tauri config: `src-tauri/tauri.conf.json`
- Rust dependencies: `src-tauri/Cargo.toml`
- Frontend config: `vite.config.ts`

## Performance Optimization

1. Enable release mode optimizations in `Cargo.toml`
2. Minimize bundle size with Vite's build optimizations
3. Use `cargo build --release` for production builds

## Distribution

After building, installers are located in:
```
src-tauri/target/release/bundle/
```

For app store distribution, additional steps are required:
- Code signing
- Notarization (macOS)
- Package signing (Windows)

Refer to Tauri's distribution guide for platform-specific requirements.