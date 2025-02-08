import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

class CustomFields {
  @Column()
  industry: string;

  @Column()
  size: string;
}

class Config {
  @Column()
  theme: string;

  @Column("simple-array")
  modules: string[];

  @Column(type => CustomFields)
  customFields: CustomFields;
}

@Entity('tenants')
export class Tenant {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  status: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column(type => Config)
  config: Config;

  @Column()
  name: string;

  @Column()
  subdomain: string;

  @Column()
  contactEmail: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
