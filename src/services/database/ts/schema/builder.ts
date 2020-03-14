import { each, toArray } from 'lodash';

class SchemaBuilder {
  public client;
  public sequence = [];
  public schema;
  constructor(client) {
    this.client = client;
  }
  withSchema(schemaName) {
    this.schema = schemaName;
    return this;
  }
  toSQL() {
    return this.client.schemaCompiler(this).toSQL();
  }
  then(...parameters) {
    let result = this.client.runner(this).run();

    return result.then.apply(result, parameters);
  }

  getConnection() {
    return null;
  }
}

each(
  [
    'createTable',
    'createTableIfNotExists',
    'createSchema',
    'createSchemaIfNotExists',
    'dropSchema',
    'dropSchemaIfExists',
    'createExtension',
    'createExtensionIfNotExists',
    'dropExtension',
    'dropExtensionIfExists',
    'table',
    'alterTable',
    'hasTable',
    'hasColumn',
    'dropTable',
    'renameTable',
    'dropTableIfExists',
    'raw',
  ],
  function(method) {
    SchemaBuilder.prototype[method] = function(...parameters) {
      if (method === 'table') {
        method = 'alterTable';
      }

      this.sequence.push({
        method,
        args: toArray(...parameters),
      });
      return this;
    };
  },
);

export default SchemaBuilder;
