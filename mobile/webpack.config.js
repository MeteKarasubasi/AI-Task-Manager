const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          'expo-router',
          '@react-navigation',
          'react-native-reanimated',
          '@expo/vector-icons'
        ]
      },
    },
    argv
  );

  // Expo Router için gerekli ayarlar
  config.resolve.alias = {
    ...config.resolve.alias,
    // Expo Router tarafından kullanılan modüllerin doğru şekilde çözümlenmesi
    'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
    'react': path.resolve(__dirname, 'node_modules/react'),
    '@/*': path.resolve(__dirname, '*'),
  };

  // MIME tipi sorununun çözümü
  config.module.rules.push({
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['babel-preset-expo'],
        plugins: ['expo-router/babel']
      }
    }
  });

  return config;
}; 