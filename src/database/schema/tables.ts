import { timestamps } from './utils';

export default {
  products: {
    columns: [
      { name: 'name', type: 'string' },
      { name: 'account_id', type: 'number' },
      { name: 'user_id', type: 'number' },
      { name: 'currency', type: 'string' },
      { name: 'details', type: 'string' },
      { name: 'total_dues', type: 'string' },
      { name: 'type', type: 'string' },
      ...timestamps(),
    ],
  },
  tenants: {
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
  },
  product_variants: {
    columns: [
      { name: 'product_id', isIndexed: true, type: 'number' },
      { name: 'identifier', type: 'string', isIndexed: true }, // eg number plate for cars,
      { name: 'image_path', type: 'string', isOptional: true },
      { name: 'current_tenant_id', type: 'number', isOptional: true },
      ...timestamps(),
    ],
  },
};
