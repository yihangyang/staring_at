import 'reflect-metadata'
// import { MikroORM } from '@mikro-orm/core'
import { __prod__, COOKIE_NAME } from './constants'
// import mikroConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import Redis from 'ioredis' // redis
import session from 'express-session' // redis
import connectRedis from 'connect-redis' // redis
import cors from 'cors' //cors
import { createConnection } from 'typeorm'
import { User } from './entities/User'
import { Post } from './entities/Post'
import path from 'path'

const main = async () => {
  // database switch to typeorm
  const conn = await createConnection({
    type: 'postgres',
    database: 'staring_at',
    username:'test',
    password:'test',
    logging: true,
    synchronize: true, // true is automatically create table dont need run migration anymore
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post]
  })
  await conn.runMigrations() // run the migrations we have that havnt not benn run
  // await Post.delete({}) // clear *** database

  // // database with mikroorm
  // const orm = await MikroORM.init(mikroConfig)
  // // await orm.em.nativeDelete(User, {})  // when wanna rebuild table, uncomment this to clear a table
  // // run migrations
  // await orm.getMigrator().up()

  // server
  const app = express();
  // redis
  const ReditStore = connectRedis(session)
  const redis = new Redis()
  // cors
  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }))
  // session
  app.use(
    session({
      name: COOKIE_NAME,
      store: new ReditStore({
        client: redis,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 30, // 30 mins
        httpOnly: true,
        sameSite: "lax", // protecting csrf
        secure: __prod__ // cookie only work in https(production)
      },
      saveUninitialized: false,
      secret: "ascnfdjvhdlvhl",
      resave: false
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    // context: ({ req, res }) => ({ em: orm.em, req, res, redis })
    context: ({ req, res }) => ({ req, res, redis })
  })

  apolloServer.applyMiddleware({
    app,
    cors: false
  })
  app.listen(4000, () => {
    console.log("server started on localhost:4000")
  } )
  
}

main().catch(err => {
  console.error(err)
})