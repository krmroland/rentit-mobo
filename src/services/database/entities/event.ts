import { get } from 'lodash';

import Entity from './base';

class Event extends Entity {
  /**
   * The casts array
   * @type {Object}
   */
  protected casts = {
    payload: 'json',
    createdAt: 'datetime',
  };
}

export default Document;
