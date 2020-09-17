import { Badge, Box, Button, Flex, Image, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';

const EditPost = ({}) => {
  const router = useRouter()
  const intId = useGetIntId()
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    }
  })
  const [, updatePost] = useUpdatePostMutation()
  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    )
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>could not find post</Box>
      </Layout>
    );
  }
  
  // chakra color tabs modul
  const colors = ["red.100", "blue.200"];
  const [tabIndex, setTabIndex] = React.useState(0);
  const bg = colors[tabIndex];

  return (
    <Layout variant="small">
    <Box>
      <Image rounded="md" src="https://bit.ly/2k1H1t6"/>
      <Flex align="baseline" mt={2}>
        <Badge variantColor="gray">Post</Badge>
        <Text
          ml={2}
          textTransform="uppercase"
          fontSize="sm"
          fontWeight="bold"
          color="pink.800"
        >
        Verified &bull; Cape Town
        </Text>
      </Flex>
      <Text mt={2} fontSize="xl" fontWeight="semibold" lineHeight="short">
        Say something to this fucking world...
      </Text>
    </Box>
    <Tabs onChange={index => setTabIndex(index)} color="white" bg={bg} mt={6}>
      <TabList>
        <Tab>Edit some to World</Tab>
        <Tab>other</Tab>
      </TabList>
      <TabPanels p="2rem">
        <TabPanel>
          <Formik
            initialValues={{title: data.post.title, text: data.post.text}}
            onSubmit={async (values) => {
              await updatePost({id: intId, ...values})
              router.back()
            }}
          >
            {({isSubmitting}) => (
               <Form>
                <Box mt={2}>
                  <InputField name="title" placeholder="title" label="Title" color="black" />
                </Box>
                <Box mt={4}>
                  <InputField name="text" textarea placeholder="text..." label="Text" color="black" />
                </Box>
                <Flex mt={6} align="center">
                  <Button  w="35%" mx="auto" type="submit" isLoading={isSubmitting} variantColor="teal">
                    Update Post
                  </Button>
                  <Button w="35%" mx="auto" onClick={() => {router.push("/register")}} isLoading={isSubmitting} variantColor="pink">
                    Back
                  </Button>
                </Flex>
              </Form>
            )}
          </Formik>
        </TabPanel>
        <TabPanel>
          <Formik
            initialValues={{title: "", text: ""}}
            onSubmit={async (values, {setErrors}) => {
            }}
          >
            {({isSubmitting}) => (
              <div>Please go to edit post page</div>
            )}
          </Formik>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Layout>
  );
}

export default withUrqlClient(createUrqlClient)(EditPost)