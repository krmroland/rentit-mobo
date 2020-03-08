import React from 'react';

import context from './context';

import { useAuth } from './useAuth';

export default ({ children }) => {
  const auth = useAuth();

  return <context.Provider value={auth}>{children}</context.Provider>;
};
