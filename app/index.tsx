import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    allChecksPassed,
    CheckResult,
    ReadinessCheckResults,
    runAllChecks,
} from '@/modules/readiness-checker';

// ---------------------------------------------------------------------------
// CheckItem component
// ---------------------------------------------------------------------------

interface CheckItemProps {
  label: string;
  result: CheckResult | null; // null = still loading
}

function CheckItem({ label, result }: CheckItemProps) {
  return (
    <View style={styles.checkItem}>
      <View style={styles.checkItemLeft}>
        <Text style={styles.checkItemLabel}>{label}</Text>
        {result !== null && (
          <Text style={result.passed ? styles.checkItemMessagePass : styles.checkItemMessageFail}>
            {result.message}
          </Text>
        )}
      </View>
      <View style={styles.checkItemRight}>
        {result === null ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : result.passed ? (
          <Text style={styles.iconPass}>✓</Text>
        ) : (
          <Text style={styles.iconFail}>✗</Text>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ReadinessScreen
// ---------------------------------------------------------------------------

export default function ReadinessScreen() {
  const [results, setResults] = useState<ReadinessCheckResults | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runChecks = useCallback(async () => {
    setIsChecking(true);
    setResults(null);
    try {
      const checkResults = await runAllChecks();
      setResults(checkResults);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  const canStart = results !== null && allChecksPassed(results);

  const handleStart = () => {
    if (canStart) {
      router.push('/webview');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>YamiCBT Mobile</Text>
        <Text style={styles.subtitle}>Pengecekan Kesiapan Perangkat</Text>
      </View>

      {/* Check list */}
      <View style={styles.checkList}>
        <CheckItem
          label="Koneksi Internet"
          result={results ? results.internet : null}
        />
        <CheckItem
          label="Kamera"
          result={results ? results.camera : null}
        />
        <CheckItem
          label="Versi Android"
          result={results ? results.androidVersion : null}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.buttonStart, !canStart && styles.buttonDisabled]}
          onPress={handleStart}
          disabled={!canStart}
          accessibilityLabel="Mulai ujian"
          accessibilityState={{ disabled: !canStart }}
        >
          <Text style={styles.buttonStartText}>Mulai</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonRecheck, isChecking && styles.buttonDisabled]}
          onPress={runChecks}
          disabled={isChecking}
          accessibilityLabel="Periksa ulang kesiapan perangkat"
        >
          <Text style={styles.buttonRecheckText}>Periksa Ulang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Constants & Styles
// ---------------------------------------------------------------------------

const COLORS = {
  primary: '#22c55e',
  error: '#ef4444',
  background: '#ffffff',
  textDark: '#1a1a1a',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  buttonStartText: '#ffffff',
  buttonRecheckText: '#374151',
  buttonRecheckBg: '#f3f4f6',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  checkList: {
    flex: 1,
    gap: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  checkItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  checkItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  checkItemMessagePass: {
    fontSize: 13,
    color: COLORS.primary,
  },
  checkItemMessageFail: {
    fontSize: 13,
    color: COLORS.error,
  },
  checkItemRight: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPass: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  iconFail: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.error,
  },
  actions: {
    gap: 12,
    marginTop: 32,
  },
  buttonStart: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonStartText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.buttonStartText,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonRecheck: {
    backgroundColor: COLORS.buttonRecheckBg,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonRecheckText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.buttonRecheckText,
  },
});
