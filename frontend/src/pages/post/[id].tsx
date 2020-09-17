import { Badge, Box, Heading, IconButton, Link, Image, Flex, SimpleGrid } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { EditPostDeleteButton } from '../../components/EditPostDeleteButtons';
import { Layout } from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import NextLink from 'next/link'


const Post = ({}) => {
  // chakra ui layout
  const property = {
    imageUrl: "https://bit.ly/2Z4KKcF",
    imageAlt: "Rear view of modern home with pool",
    beds: 3,
    baths: 2,
    title: "Modern home in city center in the heart of historic Los Angeles",
    formattedPrice: "$1,900.00",
    reviewCount: 34,
    rating: 4,
  };

  const [{ data, error, fetching }] = useGetPostFromUrl()
  const router = useRouter()
  if (fetching) {
    return (
      <Layout>
        <div>...loading</div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div>{error.message}</div>
      </Layout>
    )
  }

  if (!data?.post) {
    console.log(data)
    return (
      <Layout>
        <Box>could not find post</Box>
      </Layout>
    );
  }
  
  console.log(data)
  return (
    <Layout>
      <SimpleGrid columns={2} spacing={10} mt="10">
        <Box maxW="sm" borderWidth="1px" rounded="lg" overflow="hidden">
          <Image src={property.imageUrl} alt={property.imageAlt} />

          <Box p="6">
            <Box d="flex" alignItems="baseline">
              <Badge rounded="full" px="2" variantColor="teal">
                New
              </Badge>
              <Box
                color="gray.500"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                textTransform="uppercase"
                ml="2"
              >
                create by: {data.post.creator.username}  &bull; {data.post.points} likes
              </Box>
            </Box>

            <Box
              mt="1"
              fontWeight="semibold"
              as="h4"
              lineHeight="tight"
              isTruncated
            >
              {data.post.title}
            </Box>

            <Box>
              {data.post.text}
              <Box as="span" color="gray.600" fontSize="sm">
              </Box>
            </Box>

            <Box d="flex" mt="2" alignItems="center">
              <Box as="span" ml="2" color="gray.600" fontSize="sm">
                {/* {property.reviewCount} reviews */}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box mr="auto" ml="auto" mt="20">
          <EditPostDeleteButton id={data.post.id} creatorId={data.post.creator.id} /> 
        </Box>
      </SimpleGrid>
      {/* <Heading mb={4}>
        {data.post.title}
      </Heading>
      {data.post.text}
      */}
    </Layout>

  );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)