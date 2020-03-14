import { assign, isUndefined, some } from 'lodash';
import BaseCompiler from './baseCompiler';

function buildTable(type) {
  return function(tableName, fn) {
    const builder = this.client.tableBuilder(type, tableName, fn);

    // pass queryContext down to tableBuilder but do not overwrite it if already set
    const queryContext = this.builder.queryContext();
    if (!isUndefined(queryContext) && isUndefined(builder.queryContext())) {
      builder.queryContext(queryContext);
    }

    builder.setSchema(this.schema);
    const sql = builder.toSQL();

    for (let i = 0, l = sql.length; i < l; i++) {
      this.sequence.push(sql[i]);
    }
  };
}

function prefixedTableName(prefix, table) {
  return prefix ? `${prefix}.${table}` : table;
}

class SchemaCompiler extends BaseCompiler {
  public dropTablePrefix = 'drop table ';
  createTableIfNotExists() {
    return buildTable('createIfNot');
  }
  createTable() {
    return buildTable('create');
  }
  alterTable() {
    return buildTable('alter');
  }
  dropTable(tableName) {
    this.pushQuery(
      this.dropTablePrefix + this.formatter.wrap(prefixedTableName(this.schema, tableName)),
    );
  }

  dropTableIfExists(tableName) {
    this.pushQuery(
      this.dropTablePrefix +
        'if exists ' +
        this.formatter.wrap(prefixedTableName(this.schema, tableName)),
    );
  }
  raw(sql, bindings) {
    this.sequence.push(this.client.raw(sql, bindings).toSQL());
  }
  toSQL() {
    const sequence = this.builder.sequence;
    for (let i = 0, l = sequence.length; i < l; i++) {
      const query = sequence[i];
      this[query.method].apply(this, query.args);
    }
    return this.sequence;
  }
  hasTable(tableName) {
    const sql =
      'select * from sqlite_master ' +
      `where type = 'table' and name = ${this.formatter.parameter(tableName)}`;

    this.pushQuery({ sql, output: resp => resp.length > 0 });
  }
  // Compile the query to determine if a column exists.
  hasColumn(tableName, column) {
    this.pushQuery({
      sql: `PRAGMA table_info(${this.formatter.wrap(tableName)})`,
      output(resp) {
        return some(resp, col => {
          return this.client.wrapIdentifier(col.name) === this.client.wrapIdentifier(column);
        });
      },
    });
  }

  // Compile a rename table command.
  renameTable(from, to) {
    this.pushQuery(`alter table ${this.formatter.wrap(from)} rename to ${this.formatter.wrap(to)}`);
  }
}

export default SchemaCompiler;
