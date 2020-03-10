import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

class Product extends Model {
  static table = 'products';

  static associations = {
    variants: { type: 'has_many', foreignKey: 'product_id' },
  };

  @field('name') name;
}

export default Product;
