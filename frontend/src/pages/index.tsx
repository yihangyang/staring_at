// import { DarkModeSwitch } from '../components/DarkModeSwitch'
import { NavBar } from '../components/NavBar'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { usePostsQuery } from '../generated/graphql'
import { Layout } from '../components/Layout'
import { Link } from '@chakra-ui/core'
import NextLink from 'next/link'


const Index = () => {
  const [{ data }] = usePostsQuery({
    variables: {
      limit: 10
    }
  })
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>create post</Link>
      </NextLink>
      <br />
      {/* <DarkModeSwitch /> */}
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map(p => <div key={p.id}>{p.title}</div>)
      )}
    </Layout>
  )
}

// ssr: fetch the post on the server, and bring all data to broswer at once, good for google seo
// not every page needs seo, only for dynamic data is convienient, we can allow google get my dynamic data, and dont let our server overload, spend money
export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
