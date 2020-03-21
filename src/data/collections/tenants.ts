import { CollectionType } from '@/services/database/collections';

export default {
  name: 'tenants',
  fields: [
    { name: ' first_name', rules: ['nullable'] },
    { name: 'last_name', rules: ['nullable'] },
    { name: 'email', rules: ['nullable|email'] },
    { name: 'phone_number', rules: ['nullable'] },
  ],

  methods: {},
} as CollectionType;
