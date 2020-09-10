import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { OneToMany } from "@mikro-orm/core";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;


  @Field()
  @Column({ unique: true})
  username!: string;

  @Field()
  @Column({ unique: true})
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Post, post => post.creator)
  posts: Post[]
  
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}

// import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
// import { ObjectType, Field, Int } from "type-graphql";

// @ObjectType()
// @Entity()
// export class User {
//   @Field(() => Int)
//   @PrimaryKey()
//   id!: number;

//   @Field(() => String)
//   @Property({ type: 'date' })
//   createdAt = new Date();

//   @Field(() => String)
//   @Property({ type: 'date', onUpdate: () => new Date() })
//   updatedAt = new Date();

//   @Field()
//   @Property({ type: 'text', unique: true})
//   username!: string;

//   @Field()
//   @Property({ type: 'text', unique: true})
//   email!: string;

//   @Property({ type: 'text' })
//   password!: string;
// }