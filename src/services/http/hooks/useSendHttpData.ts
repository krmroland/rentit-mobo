import React from 'react';
import isFunction from 'lodash/isFunction';

import http from '../api';

export const useSendHttpData = () => {
  const [response, updateResponse] = React.useState(null);
  const [error, updateError] = React.useState({});
  const [isBusy, updateIsBusy] = React.useState(false);

  let defaultOptions = {
    onSuccess: null,
    onError: null,
    verb: 'post',
    data: {},
    http: {},
    beforeSubmit: data => data,
  };

  const send = (url, givenOptions = {}) => {
    const options = { ...defaultOptions, ...givenOptions };

    updateIsBusy(true);

    updateError(null);

    return http[options.verb](url, options.beforeSubmit(options.data) || {}, options.http || {})
      .then(({ data }) => {
        updateResponse(data);
        updateIsBusy(false);
        if (isFunction(options.onSuccess)) {
          options.onSuccess(data);
        }
        return Promise.resolve(data);
      })
      .catch(responseError => {
        updateIsBusy(false);

        updateError(responseError);

        if (isFunction(options.onError)) {
          options.onError(responseError);
        }
      });
  };

  return {
    error,
    isBusy,
    response,
    send,
  };
};
