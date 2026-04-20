import { useFocusEffect } from '@react-navigation/native';
import { NavigationBar } from 'expo-navigation-bar';
import { setStatusBarHidden, StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import WebView from 'react-native-webview';

import CBTWebView from '@/components/CBTWebView';
import { useLockdown } from '@/context/LockdownContext';
import {
    activateLockdown,
    deactivateLockdown,
    isUrlLocked,
} from '@/modules/lockdown-manager';

// ─── Component ───────────────────────────────────────────────────────────────

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);

  const { isLockdownActive, setLockdownActive } = useLockdown();

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showBackgroundWarning, setShowBackgroundWarning] = useState(false);

  // Re-apply immersive mode whenever this screen comes back into focus
  // (e.g. after DND permission Settings screen closes)
  useFocusEffect(
    useCallback(() => {
      if (isLockdownActive) {
        NavigationBar.setVisibilityAsync('hidden').catch(() => {});
        NavigationBar.setBehaviorAsync('inset-swipe').catch(() => {});
        StatusBar.setHidden(true, 'none');
        setStatusBarHidden(true, 'none');
      }
    }, [isLockdownActive]),
  );

  // ─── Callbacks passed to activateLockdown ──────────────────────────────────

  const onBackBlocked = (): void => {
    // Back is already blocked by BackHandler — nothing extra needed here.
  };

  const onBackground = (): void => {
    setShowBackgroundWarning(true);
  };

  // ─── URL change handler ────────────────────────────────────────────────────

  const handleUrlChange = (url: string): void => {
    const locked = isUrlLocked(url);

    if (locked && !isLockdownActive) {
      activateLockdown({ onBackBlocked, onBackground });
      setLockdownActive(true);
    } else if (!locked && isLockdownActive) {
      deactivateLockdown();
      setLockdownActive(false);
    }
  };

  // ─── Load error handler ────────────────────────────────────────────────────

  const handleLoadError = (): void => {
    setHasError(true);
    setIsLoading(false);
  };

  // ─── Retry handler ─────────────────────────────────────────────────────────

  const handleRetry = (): void => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  // ─── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      deactivateLockdown();
    };
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* WebView — always mounted so it can reload */}
      <View style={[styles.webViewContainer, hasError && styles.hidden]}>
        <CBTWebView
          ref={webViewRef}
          onUrlChange={handleUrlChange}
          onLoadError={handleLoadError}
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>

      {/* Loading indicator */}
      {isLoading && !hasError && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Memuat halaman...</Text>
        </View>
      )}

      {/* Error state */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Gagal Memuat Halaman</Text>
          <Text style={styles.errorMessage}>
            Periksa koneksi internet Anda dan coba lagi.
          </Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </Pressable>
        </View>
      )}

      {/* Background warning modal */}
      <Modal
        visible={showBackgroundWarning}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBackgroundWarning(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Peringatan</Text>
            <Text style={styles.modalMessage}>
              Anda tidak diizinkan meninggalkan aplikasi selama ujian berlangsung
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowBackgroundWarning(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webViewContainer: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 32,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
  },
  modalMessage: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 40,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
