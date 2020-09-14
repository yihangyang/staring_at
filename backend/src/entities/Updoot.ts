import { Entity, BaseEntity, PrimaryColumn, Column } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { ManyToOne } from "@mikro-orm/core";
import { User } from "./User";
import { Post } from "./Post";

// m to n relation =>  user => posts (servarl user can upvote same post, user can upvote many posts)
// user => updoot <= posts

@ObjectType()
@Entity()
export class Updoot extends BaseEntity{
  @Field()
  @Column({type: 'int'})
  value: number

  @Field(() => Int)
  @PrimaryColumn()
  userId!: number

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.updoots)
  user: User

  @Field(() => Int)
  @PrimaryColumn()
  postId!: number

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.updoots)
  post: Post
}