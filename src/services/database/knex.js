const Client = require("./client");

const makeKnex = require("./util/make-knex");

function Knex(config) {
  return makeKnex(new Client(config));
}

Knex.Client = Client;

export default Knex;
