import React from 'react';

import isFunction from 'lodash/isFunction';

import { useForm } from './useForm';

import { useDatabase } from '@nozbe/watermelondb/hooks';

export interface Options {
  beforeSave?: (data: object) => object;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export const useDatabaseForm = (tableName: string, fields) => {
  const form = useForm(fields);
  const [isBusy, updateIsBusy] = React.useState<boolean>(false);
  const database = useDatabase();

  const save = (options: Options, action: string = 'create') => {
    updateIsBusy(true);

    let data = form.values;

    if (isFunction(options.beforeSave)) {
      data = options.beforeSave(data);
    }

    const collection = database.collections.get(tableName);

    const persis = async () => {
      try {
        await database.action(async () => {
          const response = await collection[action](item => {
            Object.keys(data).forEach(field => {
              item[field] = data[field];
            });
          });
          updateIsBusy(false);

          if (isFunction(options.onSuccess)) {
            return options.onSuccess(response);
          }
        });
      } catch (e) {
        updateIsBusy(false);
        if (isFunction(options.onError)) {
          return options.onError(e);
        }
      }
    };
    return persis();
  };

  return {
    ...form,
    create: save,
    update: options => save(options, 'update'),
  };
};
