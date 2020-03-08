import React from 'react';

import { Text } from 'react-native';
import { tw } from 'react-native-tailwindcss';

import { TextInput } from 'react-native-paper';

export default props => {
  const { mode = 'outlined', error, ...inputProps } = props;

  return (
    <React.Fragment>
      <TextInput {...inputProps} mode={mode} error={!!error} autoCapitalize="none" />
      {error && <Text style={[tw.mT1, tw.pX1, tw.textRed700]}> {error}</Text>}
    </React.Fragment>
  );
};
