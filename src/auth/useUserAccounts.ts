import React from 'react';
import { get } from 'lodash';
import { useAuth } from './useAuth';
import AuthContext from './context';

export default () => {
  const { user } = React.useContext(AuthContext);
  // accounts
  // current

  if (!user) {
    return { currentAccountId: null, accounts: [] };
  }

  const accounts = user.account
    .concat(user, 'user.organizations', [])
    .map(({ id, name, ownerable_id: ownerId, ownerable_type: owner }) => {
      console.log({ id, name, owner, ownerId });
      return { id, name, owner, ownerId };
    });

  const currentAccountId = get(user, 'account.id'); // use main user account for now

  return {
    currentAccountId,
  };
};
