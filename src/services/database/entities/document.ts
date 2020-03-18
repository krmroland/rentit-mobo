import { get } from 'lodash';

import Entity from './base';

class Document extends Entity {
  /**
   * The casts array
   * @type {Object}
   */
  protected casts = {
    data: 'json',
    createdAt: 'datetime',
    updatedAt: 'datetime',
    syncedAt: 'datetime',
  };

  field(key, defaultValue) {
    return get(this.data, key, defaultValue);
  }
}

export default Document;
