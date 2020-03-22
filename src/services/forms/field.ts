import { RawFieldOptions, FieldType, ValidatableRule, FieldOptions } from './types';
import { parseRules } from './validation';

const inferTypeFromRules = (rules): FieldType => {
  switch (true) {
    case rules.has('numeric'):
      return FieldType.numeric;
    case rules.has('array'):
      return FieldType.array;
    default:
      return FieldType.string;
  }
};

export const parse = (field: RawFieldOptions): FieldOptions => {
  const rules: Map<string, ValidatableRule> = parseRules(field);

  return {
    name: field.name,
    rules: Array.from(rules.values()),
    optional: !rules.has('required'),
    type: inferTypeFromRules(rules),
    defaultValue: field.defaultValue || '',
    options: field.options || [],
  };
};
