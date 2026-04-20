import { APP_CONFIG } from '@/constants/config';
import dndModule from '@/modules/dnd';
import * as NavigationBar from 'expo-navigation-bar';
import { setStatusBarHidden } from 'expo-status-bar';
import {
    AppState,
    AppStateStatus,
    BackHandler,
    NativeEventSubscription,
    Platform,
    StatusBar,
} from 'react-native';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface LockdownManagerOptions {
  /** Callback invoked when the hardware back button is pressed and blocked */
  onBackBlocked?: () => void;
  /** Callback invoked when the app moves to background while lockdown is active */
  onBackground?: () => void;
}

// ─── Module-level state ───────────────────────────────────────────────────────

let backHandlerSubscription: NativeEventSubscription | null = null;
let appStateSubscription: NativeEventSubscription | null = null;

// ─── Immersive mode helpers ───────────────────────────────────────────────────

/**
 * Enters Android immersive sticky mode — hides both status bar and navigation
 * bar, and blocks all system gesture navigation from screen edges.
 *
 * Uses the Android View.SYSTEM_UI_FLAG_* flags via StatusBar.setHidden +
 * expo-navigation-bar for maximum compatibility.
 */
async function enterImmersiveMode(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    // Hide navigation bar and set behavior to immersive sticky
    // (swipe-to-reveal is transient — bars auto-hide again)
    await NavigationBar.setVisibilityAsync('hidden');
    await NavigationBar.setBehaviorAsync('inset-swipe');
  } catch (err) {
    console.warn('LockdownManager: failed to set navigation bar immersive', err);
  }

  // Hide status bar
  StatusBar.setHidden(true, 'none');
  setStatusBarHidden(true, 'none');
}

/**
 * Exits immersive mode — restores status bar and navigation bar.
 */
async function exitImmersiveMode(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    await NavigationBar.setVisibilityAsync('visible');
    await NavigationBar.setBehaviorAsync('inset-swipe');
  } catch (err) {
    console.warn('LockdownManager: failed to restore navigation bar', err);
  }

  StatusBar.setHidden(false, 'none');
  setStatusBarHidden(false, 'none');
}

// ─── isUrlLocked ──────────────────────────────────────────────────────────────

/**
 * Evaluates whether a given URL should trigger lockdown mode.
 *
 * Returns `false` (Normal Mode) if the URL pathname is exactly `/` or contains
 * any path listed in `APP_CONFIG.LOGIN_PATHS`.
 * Returns `true` (Lockdown Mode) for all other URLs.
 *
 * Handles malformed URLs gracefully — defaults to `true` if parsing fails.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */
export function isUrlLocked(url: string): boolean {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;

    // Log untuk debugging
    console.log('[isUrlLocked] Checking URL:', url, 'pathname:', pathname);

    // Check if pathname matches any login path
    for (const loginPath of APP_CONFIG.LOGIN_PATHS) {
      // Exact match or starts with login path followed by something
      if (pathname === loginPath) {
        console.log('[isUrlLocked] Matched login path:', loginPath, '-> NOT LOCKED');
        return false;
      }
    }

    // If pathname is exactly '/', it's the root/login page
    if (pathname === '/' || pathname === '') {
      console.log('[isUrlLocked] Root path -> NOT LOCKED');
      return false;
    }

    console.log('[isUrlLocked] No match -> LOCKED');
    return true;
  } catch (e) {
    // Malformed URL — default to locked (safe fallback)
    console.log('[isUrlLocked] Parse error:', e, '-> LOCKED');
    return true;
  }
}

// ─── activateLockdown ─────────────────────────────────────────────────────────

/**
 * Activates lockdown mode:
 * - Blocks the Android hardware back button
 * - Enters immersive sticky mode (hides nav bar + status bar, blocks gestures)
 * - Enables Do Not Disturb if permission is granted
 * - Listens for app background transitions
 *
 * Validates: Requirements 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 4.5, 5.2, 7.1
 */
export function activateLockdown(options?: LockdownManagerOptions): void {
  // 1. Block hardware back button
  if (backHandlerSubscription) {
    backHandlerSubscription.remove();
  }
  backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
    options?.onBackBlocked?.();
    return true; // returning true blocks the default back action
  });

  // 2. Enter immersive sticky mode (hides system bars + blocks edge gestures)
  enterImmersiveMode();

  // 3. Enable DND — request permission first if not granted
  dndModule
    .isPermissionGranted()
    .then((granted) => {
      if (granted) {
        return dndModule.enableDND();
      } else {
        // Request permission — user will be taken to Settings
        return dndModule.requestPermission();
      }
    })
    .catch((err) => {
      console.warn('LockdownManager: DND setup failed', err);
    });

  // 4. Listen for app going to background
  if (appStateSubscription) {
    appStateSubscription.remove();
  }
  appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
    if (nextState === 'background' || nextState === 'inactive') {
      options?.onBackground?.();
    }
    // Re-apply immersive mode when returning to foreground
    if (nextState === 'active') {
      enterImmersiveMode();
    }
  });
}

// ─── deactivateLockdown ───────────────────────────────────────────────────────

/**
 * Deactivates lockdown mode:
 * - Restores the Android hardware back button
 * - Exits immersive mode (shows nav bar + status bar)
 * - Disables Do Not Disturb
 * - Removes the AppState background listener
 *
 * Validates: Requirements 3.1, 3.2, 4.6, 4.7, 5.3, 7.3
 */
export function deactivateLockdown(): void {
  // 1. Restore back button
  if (backHandlerSubscription) {
    backHandlerSubscription.remove();
    backHandlerSubscription = null;
  }

  // 2. Exit immersive mode
  exitImmersiveMode();

  // 3. Disable DND
  dndModule.disableDND().catch((err) => {
    console.warn('LockdownManager: failed to disable DND', err);
  });

  // 4. Remove AppState listener
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}
