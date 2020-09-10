import { utimes } from "fs";
import { useMeQuery } from "../generated/graphql";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useIsAuth = () => {
  const [{data, fetching}] = useMeQuery()
  const router = useRouter()
  useEffect(() => {
    if(!fetching && !data?.me) { // it be false, when it loading, therefore fetching is nesseary => not loading && not have user
      // not login, redirect to /login
      router.replace('/login?next=' + router.pathname) // where should go after login
    }
  }, [fetching, data, router])
}