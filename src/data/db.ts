import { Database } from '@/services/database';

import collections from './collections';

const db = new Database();

// lets define the collections

collections.forEach(definition => {
  db.defineCollection(definition);
});

export default db;
