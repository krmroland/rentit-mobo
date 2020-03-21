import ref from './ref';

export { default as Notifications } from './wrapper';

export const showMessage = (...args) => {
  return ref.current && ref.current.show(...args);
};

export default showMessage;
