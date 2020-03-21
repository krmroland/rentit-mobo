import React from 'react';
import { useTheme } from 'react-native-paper';
import SnackbarNotification from './notification';

import notificationRef from './ref';

export default () => {
  const theme = useTheme();

  return <SnackbarNotification ref={notificationRef} theme={theme} />;
};
