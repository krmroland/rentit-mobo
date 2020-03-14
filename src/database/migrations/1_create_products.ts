export default class CreateProductsTable {
  up(schema) {
    return schema.createTable('test_migrations', table => {
      table.increments();
      table.string('name');
      table.timestamps();
    });
  }
}
