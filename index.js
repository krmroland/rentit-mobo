/**
 * @format
 */
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';

setJSExceptionHandler((error, isFatal) => {
  console.log('caught js error', { error, isFatal });
}, true);

setNativeExceptionHandler((error, isFatal) => {
  console.log('caught native error', { error, isFatal });
}, true);

import { AppRegistry } from 'react-native';
import App from './src/app';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
