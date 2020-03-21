import collect from 'collect.js';
import Document from './document';

class QueryResult {
  /**
   * The database results
   * @type {Object}
   */
  protected results;
  /**
   * The parent collection
   * @type {[type]}
   */
  public collection;

  constructor(results, collection) {
    this.results = results;
    this.collection = collection;
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
    return this.rows.raw().map(item => this.createDocument(item));
  }
  /**
   * Returns an instance if the generator class
   **/
  *cursor() {
    for (let i = 0; i < this.totalItems; i++) {
      yield this.rows.item(i);
    }
  }

  get rows() {
    return this.results.rows;
  }
  getItemFromIndex(index) {
    return this.createDocument(this.rows.item(index));
  }

  getRaw() {
    return this.results;
  }

  createDocument(item) {
    if (item) {
      return new Document(item, true, this.collection);
    }
  }
}

export default QueryResult;
