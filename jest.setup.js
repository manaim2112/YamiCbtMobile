// Prevent expo/src/winter/runtime.native.ts from triggering
// "import outside scope" errors in jest-runtime by pre-defining
// the __ExpoImportMetaRegistry global before the lazy getter fires.
if (typeof global.__ExpoImportMetaRegistry === 'undefined') {
  Object.defineProperty(global, '__ExpoImportMetaRegistry', {
    value: { url: null },
    enumerable: false,
    writable: true,
    configurable: true,
  });
}
