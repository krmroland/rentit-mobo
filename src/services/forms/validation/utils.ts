import has from 'lodash/has';
import get from 'lodash/get';
import { isBlank } from '@/utils';
import validators from './validators';
import { replacePlaceHolders } from './replacers';

import messages from './messages';
import { Message, FieldOptions, ValidationResult } from '../types';

export const isAValidRule = (name: string): boolean => {
  return has(messages, name);
};

export const getValidationMessage = (name, customMessages: object): Message | null => {
  return get(customMessages, name, get(messages, name, null));
};

export const validate = (value, field: FieldOptions): ValidationResult => {
  if (isBlank(value) && field.optional) {
    return { error: null, isValid: true };
  }

  for (let rule of field.rules) {
    if (!validators[rule.name]) {
      console.warn(`Validator :${rule.name} doesnot exist`);

      return { error: null, isValid: true };
    }

    if (!validators[rule.name](value, rule, field)) {
      return { isValid: false, error: replacePlaceHolders(value, rule, field) };
    }
  }
  return { error: null, isValid: true };
};
