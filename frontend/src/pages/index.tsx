// import { DarkModeSwitch } from '../components/DarkModeSwitch'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { usePostsQuery } from '../generated/graphql'
import { Layout } from '../components/Layout'
import { Accordion, AccordionHeader, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Flex, Heading, Icon, IconButton, Link, SimpleGrid, Stack, Text } from '@chakra-ui/core'
import NextLink from 'next/link'
import React, { useState } from 'react'
import { UpdootSession } from '../components/UpdootSession'

const Index = () => {
  const [varibales, setVariables] = useState({
    limit: 10,
    cursor: null as null | string
  })
  const [{ data, fetching }] = usePostsQuery({
    variables: varibales
  })

  if(!fetching && !data) {
    return <div> For some reaon, query failed</div>
  }
  return (
    <Layout>
      <Flex>
        <Heading>CherryPie</Heading>
        <NextLink href="/create-post">
          <Button ml="auto" variantColor="pink" variant="solid">
            <Link>create post</Link>
          </Button>
        </NextLink>
      </Flex>
      
      <br />
      {/* <DarkModeSwitch /> */}
      {!data && fetching ? ( // if in searching and dont has any data => loading...
        <div>loading...</div>
      ) : (
        // <Stack spacing={8}>
        <SimpleGrid columns={2} spacing={10}>
          { data!.posts.posts.map( (p) => (
              // <Box key={p.id} p={5} shadow="md" borderWidth="1px" rounded="md" >
              //   <Heading fontSize="base">{p.title.slice(0, 50)}</Heading> {p.creator.username}
              //   <Text mt={4}>{p.textSnippet}</Text>
              // </Box>
            <Accordion key={p.id} defaultIndex={[0]} allowMultiple>
              <AccordionItem>
                <AccordionHeader>
                  <Flex flex="1" textAlign="justify" >
                    <Box>
                      <big>{p.title}</big>
                      <small> posted by {p.creator.username}</small>
                    </Box>
                  </Flex>
                  <AccordionIcon />
                </AccordionHeader>
                <AccordionPanel pb={4}>
                  <Flex>
                    <Flex flex="4">
                      {p.textSnippet}
                    </Flex>
                    <Flex flex="1" direction="column" alignItems="flex-end">
                      <UpdootSession post={p} />
                    </Flex>
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          ))}
        {/* </Stack> */}
        </SimpleGrid>
      )}
      { data && data.posts.hasMore ?(
        <Flex>
          <Button 
            isLoading={fetching} 
            onClick={() => {
              setVariables({
                limit: varibales.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
              })
            }} 
            m="auto"
            my="8"
          >
            Load more
          </Button>
        </Flex>
        ) : null}
    </Layout>
  )
}

// ssr: fetch the post on the server, and bring all data to broswer at once, good for google seo
// not every page needs seo, only for dynamic data is convienient, we can allow google get my dynamic data, and dont let our server overload, spend money
export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
