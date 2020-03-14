import collect from 'collect.js';

class Migrate {
  protected builder: any;

  constructor(builder) {
    this.builder = builder;
  }

  latest() {
    // we will collect all migrations files
    // we will get all existing migrations
    // we will drop the ones that we have already run

    this.getUnmigratedMigrations()
      .then(migrations => {
        this.latestBatchNumber().then(batch => {
          const nextBatch = batch + 1;
          // run in transaction
          // Call the up method
          collect(migrations).each(migration => {
            // up it
            Promise.resolve(migration.up(this.builder.schema)).then(() => {
              console.log('here', migration.name);
              this.builder.table('migrations').insert({
                name: migration.name,
                batch: nextBatch,
                time: this.builder.raw('NOW()'),
              });
            });
          });
        });
      })
      .catch(error => {
        console.log({ error });
      });
  }

  protected createMigrationTable(tableName, schemaName, trxOrKnex) {
    return this.builder.schema.createTable('migrations', function(table) {
      table.increments();
      table.string('name');
      table.integer('batch');
      table.timestamp('migration_time');
    });
  }

  protected ensureTableExists() {
    return this.builder.schema.hasTable('migrations').then(exists => {
      if (!exists) {
        return this.createMigrationTable().then(Promise.resolve({ created: true }));
      }
      return Promise.resolve({ created: false });
    });
  }

  protected getExistingMigrations() {
    return this.ensureTableExists().then(({ created }) => {
      // if a new table has just been created
      // we will return right away since there
      // wont be any tables
      if (created) {
        return Promise.resolve([]);
      }
      return this.builder
        .from('migrations')
        .select('name')
        .orderBy('id')
        .then(existingMigrations => {
          return Promise.resolve(collect(existingMigrations).pluck('name'));
        });
    });
  }
  protected getUnmigratedMigrations() {
    return import('@/database/migrations').then(({ default: allMigrations }) => {
      return this.getExistingMigrations().then(existingMigrations => {
        const names = existingMigrations.flip();
        return collect(allMigrations)
          .filter(migrationClass => !names.has(migrationClass.name))
          .map(migrationClass => new migrationClass())
          .pipe(Promise.resolve);
      });
    });
  }

  // Returns the latest batch number.
  protected latestBatchNumber() {
    return this.builder
      .from('migrations')
      .max('batch as max_batch')
      .then(result => {
        return Promise.resolve(result[0].max_batch || 0);
      });
  }
}

export default Migrate;
