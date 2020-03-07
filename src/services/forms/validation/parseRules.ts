import { ValidatableRule, RawFieldOptions } from '../types';
import { isAValidRule, getValidationMessage } from './utils';

const wrap = (rules: RawFieldOptions['rules']): Array<string> => {
  return Array.isArray(rules) ? rules : String(rules).split('|');
};

export default (field: RawFieldOptions): Map<string, ValidatableRule> => {
  const result = new Map();

  wrap(field.rules).forEach(rule => {
    const parts = String(rule).split(':');

    const name = parts[0];

    if (isAValidRule(name)) {
      result.set(name, {
        name,
        parameters: parts[1] ? String(parts[1]).split(',') : [],
        message: getValidationMessage(name, field.messages),
      });
    } else {
      console.warn(`${name} is not a valid validation rule`);
    }
  });

  return result;
};
