import { Resolver, Query, Arg, Mutation, InputType, Field, Ctx, UseMiddleware, Int, FieldResolver, Root, ObjectType } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
// import { MyContext } from "../types";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[]
  @Field()
  hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String) 
  textSnippet(
    @Root() root: Post
  ){
    return root.text.slice(0, 100)
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1
    const realValue = isUpdoot ? 1 : -1
    const {userId} = req.session

    const updoot = await Updoot.findOne({where: {postId, userId}})
    if (updoot && updoot.value !== realValue) { // user has voted on post before and are changing vote
      await getConnection().transaction(async tm => {
        await tm.query(`
          update updoot
          set value = $1
          where "postId" =$2 and "userId" = $3
        `, [realValue, postId, userId])

        await tm.query(`
          update post
          set points = points + $1
          where id = $2;
        `, [2 * realValue, postId])
      })
    } else if (!updoot) { // has never voted before
      await getConnection().transaction(async tm => {
        await tm.query(`
          insert into updoot ("userId", "postId", value )
          values ($1, $2, $3);
        `, [userId, postId, realValue])

        await tm.query(`
          update post
          set points = points + $1
          where id = $2;
        `, [realValue, postId])
      })
    }

    // await Updoot.insert({
    //   userId,
    //   postId,
    //   value: realValue
    // })
    return true
  }

  // find all posts
  @Query(() => PaginatedPosts) // setting graphql type
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, {nullable: true}) cursor: string | null,
    @Ctx() {req}: MyContext
  ): Promise<PaginatedPosts> { // setting typescript type
    // to check wether the next post exists, ensure that if no more pagination
    const realLimit = Math.min(limit, 50)
    const realLimitPlusOne = Math.min(limit, 50) + 1

    const replacement: any = [realLimitPlusOne, ]

    if(req.session.userId) {
      replacement.push(req.session.userId)
    }
    let cursorIdx = 3
    if(cursor) {
      replacement.push(new Date(parseInt(cursor)))
      cursorIdx = replacement.length //  2 items in the list => 2, 3 items in list => 3
    }
    const posts =  await getConnection().query(`
      select p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
      ) creator,
      ${
        req.session.userId
          ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
          : 'null as "voteStatus"'
      }
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $${cursorIdx}`: "" }
      order by p."createdAt" DESC
      limit $1
    `, replacement)

    // const qb = getConnection()
    // .getRepository(Post)
    // .createQueryBuilder("p")
    // .innerJoinAndSelect(
    //   "p.creator",
    //   "u",
    //   'u.id = p."creatorId"'
    // )
    // .orderBy('p."createdAt"', 'DESC')
    // .take(realLimitPlusOne)

    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor))
    //   })
    // }

    // const posts = await qb.getMany()

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne
    }
  }

  // find one post
  @Query(() => Post, {nullable: true}) // setting graphql type
  post(
    @Arg('id', () => Int) id: number,
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