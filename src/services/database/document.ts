import { get } from 'lodash';

import Database from './database';

class Document {
  protected item;

  constructor(item) {
    this.item = item;

    Object.keys(item).forEach(key => {
      this[key] = item[key];
    });
  }

  save() {}

  update() {}

  field(key, defaultValue) {
    return get(this.item, defaultValue);
  }
  dataField(key, defaultValue) {
    return this.field(['data', key], defaultValue);
  }
}

export default Document;
