import { get, upperFirst, isNil, isNull, has } from 'lodash';

class Document {
  /**
   * The raw item from the database
   * @type {Object|null}
   */
  protected _raw;
  /**
   * The query collection instance
   * @type {collection}
   */
  protected _collection;
  /**
   * Determines if the document exists in the database
   * @type {Boolean}
   */
  protected _exists = false;
  /**
   * The data object
   * @type {object}
   */
  protected _data: object;
  /**
   * The document id
   * @type {string|key}
   */
  protected id;
  /**
   * Creates an instance of the document class
   * @param {Object} raw
   * @param {collection} collection
   * @param {Boolean} exists
   */
  constructor(raw: object, exists: boolean = false, collection) {
    this._raw = raw;
    this._collection = collection;
    this._exists = exists;

    this._data = JSON.parse(get(raw, 'data', '{}'));

    this.id = get(raw, 'id');
  }

  save() {}
  delete() {}
  update() {}
  get(field, defaultValue) {
    return get(this._data, field, defaultValue);
  }
}

export default Document;
