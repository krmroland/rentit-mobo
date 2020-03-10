import { Model } from '@nozbe/watermelondb';
import { field, json, children } from '@nozbe/watermelondb/decorators';

class Product extends Model {
  static table = 'products';

  static associations = {
    variants: { type: 'has_many', foreignKey: 'product_id' },
  };

  @children('product_variants') variants;

  @field('name') name;
  @field('account_id') accountId;
  @field('currency') currency;
  @json('details') details;
  @field('type') type;
}

export default Product;
