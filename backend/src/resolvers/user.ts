import { Resolver, Mutation, Arg, Field, Ctx, ObjectType, Query } from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from 'argon2'
// import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME, FORGOT_PASSWORD_PRIFIX, FRONTEND_URL } from '../constants'
import { UsernameEmailPasswordInput } from "./usernameEmailPasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { EmailPasswordInput } from "./EmailPasswordInput";
import { sendEmail } from "../utils/sendEmail";
import {v4} from 'uuid'
import { getConnection } from 'typeorm'

@ObjectType()
class FieldError {
  @Field()
  field: string
  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[]
  @Field(() => User, {nullable: true})
  user?: User
}


@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
    // check newpassword
    if(newPassword.length <= 3) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length of password must be greater than 3'
          }
        ]
      }
    }
    // check token
    const key = FORGOT_PASSWORD_PRIFIX + token
    const userId = await redis.get(key)
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired'
          }
        ]
      }
    }

    // token correct, update user
    const userIdNum = parseInt(userId)
    const user = await User.findOne(userIdNum)
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exists'
          }
        ]
      }
    }

    // user.password = await argon2.hash(newPassword)
    // await em.persistAndFlush(user)
    await User.update({id: userIdNum}, {
      password: await argon2.hash(newPassword)
    })

    // invalidate the change password token, um sicherheit
    await redis.del(key)
    // login user after change password
    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
   const user = await User.findOne( { where: email }) // email not primary key, use where
   if (!user) {
     // the email is not in the database
     return true // do nothing
   }

   const token = v4()

   // reset password muss be in 30 mins completed
   await redis.set(
     FORGOT_PASSWORD_PRIFIX + token,
     user.id, 'ex',
     1000 * 60 * 30
    )

   console.log(`<a href="${FRONTEND_URL}/change-password/${token}">reset password</a>`)

   await sendEmail(
     email,
     "Forgot Password",
     `<a href="${FRONTEND_URL}/change-password/${token}">reset password</a>`
    )
   return true
  }

  @Query(() => User, {nullable: true})
  me(
    @Ctx() { req }: MyContext
  ) {
    // not log in
    if (!req.session.userId) {
      return null
    }

    return User.findOne(req.session.userId)
  }

  // register
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernameEmailPasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // validateRegister
    const errors = validateRegister(options)
    if ( errors ) {
      // if got errs from validateRegister return errs
      return { errors }
    }
    // hash password
    const hashedPassword = await argon2.hash(options.password)
    // const user = em.create(User, { username: options.username, password: hashedPassword })
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values(
          {username: options.username,
          password: hashedPassword,
          email: options.email,}
        )
        .returning('*')
        .execute() // this all stuff equals User.create({}).save()
      user =result.raw[0]
      // console.log('*********************:' + JSON.stringify(result) + '*********************')
      // const result = await (em as EntityManager)
      //   .createQueryBuilder(User)
      //   .getKnexQuery()
      //   .insert({ 
      //     username: options.username,
      //     password: hashedPassword,
      //     email: options.email,
      //     created_at: new Date(),
      //     updated_at: new Date()
      //   })
      //   .returning("*")
      // user = result[0]
      // // await em.persistAndFlush(user)
    } catch(err) {
      console.log('err:' + err)
      if(err.code === '23505') { // duplicate username or email error
        if (err.constraint === 'user_email_unique' || err.detail.includes("email")) { // duplicate email
          return {
            errors: [{
              field: 'email',
              message: 'Email has been already taken'
            }]
          }
        } else if (err.constraint === 'user_username_unique' || err.detail.includes("username")) { // duplicate username
          return {
            errors: [{
              field: 'username',
              message: 'username has been already taken'
            }]
          }
        } else {
          console.log("other register duplicate error")
          return {
            errors: [{
              field: 'username',
              message: 'username or email has been already taken error'
            }]
          }
        }
        
      }
      console.log("message:", err.message)
    }
    // store userid session, set cookir on user, keep them in login
    req.session.userId = user.id
    return { user }
  }

  // loginWithUsername
  @Mutation(() => UserResponse)
  async loginWithUsername(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // check if this username exists
    const user = await User.findOne({ where: {username: options.username}})
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: "username doesn't exist"
        }]
      }
    }
    const valid = await argon2.verify(user.password, options.password)
    // password incorrect
    if (!valid) {
      return {
        errors: [{
          field: 'passwordUser',
          message: "incorrect password"
        }]
      }
    }
    // password correct
    req.session.userId = user.id
    console.log(req)
    return {
      user,
    }
  }

  // loginWithEmail
  @Mutation(() => UserResponse)
  async loginWithEmail(
    @Arg('options') options: EmailPasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // check if this username exists
    const user = await User.findOne( {where: {email: options.email}})
    if (!user) {
      return {
        errors: [{
          field: 'email',
          message: "email doesn't exist"
        }]
      }
    }
    const valid = await argon2.verify(user.password, options.password)
    // password incorrect
    if (!valid) {
      return {
        errors: [{
          field: 'passwordEmail',
          message: "incorrect password"
        }]
      }
    }
    // password correct
    req.session.userId = user.id
    return {
      user,
    }
  }

  // logout
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise(resolve =>
      req.session.destroy(err => { // remove session from redis
        res.clearCookie(COOKIE_NAME) // remove cookie
        if (err) {
          console.log(err)
          resolve(false)
          return
        }
        resolve(true)
      })
    ) 
  }
}