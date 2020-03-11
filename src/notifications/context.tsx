import React from 'react';

export const context = React.createContext({ message: 'hello world', show: () => {} });

export { default as Notification } from './notification';

export const Provider = ({ children }) => {
  return <context.Provider value={{ message: null }}>{children}</context.Provider>;
};
