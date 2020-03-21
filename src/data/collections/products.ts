import { CollectionType } from '@/services/database/collections';

export default {
  name: 'products',
  fields: [
    { name: 'name', rules: ['required'] },
    { name: 'currency', rules: ['required'], defaultValue: 'UGX', options: ['UGX', 'USD'] },
    {
      name: 'type',
      rules: ['required'],
      defaultValue: 'House',
      options: ['House', 'Car', 'Plants'],
    },
  ],

  methods: {},
} as CollectionType;
