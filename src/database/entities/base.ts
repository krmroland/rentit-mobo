import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
  Column,
  BeforeUpdate,
  BaseEntity,
} from 'typeorm/browser';

export default abstract class Base extends BaseEntity {
  public _isSyncing: boolean = false;

  @PrimaryGeneratedColumn('uuid')
  local_id: string;

  @CreateDateColumn()
  localCreatedAt: string;

  @UpdateDateColumn({ nullable: true })
  updatedAt: string;

  @VersionColumn({ nullable: true })
  _schemaVersion: number;

  @Column('simple-json', { nullable: true, select: false })
  _changes: object; //local changes

  @Column('datetime', { nullable: true })
  _serverCreatedAt: string;

  @BeforeUpdate()
  updateDates() {
    // we need to track the local changes
    console.log('changing');
  }
}
