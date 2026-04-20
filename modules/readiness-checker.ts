import NetInfo from '@react-native-community/netinfo';
import { Camera } from 'expo-camera';
import { Platform } from 'react-native';

import { APP_CONFIG } from '@/constants/config';

export interface CheckResult {
  passed: boolean;
  message: string;
}

export interface ReadinessCheckResults {
  internet: CheckResult;
  camera: CheckResult;
  androidVersion: CheckResult;
}

/**
 * Checks internet connectivity using @react-native-community/netinfo.
 * Returns passed=false if the device has no active internet connection.
 */
export async function checkInternet(): Promise<CheckResult> {
  try {
    const state = await NetInfo.fetch();
    if (state.isConnected === false || state.isConnected === null) {
      return {
        passed: false,
        message: 'Koneksi internet tidak tersedia',
      };
    }
    return {
      passed: true,
      message: 'Koneksi internet tersedia',
    };
  } catch {
    return {
      passed: false,
      message: 'Koneksi internet tidak tersedia',
    };
  }
}

/**
 * Checks camera availability and permission using expo-camera.
 * Requests permission if not already granted.
 * Returns passed=false if permission is denied or unavailable.
 */
export async function checkCamera(): Promise<CheckResult> {
  try {
    const existing = await Camera.getCameraPermissionsAsync();

    if (existing.status === 'granted') {
      return {
        passed: true,
        message: 'Kamera tersedia',
      };
    }

    const requested = await Camera.requestCameraPermissionsAsync();

    if (requested.status !== 'granted') {
      return {
        passed: false,
        message: 'Kamera tidak tersedia',
      };
    }

    return {
      passed: true,
      message: 'Kamera tersedia',
    };
  } catch {
    return {
      passed: false,
      message: 'Kamera tidak tersedia',
    };
  }
}

/**
 * Checks the Android API level against the minimum required version.
 * Accepts an optional apiLevel parameter for testability (defaults to Platform.Version).
 * Returns passed=true on non-Android platforms.
 */
export function checkAndroidVersion(
  apiLevel: number | string = Platform.Version
): CheckResult {
  if (Platform.OS !== 'android') {
    return {
      passed: true,
      message: 'Versi platform didukung',
    };
  }

  const level = typeof apiLevel === 'string' ? parseInt(apiLevel, 10) : apiLevel;

  if (level < APP_CONFIG.ANDROID_MIN_API_LEVEL) {
    return {
      passed: false,
      message: `Versi Android tidak didukung (minimum ${APP_CONFIG.ANDROID_MIN_VERSION_LABEL})`,
    };
  }

  return {
    passed: true,
    message: `Versi Android didukung (API ${level})`,
  };
}

/**
 * Runs all readiness checks in parallel using Promise.all().
 * Each check is independent — a failure in one does not affect others.
 */
export async function runAllChecks(): Promise<ReadinessCheckResults> {
  const [internet, camera, androidVersion] = await Promise.all([
    checkInternet(),
    checkCamera(),
    Promise.resolve(checkAndroidVersion()),
  ]);

  return { internet, camera, androidVersion };
}

/**
 * Returns true only if all three checks have passed=true.
 */
export function allChecksPassed(results: ReadinessCheckResults): boolean {
  return (
    results.internet.passed &&
    results.camera.passed &&
    results.androidVersion.passed
  );
}
