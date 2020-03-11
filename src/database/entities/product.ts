import { Model } from '@nozbe/watermelondb';
import { field, json, children, readonly, date } from '@nozbe/watermelondb/decorators';

export default class Product extends Model {
  static table = 'products';

  static associations = {
    variants: { type: 'has_many', foreignKey: 'product_id' },
  };

  @children('product_variants') variants;

  @field('name') name;
  @field('account_id') accountId;
  @field('user_id') userId;
  @field('currency') currency;
  @field('type') type;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
}
