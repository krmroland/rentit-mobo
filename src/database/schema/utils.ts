import { ColumnSchema } from '@nozbe/watermelondb/Schema';

export const timestamps = (): Array<ColumnSchema> => {
  return [{ name: 'created_at', type: 'number' }, { name: 'updated_at', type: 'number' }];
};
