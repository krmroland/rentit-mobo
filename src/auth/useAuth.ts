import React from 'react';
import get from 'lodash/get';

import SInfo from 'react-native-sensitive-info';

export interface AuthType {
  user: object | null;
  token: string | null;
  fetching: boolean;
  update: (user: object, token: string) => void;
  currentAccount: object | null;
  currentAccountId: string | null;
  userId: string | null;
}

export const useAuth = (): AuthType => {
  const [fetching, updateFetching] = React.useState<boolean>(true);
  const [isSyncing, updateIsSyncing] = React.useState<boolean>(false);

  const [user, updateUser] = React.useState<object | null>(null);

  const [token, updateToken] = React.useState<string | null>(null);

  //SInfo.deleteItem('user', {});

  const fetchInitialUser = async () => {
    try {
      const data = await SInfo.getItem('user', {});
      const { user, token } = JSON.parse(data);
      updateUser(user);
      updateToken(token);
    } catch (e) {}
    updateFetching(false);
  };

  React.useEffect(() => {
    fetchInitialUser();
  }, []);

  const update = (user: object, token: string): void => {
    updateUser(user);
    updateToken(token);
    SInfo.setItem('user', JSON.stringify({ user, token }), {});
  };

  const currentAccount = get(user, 'account');

  return {
    user,
    token,
    update,
    fetching,
    currentAccount,
    currentAccountId: get(currentAccount, 'id', null),
    userId: get(user, 'id', null),
  };
};
