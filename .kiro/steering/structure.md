# Project Structure

## Directory Layout

```
/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root layout (ThemeProvider, Stack navigator)
│   ├── modal.tsx               # Modal screen
│   └── (tabs)/                 # Tab group
│       ├── _layout.tsx         # Tab bar configuration
│       ├── index.tsx           # Home tab
│       └── explore.tsx         # Explore tab
├── components/                 # Shared UI components
│   ├── themed-text.tsx         # Text with light/dark theme support
│   ├── themed-view.tsx         # View with light/dark theme support
│   ├── parallax-scroll-view.tsx
│   ├── hello-wave.tsx
│   ├── haptic-tab.tsx          # Tab button with haptic feedback
│   ├── external-link.tsx
│   └── ui/
│       ├── icon-symbol.tsx     # Cross-platform icon (Android/web)
│       ├── icon-symbol.ios.tsx # iOS-specific SF Symbols icon
│       └── collapsible.tsx
├── constants/
│   └── theme.ts                # Colors (light/dark) and Fonts
├── hooks/
│   ├── use-color-scheme.ts     # Color scheme hook (native)
│   ├── use-color-scheme.web.ts # Color scheme hook (web override)
│   └── use-theme-color.ts      # Resolves theme color from Colors
├── assets/
│   └── images/                 # App icons, splash, and image assets
├── scripts/
│   └── reset-project.js        # Dev utility to reset app directory
└── .kiro/
    ├── specs/                  # Feature specs (requirements, design, tasks)
    └── steering/               # AI steering rules (this directory)
```

## Conventions

### Routing
- All screens live under `app/`. Expo Router maps the file tree to routes.
- Route groups use parentheses: `(tabs)/` — groups don't appear in the URL.
- Platform-specific files use `.ios.tsx` / `.web.ts` suffixes (e.g., `icon-symbol.ios.tsx`, `use-color-scheme.web.ts`).

### Components
- Themed primitives (`ThemedText`, `ThemedView`) wrap RN core components and consume `useThemeColor` for automatic light/dark support. Prefer these over raw `Text`/`View`.
- Use `StyleSheet.create()` for all styles — keep styles at the bottom of the file.
- Component files use kebab-case: `themed-text.tsx`, `haptic-tab.tsx`.

### Theming
- All colors are defined in `constants/theme.ts` under `Colors.light` and `Colors.dark`.
- Use `useThemeColor` hook to resolve colors; pass `lightColor`/`darkColor` props to themed components for overrides.
- Font families are defined in `constants/theme.ts` under `Fonts` with platform-specific values.

### Hooks
- Custom hooks live in `hooks/` and use the `use-` prefix with kebab-case filenames.
- Platform overrides follow the `hook-name.web.ts` pattern.

### Imports
- Always use the `@/` alias for imports — never use relative `../` paths.
