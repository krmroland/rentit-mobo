import React from 'react';

import SInfo from 'react-native-sensitive-info';

export interface AuthType {
  user: object | null;
  token: string | null;
  fetching: boolean;
  update: (user: object, token: string) => void;
}

export const useAuth = (): AuthType => {
  const [fetching, updateFetching] = React.useState<boolean>(true);

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

  return {
    user,
    token,
    update,
    fetching,
  };
};
