import React from 'react';
import { get, compact, map } from 'lodash';
import SInfo from 'react-native-sensitive-info';

import database from '@/data/db';

import { AuthType, RawUser } from './types';

const prepareAccount = owner => {};

const getAccounts = user => {
  if (!user) {
    return { currentId: null, all: [] };
  }

  let all = {};

  //  organizationAccounts
  [user, ...get(user, 'organizations', [])]
    .filter(owner => owner.account)
    .forEach(({ account, name }) => {
      all[account.id] = name;
    });

  return {
    all,
    currentId: get(user, 'current_account_id', get(user, 'account.id')), // use the current main account by default
  };
};

export const useAuth = (): AuthType => {
  const [isSyncing, updateIsSyncing] = React.useState<boolean>(false);

  const [data, updateData] = React.useState<RawUser>({ user: null, token: null });

  const updateUserData = data => {
    return database.loadUserDatabase(get(data, 'user')).then(() => updateData(data));
  };

  SInfo.deleteItem('user', {});

  const persistUserData = data => {
    return SInfo.setItem('user', JSON.stringify(data), {}).then(() => {
      return updateUserData(data);
    });
  };

  return {
    ...data,
    accounts: getAccounts(data.user),
    updateUserData,
    persistUserData,
  };
};
