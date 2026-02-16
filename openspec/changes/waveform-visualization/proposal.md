# Waveform Visualization

## Why

The base audio-recorder change uses a simple timer (MM:SS) with a pulsing red dot during recording. This works but gives no visual feedback about whether the microphone is actually picking up sound or how loud the input is. A live waveform visualization provides "proof of life" — users can see their voice being captured in real time, catch mic issues early, and get a more polished recording experience befitting the platform's core differentiator.

## What Changes

- Add an `AnalyserNode` connected to the microphone stream via `AudioContext`
- Render a live waveform (or amplitude bars) on a `<canvas>` element during recording
- Sync visualization start/stop with the existing recorder state machine (idle/recording/paused/stopped)
- Style the waveform to match the parchment/beige aesthetic (warm brown bars on cream background)
- Clean up AudioContext properly on stop and component unmount

## Capabilities

### New Capabilities
- `live-waveform`: Real-time audio visualization during recording using AudioContext AnalyserNode + canvas rendering
- `mic-level-feedback`: Visual indication that the microphone is picking up sound and approximate input level

### Modified Capabilities
- `AudioRecorderUI`: Replace or augment the simple timer display with waveform visualization (timer still shown alongside)

## Impact
- **Modified components:** `AudioRecorder` component — add canvas element and AudioContext wiring
- **New hook or utility:** `useWaveform(stream)` — manages AnalyserNode, animation frame loop, and canvas drawing
- **Dependencies:** None — AudioContext and Canvas are standard browser APIs
- **Effort:** ~2-4 hours on top of the base audio recorder
- **Prerequisite:** Requires the base `audio-recorder` change to be implemented first
- **Cross-browser:** Safari handles AudioContext with a `webkit` prefix (older versions) and requires user gesture to start — already handled by the mic permission flow
