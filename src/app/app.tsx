import React from 'react';
import BootSplash from 'react-native-bootsplash';
import AppNavigation from '@/navigation/app';
import { useAuth, AuthContext, loadExistingUserFromStorage } from '@/app/auth';

export default () => {
  const [bootstraping, updateBootstraping] = React.useState<boolean>(true);

  const { updateUserData } = React.useContext(AuthContext);

  React.useEffect(() => {
    loadExistingUserFromStorage()
      .then(data => updateUserData(data))
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

  return !bootstraping ? <AppNavigation /> : null;
};
