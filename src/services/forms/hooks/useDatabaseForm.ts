import React from 'react';

import isFunction from 'lodash/isFunction';

import { useForm } from './useForm';

export interface Options {
  beforeSave?: (response: object) => object;
  onSuccess?: (response: any, data: object) => void;
  onError?: (error: any, data: object) => void;
}

export const useDatabaseForm = (tableName: string, fields) => {
  const form = useForm(fields);
  const [isBusy, updateIsBusy] = React.useState<boolean>(false);

  const persist = (callback: Function, options: Options = {}) => {
    form.withValidatedData(data => {
      updateIsBusy(true);

      if (isFunction(options.beforeSave)) {
        data = options.beforeSave(data);
      }

      Promise.resolve(callback(data))
        .then(response => {
          updateIsBusy(false);
          if (isFunction(options.onSuccess)) {
            return options.onSuccess(response, data);
          }
        })
        .catch(e => {
          //seems like a good use-case for finally but will cause
          // memory leaks if React.components are unmounted
          // before it runs, so we do it before
          // handing over control
          updateIsBusy(false);

          if (isFunction(options.onError)) {
            return options.onError(e, data);
          }
        });
    });
  };

  return {
    ...form,
    persist,
  };
};
