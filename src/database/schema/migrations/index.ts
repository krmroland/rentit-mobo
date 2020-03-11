import { schemaMigrations, createTable } from '@nozbe/watermelondb/Schema/migrations';

import v1 from './v1';

export default schemaMigrations({
  migrations: [v1],
});
