import { get, upperFirst, isNil, isNull, has } from 'lodash';

class Document {
  /**
   * The casts array
   * @type {Object}
   */
  protected casts = {
    data: 'json',
    createdAt: 'dateTime',
    updatedAt: 'dateTime',
    syncedAt: 'dateTime',
  };

  public data: object;

  protected item;

  protected builder;

  constructor(item, builder) {
    this.item = item;

    this.builder = builder;

    Object.keys(item).forEach(key => {
      this.setAttribute(key, item[key]);
    });
  }

  save() {}

  update() {}

  setAttribute(key: string, value: string) {
    // if we have a known cast for the given key
    // we will go ahead an cast it before setting it

    if (has(this.casts, key)) {
      this[key] = this.castAttribute(this.casts[key], key, value);
    } else {
      this[key] = value;
    }
  }

  castAttribute(type, key, value) {
    const method = `cast${upperFirst(type)}`;

    if (!this[method]) {
      throw new Error(`Cast method ${method} doesnot exist`);
    }

    if (isNil(value) || isNull(value)) {
      return value;
    }

    return this[method](value, key);
  }

  castJson(value, key) {
    return JSON.parse(value);
  }
  castDateTime(value) {
    return Date.parse(value);
  }
  field(key, defaultValue) {
    return get(this.data, key, defaultValue);
  }
}

export default Document;
