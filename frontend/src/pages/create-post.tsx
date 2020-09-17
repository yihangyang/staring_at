import React from 'react'
import { Box, Flex, Badge, Tabs, TabList, Tab, TabPanels, TabPanel, Button, Image, Text } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { InputField } from '../components/InputField';
import { useCreatePostMutation } from '../generated/graphql'
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { Layout } from '../components/Layout';
import { useIsAuth } from '../utils/useIsAuth';

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter()
  useIsAuth() // if hasnt login, redirect to /login
  
  const [, createPost] = useCreatePostMutation()


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
          <Tab>Say some to World</Tab>
          <Tab>other</Tab>
        </TabList>
        <TabPanels p="2rem">
          <TabPanel>
            <Formik
              initialValues={{title: "", text: ""}}
              onSubmit={async (values, {setErrors}) => {
                console.log(values)
                const { error } = await createPost({input: values})
                if(!error) {
                  router.push("/")
                }
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
                      Create Post
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
                <Form>
                  <Box mt={2}>
                    <InputField name="title" placeholder="title" label="Title" color="black" />
                  </Box>
                  <Box mt={4}>
                    <InputField name="text" placeholder="text" label="text" type="text" color="black" />
                  </Box>
                  <Flex mt={6} align="center">
                    <Button  w="35%" mx="auto" type="submit" isLoading={isSubmitting} variantColor="teal">
                      Login
                    </Button>
                    <Button w="35%" mx="auto" onClick={() => {router.push("/register")}} variantColor="pink">
                      New User
                    </Button>
                  </Flex>
                </Form>
              )}
            </Formik>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient)(CreatePost)