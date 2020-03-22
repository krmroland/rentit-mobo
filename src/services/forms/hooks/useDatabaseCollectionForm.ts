import React from 'react';

import { get, isFunction } from 'lodash';
import database from '@/data/db';
import { AuthContext } from '@/auth';
import useForm from './useForm';

import { FormOptions } from './types';

export default name => {
  const collection = database.collection(name);

  const { accounts } = React.useContext(AuthContext);

  const [isBusy, updateIsBusy] = React.useState<boolean>(false);
  // we need to create a form out of the collection fields

  // every collection requires an account Id when inserting
  // we will go ahead add add that

  collection.fields.push({
    name: 'accountId',
    rules: ['required'],
    options: accounts.all,
    defaultValue: accounts.currentId,
  });

  const form = useForm(collection.fields);

  const create = (options: FormOptions = {}) => {
    // first we become busy

    return form.withValidatedData(data => {
      updateIsBusy(true);
      data = isFunction(options.beforeSave) ? options.beforeSave(data) || data : data;
      collection
        .insert(data)
        .then(response => {
          if (isFunction(options.onSuccess)) {
            options.onSuccess(response);
          }
          updateIsBusy(false);
        })
        .catch(error => {
          if (isFunction(options.onError)) {
            options.onError(error);
          }
          updateIsBusy(false);
        });
    });

    //
  };

  return { ...form, create, isBusy };
};
