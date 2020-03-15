import React from 'react';
import BootSplash from 'react-native-bootsplash';
import { ApplicationProvider, IconRegistry, Text } from '@ui-kitten/components';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StatusBar from '@/components/statusbar';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { mapping } from '@eva-design/eva';
import { useNavigation } from '@react-navigation/native';
import { Provider as PaperProvider, Snackbar } from 'react-native-paper';
import AppNavigation from '@/navigation/app';
import { useAuth, AuthProvider } from '@/auth';

import { default as customMapping } from './mappings';
import { appTheme, paper } from './themes';
import DB from '@/services/database/database';

const App = (): React.ReactFragment => {
  const { fetching: fetchingUser } = useAuth();

  const db = new DB(2, 2);

  const collection = db.collection('product');

  React.useEffect(() => {
    if (!fetchingUser) {
      BootSplash.hide({ duration: 250 });
    }
  }, [fetchingUser]);

  React.useEffect(() => {
    db.createUserTableIfDoesntExits();
    // collection.insert({ name: 'Ayebare Justus' }).catch(error => {
    //   console.log({ error });
    // });
    // db.whereData().then(data => console.log({ data }));
  }, []);

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
