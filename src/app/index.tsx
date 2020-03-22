import React from 'react';

import { ApplicationProvider, IconRegistry, Text } from '@ui-kitten/components';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StatusBar from '@/components/statusbar';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { mapping } from '@eva-design/eva';
import { useNavigation } from '@react-navigation/native';
import { Provider as PaperProvider, Snackbar } from 'react-native-paper';
import { AuthProvider } from '@/app/auth';

import { default as customMapping } from './mappings';

import { appTheme, paper } from './themes';

import App from './app';

export default () => {
  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={appTheme} customMapping={customMapping}>
        <PaperProvider theme={paper}>
          <SafeAreaProvider>
            <StatusBar />
            <AuthProvider>
              <App />
            </AuthProvider>
          </SafeAreaProvider>
        </PaperProvider>
      </ApplicationProvider>
    </React.Fragment>
  );
};
