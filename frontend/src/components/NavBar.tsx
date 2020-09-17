import React from 'react'
import { Box, Link, Flex, Button, Heading } from '@chakra-ui/core';
import NextLink from 'next/link'
import { useMeQuery, useLogoutMutation } from '../generated/graphql';
import{ useRouter }from 'next/router'

// import { isServer } from '../utils/isServer'

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter()
  const [{fetching: logoutFetching}, logout] = useLogoutMutation()
  const [{data, fetching}] = useMeQuery(
    // { pause: isServer() } // ssr not render on server => the useMeQuery will run in client
  )

  let body = null
  
  if (fetching) { // data is loading
    // body = null
  } else if (!data?.me) { // user not login
    body = (
      <>
        <NextLink href="/login">
          <Link mr={4}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link pr={12}>Register</Link>
        </NextLink>
      </>
    )
  } else { // user is login => else if (data.me)
    body = (
      <Flex>
        <Box mr={3}>Welcome, {data.me.username}</Box>
        <Button onClick={async () => {
          await logout()
          router.reload()
        }}
        isLoading={logoutFetching}
        mr={12} variant="link">logout</Button>
      </Flex>
    )
  }
  return (
    <Flex zIndex={1} position="sticky" top={0} bg="#C0FFFF" p={4}>
      <Flex align="center" m="auto" flex={1} maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading color="#74265e"><i>CherryPie</i></Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{ body }</Box>
      </Flex>
    </Flex>
  );
}