import { schemaMigrations, createTable } from '@nozbe/watermelondb/Schema/migrations';

import { timestamps } from './utils';

const cerateProductsTable = createTable({
  name: 'products',
  columns: [
    { name: 'project_id', type: 'number', isOptional: true },
    { name: 'name', type: 'string' },
    { name: 'account_id', type: 'string' },
    { name: 'currency', type: 'string' },
    { name: 'details', type: 'string' },
    { name: 'total_dues', type: 'string' },
    { name: 'type', type: 'string' },
    ...timestamps(),
  ],
});

const createTenantsTable = createTable({
  name: 'tenants',
  columns: [
    { name: 'account_id', isIndexed: true, type: 'number' },
    { name: 'first_name', type: 'string' },
    { name: 'last_name', type: 'string' },
    { name: 'phone_number', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'total_dues', type: 'number' },
    { name: 'current_product_variant_id', type: 'number', isOptional: true },
    ...timestamps(),
  ],
});

const createProductVariants = createTable({
  name: 'product_variants',
  columns: [
    { name: 'product_id', isIndexed: true, type: 'number' },
    { name: 'identifier', type: 'string', isIndexed: true }, // eg number plate for cars,
    { name: 'image_path', type: 'string', isOptional: true },
    { name: 'current_tenant_id', type: 'number', isOptional: true },
    ...timestamps(),
  ],
});

export default {
  toVersion: 2,
  steps: [cerateProductsTable, createTenantsTable, createProductVariants],
};
