## setup
###### use typescript
yarn add -D @types/node typescript 

###### start app in typescript-node

yarn add -D ts-node

###### config ts

npx tsconfig.json

###### install mikro-orm
yarn add @mikro-orm/cli @mikro-orm/core @mikro-orm/migrations @mikro-orm/postgresql pg

## postgresql

###### build database connetion
postgresql:CREATE DATABASE exampledb
cmd:npx mikro-orm migration:create

## server-express

yarn add express apollo-server-express graphql type-graphql

###### express in typescript
yarn add -D @types/express

###### 
yarn add reflect-metadata

###### redis
yarn add redis connect-redis express-session
yarn add -D @types/redis @types/connect-redis @types/express-session


## frontend -next
yarn create next-app --example with-chakra-ui appname

###### frotend enable typescript
frontend: yarn add --dev typescript @types/node
frontend: yarn add formik

frontend: yarn add urql graphql

## solve CORS problems
backend: yarn add cors
backend: yarn add -D @types/cors

## GraphQL Code Generator
frontend: yarn add -D @graphql-codegen/cli

###### init wizard to automate generate the generated/graphql.tsx
frontend: yarn graphql-codegen init

frontend: yarn add -D @graphql-codegen/typescript-urql
## login cache refresh
frontend: yarn add @urql/exchange-graphcache

## Next.js URQL SSR
frontend: yarn add next-urql react-is isomorphic-unfetch

## email sender
backend: yarn add nodemailer
backend: yarn add -D @types/nodemailer

## restucture user from username/password to username/email/password
evertime change the datastructure
backend: yarn create:migration (to data structure)
frontend: yarn gen (for graphql to generated)

## ramdom number as token ( to send token to email in order to reset password)
backend: yarn add uuid ioredis
backend: yarn add -D @types/uuid @types/ioredis

## use ioredis instead of redis
backend: yarn remove redis

## switching to TypeORM
backned: yarn add typeorm

###
backend: npx typeorm migration:create -n FakePosts
