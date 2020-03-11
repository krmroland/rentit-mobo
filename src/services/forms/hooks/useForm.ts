import React from 'react';
import get from 'lodash/get';
import has from 'lodash/has';
import { validate as validateField } from '../validation';

import { parse } from '../field';

import { RawFieldOptions } from '../types';

export const useForm = (fields: Array<RawFieldOptions> = []) => {
  // first we need to parse the fields

  const formFields = Object.create(null);

  const defaultValues = Object.create(null);

  fields.forEach(options => {
    const fieldOptions = parse(options);

    const { name, defaultValue } = fieldOptions;

    formFields[name] = fieldOptions;

    defaultValues[name] = defaultValue;
  });

  const [errors, updateErrors] = React.useState<object>(Object.create(null));

  const [hasErrors, updateHasErrors] = React.useState<boolean>(false);

  const [values, updateValues] = React.useState<object>(defaultValues);

  const validateFormField = (attributeName: string, value): string | null => {
    const field = formFields[attributeName];

    if (field) {
      const result = validateField(value, field);

      updateErrors({ ...errors, [attributeName]: result.error });

      return result.error;
    }

    return null;
  };

  const hasFilledErrors = errors => {
    return (
      Object.keys(errors).filter(fieldName => {
        // ignore non form errors
        return has(values, fieldName) && !!errors[fieldName];
      }).length !== 0
    );
  };

  const updateValue = (attributeName: string, value) => {
    if (!formFields[attributeName]) {
      console.warn(`Field ${attributeName} doesnot exist on the form`);
    }
    updateValues({ ...values, [attributeName]: value });

    validateFormField(attributeName, value);
  };

  const handleChange = (attributeName: string) => value => updateValue(attributeName, value);

  const validate = () => {
    const freshErrors = {};

    for (let name in values) {
      const error = validateFormField(name, values[name]);
      freshErrors[name] = error;
    }

    updateErrors(freshErrors);

    return { hasErrors: !hasFilledErrors(freshErrors), errors: freshErrors };
  };

  const submit = (callback: (data?: object) => Promise) => {
    // validate the form first
    if (!validate().hasErrors) {
      return;
    }

    return callback(values);
  };

  return {
    values,
    errors,
    updateErrors,
    validate,
    submit,
    hasErrors: hasFilledErrors(errors),
    handleChange,
  };
};
