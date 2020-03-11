import React from 'react';
import { StyleSheet } from 'react-native';

import { Input } from '@ui-kitten/components';
import useInputProps from './useInputProps';

export default props => {
  const inputProps = useInputProps(props);

  return <Input autoCapitalize="none" {...inputProps} />;
};
