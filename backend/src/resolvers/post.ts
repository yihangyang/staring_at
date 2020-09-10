import { Resolver, Query, Arg, Mutation, InputType, Field, Ctx, UseMiddleware, Int } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
// import { MyContext } from "../types";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  // find all posts
  @Query(() => [Post]) // setting graphql type
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, {nullable: true}) cursor: string | null
  ): Promise<Post[]> { // setting typescript type
    const realLimt = Math.min(limit, 50)
    const qb = getConnection()
    .getRepository(Post)
    .createQueryBuilder("p")
    .orderBy('"createdAt"', 'DESC')
    .take(realLimt)

    if (cursor) {
      qb.where('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor))
      })
    }
    return qb.getMany()
  }

  // find one post
  @Query(() => Post, {nullable: true}) // setting graphql type
  post(
    @Arg('id') id: number,
    // @Ctx() ctx: MyContext
  ): Promise<Post | undefined> { // setting typescript type
    // return ctx.em.findOne(Post, {id}) // where: id
    return Post.findOne(id)
  }

  // create one post
  @Mutation(() => Post) // setting graphql type
  @UseMiddleware(isAuth) // if use hasnt login, they cannot post anything
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> { // setting typescript type
    return Post.create({
      ...input,
      creatorId: req.session.userId
    }).save()
  }

  // update one post
  @Mutation(() => Post, {nullable: true}) // setting graphql type
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, {nullable: true}) title: string,
    // @Ctx() { em }: MyContext
  ): Promise<Post | null> { // setting typescript type
    // const post = await em.findOne(Post, { id })
    const post = await Post.findOne({where: { id }})
    if(!post){
      return null
    }
    if (typeof title !== 'undefined') {
      post.title = title
      // await em.persistAndFlush(post)
      await Post.update({id}, {title})
    }
    return post
  }

  // delete one post
  @Mutation(() => Boolean) // setting graphql type
  async deletePost(
    @Arg('id') id: number,
    // @Ctx() { em }: MyContext
  ): Promise<Boolean> { // setting typescript type
    // await em.nativeDelete(Post, { id });
    await Post.delete(id)
    return true
  }
}