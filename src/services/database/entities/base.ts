import { get, upperFirst, isNil, isNull } from 'lodash';

abstract class Entity {
  protected item;

  protected casts: object = {};

  constructor(item) {
    this.item = item;

    Object.keys(item).forEach(key => {
      this.setAttribute(key, item[key]);
    });
  }

  save() {}

  update() {}

  setAttribute(key: string, value: string) {
    // if we have a known cast for the given key
    // we will go ahead an cast it before setting it
    if (this.casts[key]) {
      this[key] = this.castAttribute(this.casts[key], key, value);
    } else {
      this[key] = value;
    }
  }

  castAttribute(type, key, value) {
    const method = `cast${upperFirst(key)}`;

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
}

export default Entity;
