import { Message, ValidatableRule, FieldOptions } from '../types';

const replaceAttributePlaceHolder = (message: Message, field: FieldOptions): string => {
  return String(message).replace(':attribute', field.name || 'field');
};

const replacers = {
  min(rule: ValidatableRule, field: FieldOptions): string {
    return String(replaceAttributePlaceHolder(rule.message[field.type], field)).replace(
      ':min',
      rule.parameters,
    );
  },
};

export const replacePlaceHolders = (value, rule: ValidatableRule, field: FieldOptions) => {
  if (replacers[rule.name]) {
    return replacers[rule.name](rule, field, value);
  }
  return replaceAttributePlaceHolder(rule.message, field);
};
