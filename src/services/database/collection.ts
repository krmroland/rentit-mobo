import collect from 'collect.js';
import Document from './document';

export default class DatabaseCollection {
  /**
   * The database results
   * @type {Object}
   */
  protected results;
  /**
   * Creates an instance of this class
   * @param {Object} results
   */
  constructor(results) {
    this.results = results;
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
    return collect(this.results.rows.raw().mapInto(Document));
  }
  /**
   * Returns an instance if the generator class
   **/
  *cursor() {
    for (let i = 0; i < this.totalItems; i++) {
      yield new Document(this.results.rows.item(i));
    }
  }
}
