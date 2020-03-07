import React from 'react';
import { ApplicationProvider, IconRegistry, Text } from '@ui-kitten/components';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StatusBar from '@/components/statusbar';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { mapping } from '@eva-design/eva';
import AppNavigation from '@/navigation/app';

import { default as customMapping } from './mappings';
import theme from './theme';

const App = (): React.ReactFragment => (
  <React.Fragment>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider mapping={mapping} theme={theme} customMapping={customMapping}>
      <SafeAreaProvider>
        <StatusBar />
        <AppNavigation />
      </SafeAreaProvider>
    </ApplicationProvider>
  </React.Fragment>
);

export default App;
