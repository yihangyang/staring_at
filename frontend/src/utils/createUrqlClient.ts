import { dedupExchange, fetchExchange } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginWithEmailDocument, LoginWithUsernameDocument, RegisterMutation, LoginWithEmailMutation, LoginWithUsernameMutation } from "../generated/graphql";
import { cacheExchange } from '@urql/exchange-graphcache'
import { advancedUpdateQuery } from "./advancedUpdateQuery";
import Router from 'next/router'

// global errors
import { pipe, tap } from 'wonka'
import { Exchange } from 'urql'



const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: "include" as const
  },
  // update cache
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        logout: (_result, args, cache, info) => {
          advancedUpdateQuery<LogoutMutation, MeQuery>(
            cache,
            {query: MeDocument},
            _result,
            () => ({ me:null })
          )
        },
        loginWithEmail: (_result, args, cache, info) => {
          advancedUpdateQuery<LoginWithEmailMutation, MeQuery>(
            cache,
            {query: MeDocument},
            _result,
            (result, query) => {
              if (result.loginWithEmail.errors) {
                return query
              } else {
                return {
                  me: result.loginWithEmail.user
                }
              }
            }
          )
        },
        loginWithUsername: (_result, args, cache, info) => {
          advancedUpdateQuery<LoginWithUsernameMutation, MeQuery>(
            cache,
            {query: MeDocument},
            _result,
            (result, query) => {
              if (result.loginWithUsername.errors) {
                return query
              } else {
                return {
                  me: result.loginWithUsername.user
                }
              }
            }
          )
        },
        register: (_result, args, cache, info) => {
          advancedUpdateQuery<RegisterMutation, MeQuery>(
            cache,
            {query: MeDocument},
            _result,
            (result, query) => {
              if (result.register.errors) {
                return query
              } else {
                return {
                  me: result.register.user
                }
              }
            }
          )
        },
      }
    }
  }),
  errorExchange,
  ssrExchange,
  fetchExchange]
})