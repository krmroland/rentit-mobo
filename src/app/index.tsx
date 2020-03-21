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
import { useAuth, AuthProvider, loadExistingUserFromStorage } from '@/auth';
import database from '@/data/db';

import { default as customMapping } from './mappings';
import { appTheme, paper } from './themes';
import bootstrap from './bootsrap';

const App = (): React.ReactFragment => {
  const [bootstraping, updateBootstraping] = React.useState<boolean>(true);

  const { update: updateAuth, user } = useAuth();

  React.useEffect(() => {
    loadExistingUserFromStorage()
      .then(({ user, token }) => updateAuth(user, token).then(() => Promise.resolve(user)))
      .then(user => database.loadUserDatabase(user))
      .then(() => {
        updateBootstraping(false);
        BootSplash.hide({ duration: 250 });
      })
      .catch(error => {
        updateBootstraping(false);
        console.log({ error });
        // show this error maybe?
        BootSplash.hide({ duration: 250 });
      });
  }, []);

  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={appTheme} customMapping={customMapping}>
        <PaperProvider theme={paper}>
          <SafeAreaProvider>
            <StatusBar />
            <AuthProvider>
              <AppNavigation
                initialRouteName={user ? 'Home' : 'Auth'}
                bootstraping={bootstraping}
              />
            </AuthProvider>
          </SafeAreaProvider>
        </PaperProvider>
      </ApplicationProvider>
    </React.Fragment>
  );
};

export default App;
