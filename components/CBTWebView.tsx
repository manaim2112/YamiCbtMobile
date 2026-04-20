import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView, {
    ShouldStartLoadRequest,
    WebViewErrorEvent,
    WebViewHttpErrorEvent,
    WebViewNavigation,
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
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

// ─── Helper: evaluateNavigation ──────────────────────────────────────────────

/**
 * Evaluates whether a URL is allowed to load in the WebView.
 *
 * Returns `allowed: true` only when the URL's hostname exactly matches
 * `targetDomain`. Malformed URLs and all external domains are blocked.
 */
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
    // Malformed URL — block it
    return { allowed: false, reason: 'external_domain' };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const CBTWebView = forwardRef<WebView, CBTWebViewProps>(
  ({ onUrlChange, onLoadError, onLoadStart, onLoadEnd }, ref) => {
    // Navigation guard — block all external domains
    const handleShouldStartLoadWithRequest = (
      request: ShouldStartLoadRequest,
    ): boolean => {
      const result = evaluateNavigation(request.url, TARGET_DOMAIN);
      
      // Log untuk debugging
      if (!result.allowed) {
        console.log('[CBTWebView] Blocked navigation to:', request.url);
      }
      
      return result.allowed;
    };

    // Detect URL changes and propagate to parent
    const handleNavigationStateChange = (navState: WebViewNavigation): void => {
      // Log untuk debugging
      console.log('[CBTWebView] Navigation state:', navState.url, 'loading:', navState.loading);
      
      if (navState.url) {
        onUrlChange(navState.url);
      }
    };

    // Network / resource error
    const handleError = (event: WebViewErrorEvent): void => {
      console.log('[CBTWebView] Error:', event.nativeEvent);
      onLoadError();
    };

    // HTTP error (4xx, 5xx)
    const handleHttpError = (event: WebViewHttpErrorEvent): void => {
      console.log('[CBTWebView] HTTP Error:', event.nativeEvent.statusCode);
      onLoadError();
    };

    return (
      <View style={styles.container}>
        <WebView
          ref={ref}
          source={{ uri: TARGET_URL }}
          // JavaScript & storage
          javaScriptEnabled={true}
          domStorageEnabled={true}
          // PENTING: Enable cookie persistence
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
          // User agent (biar tidak dianggap bot)
          userAgent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 YamiCBTMobile/1.0"
          // Handlers
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleError}
          onHttpError={handleHttpError}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
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
