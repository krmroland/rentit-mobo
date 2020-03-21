import { CollectionType } from '@/services/database/collections';

const ProductCollection: CollectionType = {
  name: 'products',
  fields: {
    name: { rules: ['required'], default: 'House' },
    currency: { rules: ['required'], default: 'House' },
    type: { rules: ['required'], default: 'House' },
  },

  methods: {},
};

export default ProductCollection;
