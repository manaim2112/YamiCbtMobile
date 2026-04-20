/**
 * Property-based tests for ReadinessChecker module.
 *
 * Feature: cbt-app
 */

import * as fc from 'fast-check';

// Mock native modules before importing the module under test
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn().mockResolvedValue({ isConnected: true }),
  },
}));

jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  },
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    Version: 26,
  },
}));

import { checkAndroidVersion } from '@/modules/readiness-checker';

// ─────────────────────────────────────────────────────────────────────────────
// Property 1: Android version check adalah fungsi murni
// Validates: Requirements 1.4
// ─────────────────────────────────────────────────────────────────────────────

describe('checkAndroidVersion', () => {
  // Feature: cbt-app, Property 1: Android version check adalah fungsi murni
  it('returns passed=true only for API level >= 26, passed=false otherwise', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (apiLevel) => {
        const result = checkAndroidVersion(apiLevel);
        return apiLevel >= 26 ? result.passed === true : result.passed === false;
      }),
      { numRuns: 100 },
    );
  });
});
