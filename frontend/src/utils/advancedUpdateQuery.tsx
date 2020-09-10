import { Cache, QueryInput } from '@urql/exchange-graphcache';

// helper function in order to make easy to cast type
export function advancedUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, data => fn(result, data as any) as any);
}
