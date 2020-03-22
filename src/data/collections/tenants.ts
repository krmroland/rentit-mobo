import { CollectionType } from '@/services/database/collections';

export default {
  name: 'tenants',
  fields: [
    { name: 'first_name', rules: ['required'] },
    { name: 'last_name', rules: ['required'] },
    { name: 'email', rules: ['email'] },
    { name: 'phone_number' },
  ],

  methods: {},
} as CollectionType;
