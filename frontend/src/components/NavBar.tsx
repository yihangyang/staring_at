import React from 'react'
import { Box, Link, Flex, Button } from '@chakra-ui/core';
import NextLink from 'next/link'
import { useMeQuery, useLogoutMutation } from '../generated/graphql';

import { isServer } from '../utils/isServer'

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{fetching: logoutFetching},logout] = useLogoutMutation()
  const [{data, fetching}] = useMeQuery(
    { pause: isServer() } // ssr not render on server => the useMeQuery will run in client
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
        <Button onClick={() => {
          logout()
        }}
        isLoading={logoutFetching}
        mr={12} variant="link">logout</Button>
      </Flex>
    )
  }
  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4}>
      <Box ml={"auto"}>
        { body }
      </Box>
    </Flex>
  );
}