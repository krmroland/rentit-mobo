import SInfo from 'react-native-sensitive-info';
import { get } from 'lodash';

const parseData = data => {
  try {
    return JSON.parse(data || {});
  } catch (e) {}
  return {};
};

export const loadExistingUserFromStorage = () => {
  // first we will load the initial user from the secure storage if they have logged
  // in before
  return SInfo.getItem('user', {}).then(data => {
    // next we will try to load a user database
    return Promise.resolve(parseData(data));
  });
};
