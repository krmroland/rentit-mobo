import collect from 'collect.js';

import DB from './db';

import Client from './client';

const client = new Client();

const database = new DB(client);

export default database;
