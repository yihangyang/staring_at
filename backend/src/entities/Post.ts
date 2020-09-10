import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { ManyToOne } from "@mikro-orm/core";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity{
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number
  
  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "integer", default: 0})
  points!: number;
  
  @Field()
  @Column()
  creatorId: number

  @ManyToOne(() => User, (user) => user.posts)
  creator: User
  
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}


// mikro-orm way
// import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
// import { ObjectType, Field, Int } from "type-graphql";

// @ObjectType()
// @Entity()
// export class Post {
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
//   @Property({type: 'text'})
//   title!: string;
// }