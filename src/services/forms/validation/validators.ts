import { isFilled } from '@/utils';

import { FieldOptions, FieldType, ValidatableRule } from '../types';

const getLengthByType = (value, field: FieldOptions): number => {
  switch (field.type) {
    case FieldType.numeric:
      return +value || 0;
    case FieldType.array:
      return value.length;
    default:
      return String(value).length;
  }
};

export default {
  required(value): boolean {
    return isFilled(value);
  },
  min(value, rule: ValidatableRule, field: FieldOptions): boolean {
    return getLengthByType(value, field) >= rule.parameters[0];
  },
  sometimes(): boolean {
    return true;
  },
  nullable(): boolean {
    return true;
  },

  max(value, rule: ValidatableRule, field: FieldOptions): boolean {
    return getLengthByType(value, field) <= rule.parameters[0];
  },
  email(value): boolean {
    const check = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return check.test(String(value).toLowerCase());
  },
};
