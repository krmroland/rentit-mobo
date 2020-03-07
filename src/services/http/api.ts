import axios from 'axios';

import combineURLs from 'axios/lib/helpers/combineURLs';
import buildURL from 'axios/lib/helpers/buildURL';

export const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const makeApiUrl = (path, params) => {
  return buildURL(combineURLs(API_URL, path), params);
};

export default api;
