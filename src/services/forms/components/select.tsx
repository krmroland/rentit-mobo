import React from 'react';
import { StyleSheet } from 'react-native';
import { IsFunction, isPlainObject } from 'lodash';
import { Select, Icon } from '@ui-kitten/components';

import useInputProps from './useInputProps';

export default props => {
  const inputProps = useInputProps(props);

  const { options, value = null, onChangeText = () => {}, style, ...selectProps } = props;

  const handleSelected = value => {
    onChangeText(value ? value.key : null);
  };

  const isUsingKeyValueOptions = isPlainObject(options);

  let data = [];

  // we wull use the text as the key
  // for plain arrays make it consistent
  // with values that actually have keys

  if (isUsingKeyValueOptions) {
    data = Object.keys(options).map(key => ({ key, text: options[key] }));
  } else if (Array.isArray(options)) {
    data = options.map(text => ({ text, key: text }));
  }

  // we wull have to use the key for the current value

  return (
    <Select
      data={data}
      selectedOption={{ text: isUsingKeyValueOptions ? options[value] : value }}
      onSelect={handleSelected}
      {...inputProps}
    />
  );
};
