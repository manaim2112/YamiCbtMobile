import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
    allChecksPassed,
    ReadinessCheckResults,
    runAllChecks,
} from '@/modules/readiness-checker';

export default function HomeScreen() {
  const router = useRouter();
  const [checks, setChecks] = useState<ReadinessCheckResults | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    setIsChecking(true);
    const results = await runAllChecks();
    setChecks(results);
    setIsChecking(false);
  };

  const handleStart = () => {
    router.replace('/webview');
  };

  const allPassed = checks ? allChecksPassed(checks) : false;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <ThemedText type="title" style={styles.title}>
          YamiCBT Mobile
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Persiapan Sebelum Ujian
        </ThemedText>

        {/* Loading state */}
        {isChecking && (
          <View style={styles.checkContainer}>
            <ActivityIndicator size="large" color="#1a73e8" />
            <ThemedText style={styles.loadingText}>
              Memeriksa perangkat...
            </ThemedText>
          </View>
        )}

        {/* Check results */}
        {!isChecking && checks && (
          <View style={styles.checkContainer}>
            <CheckItem
              label="Koneksi Internet"
              passed={checks.internet.passed}
              message={checks.internet.message}
            />
            <CheckItem
              label="Kamera"
              passed={checks.camera.passed}
              message={checks.camera.message}
            />
            <CheckItem
              label="Versi Android"
              passed={checks.androidVersion.passed}
              message={checks.androidVersion.message}
            />
          </View>
        )}

        {/* Start button */}
        {!isChecking && (
          <Pressable
            style={[styles.button, !allPassed && styles.buttonDisabled]}
            onPress={handleStart}
            disabled={!allPassed}
          >
            <ThemedText
              style={[styles.buttonText, !allPassed && styles.buttonTextDisabled]}
            >
              Mulai
            </ThemedText>
          </Pressable>
        )}

        {/* Retry button */}
        {!isChecking && !allPassed && (
          <Pressable style={styles.retryButton} onPress={runChecks}>
            <ThemedText style={styles.retryButtonText}>Periksa Ulang</ThemedText>
          </Pressable>
        )}

        {/* Info */}
        <ThemedText style={styles.info}>
          Pastikan semua pemeriksaan berhasil sebelum memulai ujian.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

// ─── Check Item Component ─────────────────────────────────────────────────────

interface CheckItemProps {
  label: string;
  passed: boolean;
  message: string;
}

function CheckItem({ label, passed, message }: CheckItemProps) {
  return (
    <View style={styles.checkItem}>
      <View style={styles.checkItemHeader}>
        <Ionicons
          name={passed ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={passed ? '#34a853' : '#ea4335'}
        />
        <ThemedText style={styles.checkItemLabel}>{label}</ThemedText>
      </View>
      <ThemedText style={styles.checkItemMessage}>{message}</ThemedText>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
  },
  checkContainer: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  checkItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  checkItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  checkItemLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkItemMessage: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 32,
  },
  button: {
    backgroundColor: '#1a73e8',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonTextDisabled: {
    color: '#999999',
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '500',
  },
  info: {
    marginTop: 24,
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
});
