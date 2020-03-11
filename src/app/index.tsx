import React from 'react';
import BootSplash from 'react-native-bootsplash';
import { ApplicationProvider, IconRegistry, Text } from '@ui-kitten/components';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import StatusBar from '@/components/statusbar';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { mapping } from '@eva-design/eva';
import { useNavigation } from '@react-navigation/native';
import { Provider as PaperProvider, Snackbar } from 'react-native-paper';
import AppNavigation from '@/navigation/app';
import { useAuth, AuthProvider } from '@/auth';

import { database } from '@/database';

import { default as customMapping } from './mappings';
import { appTheme, paper } from './themes';

const App = (): React.ReactFragment => {
  const { fetching: fetchingUser } = useAuth();

  React.useEffect(() => {
    if (!fetchingUser) {
      BootSplash.hide({ duration: 250 });
    }
  }, [fetchingUser]);

  React.useEffect(() => {
    database.withChangesForTables(['products'], () => {
      console.log('database has changes');
    });
  }, []);

  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={appTheme} customMapping={customMapping}>
        <PaperProvider theme={paper}>
          <SafeAreaProvider>
            <StatusBar />
            <DatabaseProvider database={database}>
              <AuthProvider>
                <AppNavigation />
              </AuthProvider>
            </DatabaseProvider>
          </SafeAreaProvider>
        </PaperProvider>
      </ApplicationProvider>
    </React.Fragment>
  );
};

export default App;
