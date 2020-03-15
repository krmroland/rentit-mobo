export default class Collection {
  /**
   * The collection name
   * @type {string}
   */
  protected name: string;
  /**
   * The current databsae context
   * @type {Dabatabase}
   */
  protected database;
  /**
   * The relations array
   * @type {Array<any>}
   */
  protected relations: Array<any> = [];
  /**
   * Creates an instance of the class
   * @param {[type]} database
   * @param {[type]} name
   */
  constructor(name, database) {
    this.name = name;
    this.database = database;
  }

  insert(data) {
    // first we will append data to the item
    return this.database.insert(this.name, data);
  }
  paginate(currentPage) {}
  get() {}
}
