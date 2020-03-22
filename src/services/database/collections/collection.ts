import { Subject } from 'rxjs';
import { CollectionDefinition } from './types';
import { v4 as uuidv4 } from 'uuid';
import QueryResult from './queryResult';
import DatabaseDocument from './document';

class Collection {
  /**
   * The database instance
   * @type {[type]}
   */
  protected database;
  /**
   * The collection definition
   * @type {CollectionDefinition}
   */
  protected definition;
  /**
   * The validation rules
   * @type {Rules}
   */
  protected rules;
  /**
   * Determines if we should load items lazilu
   * @type {Boolean}
   */
  public isLazy = false;
  /**
   * The insertion subject
   * @type {Subject}
   */
  protected $insertSubjet;
  /**
   * Creates an instance of a collection
   * @param {CollectionDefinition} definition
   * @param {[type]}               database    [description]
   */

  constructor(definition: CollectionDefinition, database) {
    this.database = database;
    this.definition = definition;
    this.$insertSubjet = new Subject();
  }

  get query() {
    return this.database
      .query()
      .from(this._tableName)
      .where('collection', this.definition.name)
      .resultsHandler(result => new QueryResult(result, this));
  }

  insert(data) {
    const { accountId, ...otherFields } = data;

    if (!accountId) {
      throw Error('missing accountId');
    }

    // validate the data
    // insert the data
    const item = {
      id: new Date().toISOString(),
      collection: this.definition.name,
      data: JSON.stringify(otherFields),
      accountId,
    };

    return this.query.insert(item).then(() => {
      // first I will covert the data to a document here
      let document = new DatabaseDocument(item, true, this);

      this.$insertSubjet.next(document);

      return Promise.resolve(document);
    });
  }

  get(...args) {
    return this.query.get(...args);
  }

  get insert$() {
    return this.$insertSubjet.asObservable();
  }

  get _tableName() {
    return this.definition.table || 'documents';
  }

  newDocument(item) {
    return new DatabaseDocument(item, false, this);
  }
  get fields() {
    return this.definition.fields || [];
  }

  get$() {}
}

export default Collection;
