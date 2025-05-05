const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Expo Router'ı desteklemek için
config.resolver.assetExts.push('cjs');
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json', 'cjs');
config.transformer.minifierPath = require.resolve('metro-minify-terser');

module.exports = config; 