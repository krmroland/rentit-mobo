import React from 'react';
import { ApplicationProvider, IconRegistry, Text } from '@ui-kitten/components';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StatusBar from '@/components/statusbar';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { mapping } from '@eva-design/eva';
import AppNavigation from '@/navigation/app';
import { useNavigation } from '@react-navigation/native';
import { Provider as AuthProvider } from '@/services/auth';
import { Provider as PaperProvider } from 'react-native-paper';

import { default as customMapping } from './mappings';
import { appTheme, paper } from './themes';

const App = (): React.ReactFragment => {
  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={appTheme} customMapping={customMapping}>
        <PaperProvider theme={paper}>
          <SafeAreaProvider>
            <StatusBar />
            <AuthProvider>
              <AppNavigation />
            </AuthProvider>
          </SafeAreaProvider>
        </PaperProvider>
      </ApplicationProvider>
    </React.Fragment>
  );
};

export default App;
