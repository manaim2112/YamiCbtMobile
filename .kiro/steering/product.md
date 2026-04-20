# Product

**YamiCBT Mobile** is an Android-focused React Native (Expo) app that serves as a dedicated client for the online exam platform at `https://cbt.mtssupel.sch.id`.

## Core Purpose

The app enforces exam integrity through two main mechanisms:

1. **Device Readiness Check** — Before entering the exam, users see a pre-flight screen that verifies internet connectivity, camera availability, and minimum Android version (Android 8.0 / API 26). The "Start" button is only enabled when all checks pass.

2. **Lockdown Mode** — Once a user logs in and navigates past the `/login` path, the app activates lockdown: back button blocked, system gestures blocked, fullscreen enforced, and Do Not Disturb enabled. Lockdown is lifted when the user returns to `/login` or the root path.

## Target Platform

- Primary: Android (with edge-to-edge and predictive back gesture disabled)
- Secondary: iOS (tablet supported)
- Web: static output (secondary concern)

## Key Constraints

- WebView must restrict navigation to `cbt.mtssupel.sch.id` only — external URLs are blocked
- Camera access must be permitted within the WebView for proctoring
- App scheme: `yamicbtmobile`
