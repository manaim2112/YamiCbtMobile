import React, { forwardRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView, {
    ShouldStartLoadRequest,
    WebViewErrorEvent,
    WebViewHttpErrorEvent,
    WebViewNavigation,
    WebViewProgressEvent,
} from 'react-native-webview';

import { APP_CONFIG } from '@/constants/config';

const { TARGET_URL, TARGET_DOMAIN } = APP_CONFIG;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NavigationGuardResult {
  allowed: boolean;
  reason?: 'external_domain' | 'allowed';
}

export interface CBTWebViewProps {
  onUrlChange: (url: string) => void;
  onLoadError: () => void;
  onLoadingChange: (loading: boolean) => void;
}

// ─── Helper: evaluateNavigation ──────────────────────────────────────────────

export function evaluateNavigation(
  url: string,
  targetDomain: string,
): NavigationGuardResult {
  try {
    const { hostname } = new URL(url);
    if (hostname === targetDomain) {
      return { allowed: true, reason: 'allowed' };
    }
    return { allowed: false, reason: 'external_domain' };
  } catch {
    return { allowed: false, reason: 'external_domain' };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const CBTWebView = forwardRef<WebView, CBTWebViewProps>(
  ({ onUrlChange, onLoadError, onLoadingChange }, ref) => {
    
    // Navigation state change - primary loading tracker
    const handleNavigationStateChange = useCallback((navState: WebViewNavigation): void => {
      onLoadingChange(navState.loading);
      
      if (navState.url) {
        onUrlChange(navState.url);
      }
    }, [onLoadingChange, onUrlChange]);

    // Load progress - secondary tracker
    const handleLoadProgress = useCallback((event: WebViewProgressEvent): void => {
      // When progress reaches 1, consider it loaded
      if (event.nativeEvent.progress >= 1) {
        onLoadingChange(false);
      }
    }, [onLoadingChange]);

    // Navigation guard — block all external domains
    const handleShouldStartLoadWithRequest = useCallback(
      (request: ShouldStartLoadRequest): boolean => {
        const result = evaluateNavigation(request.url, TARGET_DOMAIN);
        return result.allowed;
      },
      [],
    );

    // Error handlers
    const handleError = useCallback((event: WebViewErrorEvent): void => {
      console.log('[CBTWebView] Error:', event.nativeEvent.code);
      onLoadError();
    }, [onLoadError]);

    const handleHttpError = useCallback((event: WebViewHttpErrorEvent): void => {
      console.log('[CBTWebView] HTTP Error:', event.nativeEvent.statusCode);
      onLoadError();
    }, [onLoadError]);

    return (
      <View style={styles.container}>
        <WebView
          ref={ref}
          source={{ uri: TARGET_URL }}
          // JavaScript & storage
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          cacheEnabled={true}
          incognito={false}
          // Disable zoom
          scalesPageToFit={false}
          textZoom={100}
          // Media
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          // Camera permission for proctoring
          mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
          // Security / navigation
          geolocationEnabled={false}
          allowsBackForwardNavigationGestures={false}
          // User agent
          userAgent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 YamiCBTMobile/1.0"
          // Handlers
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadProgress={handleLoadProgress}
          onError={handleError}
          onHttpError={handleHttpError}
          style={styles.webview}
        />
      </View>
    );
  },
);

CBTWebView.displayName = 'CBTWebView';

export default CBTWebView;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
