import { NativeModules, Platform } from 'react-native';

export interface DNDModuleInterface {
  isPermissionGranted(): Promise<boolean>;
  requestPermission(): Promise<void>;
  enableDND(): Promise<void>;
  disableDND(): Promise<void>;
}

const { DNDModule: NativeDNDModule } = NativeModules;

const dndModule: DNDModuleInterface = {
  isPermissionGranted: async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !NativeDNDModule) {
      return false;
    }
    return NativeDNDModule.isPermissionGranted();
  },

  requestPermission: async (): Promise<void> => {
    if (Platform.OS !== 'android' || !NativeDNDModule) {
      console.warn('DNDModule: requestPermission not available on this platform');
      return;
    }
    return NativeDNDModule.requestPermission();
  },

  enableDND: async (): Promise<void> => {
    if (Platform.OS !== 'android' || !NativeDNDModule) {
      console.warn('DNDModule: enableDND not available on this platform');
      return;
    }
    return NativeDNDModule.enableDND();
  },

  disableDND: async (): Promise<void> => {
    if (Platform.OS !== 'android' || !NativeDNDModule) {
      console.warn('DNDModule: disableDND not available on this platform');
      return;
    }
    return NativeDNDModule.disableDND();
  },
};

export default dndModule;
