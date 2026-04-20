# Tech Stack

## Framework & Runtime

- **React Native** 0.81.5 with **Expo** ~54.0.33
- **React** 19.1.0
- **TypeScript** ~5.9.2 (strict mode enabled)
- **Expo Router** ~6.0.23 (file-based routing)
- New Architecture enabled (`newArchEnabled: true`)
- React Compiler enabled (`reactCompiler: true`)

## Key Libraries

| Library | Version | Purpose |
|---|---|---|
| `expo-router` | ~6.0.23 | File-based navigation |
| `react-native-reanimated` | ~4.1.1 | Animations |
| `react-native-gesture-handler` | ~2.28.0 | Gesture handling |
| `react-native-screens` | ~4.16.0 | Native screen containers |
| `react-native-safe-area-context` | ~5.6.0 | Safe area insets |
| `@react-navigation/native` | ^7.1.8 | Navigation primitives |
| `@react-navigation/bottom-tabs` | ^7.4.0 | Tab navigation |
| `expo-haptics` | ~15.0.8 | Haptic feedback |
| `expo-image` | ~3.0.11 | Optimized image component |
| `@expo/vector-icons` | ^15.0.3 | Icon sets |
| `expo-symbols` | ~1.0.8 | SF Symbols (iOS) |

## Path Aliases

`@/*` maps to the workspace root. Always use `@/` for imports instead of relative paths.

```ts
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
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

# Reset project (moves app/ to app-example/, creates fresh app/)
npm run reset-project
```

## Build & Output

- Android: adaptive icon with edge-to-edge enabled, predictive back gesture disabled
- Web: static output (`"output": "static"`)
- Typed routes enabled via `experiments.typedRoutes`
