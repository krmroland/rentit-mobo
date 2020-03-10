module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': ['./src'],
        },
      },
    ],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
};
