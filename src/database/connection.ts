import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import migrations from './migrations';

import Entities from './entities';

import schema from './schema';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
});

const database = new Database({
  adapter,
  modelClasses: Entities,
  actionsEnabled: true,
});

export default database;
