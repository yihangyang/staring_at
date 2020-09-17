import { dedupExchange, fetchExchange, stringifyVariables } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginWithEmailDocument, LoginWithUsernameDocument, RegisterMutation, LoginWithEmailMutation, LoginWithUsernameMutation, VoteMutationVariables, DeletePostMutationVariables } from "../generated/graphql";
import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache'
import { advancedUpdateQuery } from "./advancedUpdateQuery";
import Router from 'next/router'
import gql from 'graphql-tag'

// global errors
import { pipe, tap } from 'wonka'
import { Exchange } from 'urql'
import { isServer } from "./isServer";



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

export const cursorPagination = (): Resolver => {

  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    // console.log("entityKey => ", entityKey, "fieldName => ", fieldName)
    const allFields = cache.inspectFields(entityKey);
    // console.log("allFields:", allFields)
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const isItInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    )
    info.partial = !isItInTheCache // if not in the cache, then partial return 
    // console.log("partial:", info.partial)
    let hasMore = true
    const results: string[] = []
    fieldInfos.forEach( fi => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string
      const data = cache.resolve(key, 'posts') as string[]
      const _hasMore = cache.resolve(key, 'hasMore')
      if (!_hasMore) {
        hasMore = _hasMore as boolean
      }
      // console.log("data: ", data)
      results.push(...data)
    })
    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results
    }

    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolveFieldByKey(entityKey, fieldKey) as string[];
    //   const currentOffset = args[cursorArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== 'number'
    //   ) {
    //     continue;
    //   }

    //   if (!prevOffset || currentOffset > prevOffset) {
    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       result.push(link);
    //       visited.add(link);
    //     }
    //   } else {
    //     const tempResult: NullArray<string> = [];
    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       tempResult.push(link);
    //       visited.add(link);
    //     }
    //     result = [...tempResult, ...result];
    //   }
    
    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
  };
};
function invalidateAllPosts(cache: Cache) {
  const allFields = cache.inspectFields('Query')
  const fieldInfos = allFields.filter((info) => info.fieldName === 'posts')
  fieldInfos.forEach((fi) => {
    cache.invalidate("Query", 'posts', fi.arguments || {})
  })
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = ''
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie
  }
  return{
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? {
        cookie,
      } : undefined
    },
    // update cache
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null
        },
        resolvers: {
          Query: {
            posts: cursorPagination()
          }
        },
        updates: {
          Mutation: {
            deletePost: (_result, args, cache, info) => {
              cache.invalidate({
                __typename: "Post", id: (args as DeletePostMutationVariables).id 
              })
            },
            vote: (_result, args, cache, info) => {
              const {postId, value} = args as VoteMutationVariables
              const data = cache.readFragment(
                gql`
                  fragment __ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId } as any
              )
              if (data) {
                // if voteStatus is one, which means i have upvoted, then i don do anything
                if (data.voteStatus === value) {
                  return
                }
                const newPoints = (data.points as number) + ((!data.voteStatus ? 1 : 2) * value)
                cache.writeFragment(
                  gql`
                  fragment _ on Post {
                    points
                    voteStatus
                  }
                  `,
                  { id: postId, points: newPoints, voteStatus: value } as any
                )
              }
            },
            createPost: (_result, args, cache, info) => {
              invalidateAllPosts(cache)
            },
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
              invalidateAllPosts(cache)
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
              invalidateAllPosts(cache)
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
      fetchExchange
    ]
  }
}