# YamiCBT Mobile

Android-focused React Native (Expo) app for the online exam platform at `https://cbt.mtssupel.sch.id`.

## Features

- **Device Readiness Check** — Verifies internet connectivity, camera availability, and minimum Android version before exam
- **Lockdown Mode** — Enforces exam integrity by blocking back button, system gestures, and enabling fullscreen + DND
- **WebView Integration** — Restricted navigation to `cbt.mtssupel.sch.id` only with camera access for proctoring

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Common Commands

```bash
# Start dev server
npm run start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Lint
npm run lint

# Test
npm run test
```

## Release & Deployment

See [docs/RELEASE_SETUP.md](docs/RELEASE_SETUP.md) for instructions on:
- Generating keystore for signed builds
- Configuring GitHub Secrets
- Triggering releases via tags

### Quick Release

```bash
# Patch release (1.0.4 -> 1.0.5)
npm run release

# Minor release (1.0.4 -> 1.1.0)
npm run release:minor

# Major release (1.0.4 -> 2.0.0)
npm run release:major

# Push tag to trigger build
git push --follow-tags
```

## Tech Stack

- **React Native** 0.81.5 with **Expo** ~54.0.33
- **React** 19.1.0
- **TypeScript** ~5.9.2
- **Expo Router** ~6.0.23 (file-based routing)
- New Architecture enabled

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/)
