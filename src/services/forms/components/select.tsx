import React from 'react';
import { StyleSheet } from 'react-native';
import IsFunction from 'lodash/IsFunction';
import { Select, Icon } from '@ui-kitten/components';

import useInputProps from './useInputProps';

export default props => {
  const inputProps = useInputProps(props);

  const { options, value = null, onChangeText = () => {}, style, ...selectProps } = props;

  const handleSelected = value => {
    onChangeText(value ? value.text : null);
  };

  let data = [];

  if (Array.isArray(options)) {
    options.forEach(text => data.push({ text }));
  }

  return (
    <Select
      data={data}
      {...props}
      selectedOption={{ text: value }}
      onSelect={handleSelected}
      {...inputProps}
    />
  );
};
