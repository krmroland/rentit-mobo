import collect from 'collect.js';

import Document from './document';

export default class DatabaseCollection {
  protected builder;

  /**
   * The database results
   * @type {Object}
   */
  protected results;
  /**
   * Creates an instance of this class
   * @param {Object} results
   */
  constructor(results, builder) {
    this.results = results;
    this.builder = builder;
  }
  /**
   * Gets the total number of items
   */
  get totalItems() {
    return this.results.rows.length;
  }
  /**
   * Hydrates all the items
   */
  items() {
    return collect(this.results.rows.raw()).map(item => this.createEntity(item));
  }
  /**
   * Returns an instance if the generator class
   **/
  *cursor() {
    for (let i = 0; i < this.totalItems; i++) {
      yield this.createEntity(this.results.rows.item(i));
    }
  }
  protected createEntity(item) {
    return new Document(item, this.builder);
  }
}
