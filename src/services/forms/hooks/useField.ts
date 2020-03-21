import React from 'react';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import isFunction from 'lodash/isFunction';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import { parse } from '../field';
import { FieldOptions } from '../types';

import { validate as validateField } from '../validation';

export default (options: FieldOptions) => {
  const [hasBeenValidatedAtleaseOnce, updatehasBeenValidatedAtleaseOnce] = React.useState(false);

  const { rules, optional, type, defaultValue } = parse(options);

  const [value, updateValue] = React.useState(defaultValue);

  const [error, updateError] = React.useState(null);

  const validate = value => {
    const result = validateField(value, options);

    updateError(result.error);

    if (!hasBeenValidatedAtleaseOnce) {
      updatehasBeenValidatedAtleaseOnce(true);
    }
  };

  const update = value => {
    updateValue(value);

    return validate(value);
  };

  const handleChange = () => value => update(value);

  const replaceError = (error: string) => updateError(error);

  return {
    name: options.name,
    value,
    update,
    error,
    replaceError,
    handleChange,
    hasBeenValidatedAtleaseOnce,
  };
};
