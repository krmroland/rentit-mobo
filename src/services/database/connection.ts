import SQLite from 'react-native-sqlite-storage';

let db = SQLite.openDatabase('rentals.db', '1.0', 'Test Database');

export default class Connection {
  insert(query, bindings = []) {
    return this.statement(query, bindings);
  }

  async statement(query, bindings = []) {
    return this.run(query, bindings, () => {
      return db.executeSql(query, bindings);
    });
  }

  async run(query: string, bindings: Array<any>, callback: Function) {
    try {
      return await Promise.resolve(callback(query, bindings));
    } catch (e) {
      throw new Error(`Query exception ${query} : ${e.message}`);
    }
  }

  delete(query, bindings = []) {
    return this.affectingStatement(query, bindings);
  }

  affectingStatement(query, bindings = []) {
    return this.statement(query, bindings).then(results => {
      return results.rows.length || 0;
    });
  }

  async transaction(callback: Function) {
    return db.transaction(tranasction => callback(tranasction));
  }
}
