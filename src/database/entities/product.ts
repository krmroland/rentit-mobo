import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm/browser';

import BaseEntity from './base';

@Entity('product')
export default class Product extends BaseEntity {
  @Column('varchar')
  name: string;

  @Column('varchar')
  type: string;

  @Column('varchar')
  currency: string;

  @Column('bigint')
  accountId: number;

  @Column('bigint')
  userId: number;
}
