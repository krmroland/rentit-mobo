import { createConnection, getConnectionManager } from 'typeorm/browser';

import entities from './entities';

const manager = getConnectionManager();

const resolveConnection = () => {
  if (manager.has('default')) {
    return manager.get('default');
  }

  return createConnection({
    type: 'react-native',
    database: 'rentit.db',
    location: 'default',
    logging: ['error', 'query', 'schema'],
    synchronize: true,
    cache: true,
    entities,
  });
};

export default resolveConnection();
