import React from 'react';
import get from 'lodash/get';
import SInfo from 'react-native-sensitive-info';

export interface AuthType {
  user: object | null;
  token: string | null;
  update: (user: object, token: string) => void;
  currentAccount: object | null;
}

export const useAuth = (): AuthType => {
  const [isSyncing, updateIsSyncing] = React.useState<boolean>(false);

  const [user, updateUser] = React.useState<object | null>(null);

  const [token, updateToken] = React.useState<string | null>(null);

  //SInfo.deleteItem('user', {});

  const update = (user: object, token: string) => {
    updateUser(user);
    updateToken(token);
    return Promise.resolve();
  };

  const persistUser = (user, token) => {
    update(user, token);
    return SInfo.setItem('user', JSON.stringify({ user, token }), {});
  };

  const currentAccount = get(user, 'account');

  return {
    user,
    token,
    update,
    currentAccount,
  };
};
