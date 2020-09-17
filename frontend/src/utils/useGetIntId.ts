import { useRouter } from "next/router"

// get id from url
export const useGetIntId = () => {
  const router = useRouter()
  const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
  return intId
}