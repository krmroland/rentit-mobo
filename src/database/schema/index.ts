import { appSchema, tableSchema } from '@nozbe/watermelondb';

import tables from './tables';

export default appSchema({
  version: 1,
  tables: Object.keys(tables).map(name => {
    return tableSchema({
      name,
      columns: tables[name].columns,
    });
  }),
});
