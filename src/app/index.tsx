import React from 'react';
import {ApplicationProvider, IconRegistry, Text} from '@ui-kitten/components';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import StatusBar from '@/components/statusbar';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {mapping, light as theme} from '@eva-design/eva';

import {default as customMapping} from './mappings';

const App = (): React.ReactFragment => (
  <React.Fragment>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider
      mapping={mapping}
      theme={theme}
      customMapping={customMapping}>
      <SafeAreaProvider>
        <StatusBar />
        <Text> Hello world</Text>
      </SafeAreaProvider>
    </ApplicationProvider>
  </React.Fragment>
);

export default App;
