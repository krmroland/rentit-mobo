import { CollectionType } from '@/services/database/collections';

const TenantsCollection: CollectionType = {
  name: 'tenants',
  fields: {
    first_name: { rules: ['nullable'] },
    last_name: { rules: ['nullable'] },
    email: { rules: ['nullable|email'] },
    phone_number: { rules: ['nullable'] },
  },

  methods: {},
};

export default TenantsCollection;
