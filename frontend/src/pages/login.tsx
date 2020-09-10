import React from 'react'
import { Formik, Form } from 'formik'
import { Box, Button, Flex, Badge, Text, Image, Tabs, TabList, Tab, TabPanels, TabPanel, Link } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginWithUsernameMutation, useLoginWithEmailMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link'


const Login: React.FC<{}> = ({}) => {
  const router = useRouter()
  const username = true; // false is mit password zu login
  
  const [, loginWithUsername] = useLoginWithUsernameMutation()
  const [, loginWithEmail] = useLoginWithEmailMutation()

  // chakra color tabs modul
  const colors = ["red.100", "blue.200"];
  const [tabIndex, setTabIndex] = React.useState(0);
  const bg = colors[tabIndex];
  
  return (
    <Wrapper variant="small">
      <Box>
        <Image rounded="md" src="https://bit.ly/2k1H1t6"/>
        <Flex align="baseline" mt={2}>
          <Badge variantColor="green">Login</Badge>
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
          Welcome Back
        </Text>
      </Box>

      <Tabs onChange={index => setTabIndex(index)} color="white" bg={bg} mt={6}>
        <TabList>
          <Tab>Login with Username</Tab>
          <Tab>Login with Email</Tab>
        </TabList>
        <TabPanels p="2rem">
          <TabPanel>
            <Formik
              initialValues={{username: "", passwordUser: ""}}
              onSubmit={async (values, {setErrors}) => {
                // const response = await loginWithUsername({ options: values })
                const response = await loginWithUsername({ options: { username: values.username, password: values.passwordUser } })
                if (response.data?.loginWithUsername.errors) {
                  // it failed
                  // data: [{field: 'username', message: 'something wrong'}]
                  setErrors(toErrorMap(response.data.loginWithUsername.errors))
                } else if (response.data?.loginWithUsername.user) {
                  // it works, you login a user, now redirect
                  if(typeof router.query.next === 'string') {
                    router.push(router.query.next)
                  } else {
                    router.push("/")
                  }
                }
              }}
            >
              {({isSubmitting}) => (
                <Form>
                  {/* <FormControl>
                    <FormLabel htmlFor="name">First name</FormLabel>
                    <Input value={values.username} onChange={handleChange} id="username" placeholder="username" />
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                  </FormControl> */}
                  <Box mt={2}>
                    <InputField name="username" placeholder="username" label="Username" color="black" />
                  </Box>
                  <Box mt={4}>
                    <InputField name="passwordUser" placeholder="password" label="Password" type="password" color="black" />
                  </Box>
                  <Flex mt={2}>
                    <NextLink href="/forgot-password">
                      <Link ml="auto">Forgot password?</Link>
                    </NextLink>
                  </Flex>
                  <Flex mt={6} align="center">
                    <Button  w="35%" mx="auto" type="submit" isLoading={isSubmitting} variantColor="teal">
                      Login
                    </Button>
                    <Button w="35%" mx="auto" onClick={() => {router.push("/register")}} isLoading={isSubmitting} variantColor="pink">
                      New User
                    </Button>
                  </Flex>
                </Form>
              )}
            </Formik>
          </TabPanel>
          <TabPanel>
            <Formik
              initialValues={{email: "", passwordEmail: ""}}
              onSubmit={async (values, {setErrors}) => {
                // const response = await loginWithEmail({ options: values })
                const response = await loginWithEmail({ options: { email: values.email, password: values.passwordEmail } })
                if (response.data?.loginWithEmail.errors) {
                  // it failed
                  // data: [{field: 'email', message: 'something wrong'}]
                  setErrors(toErrorMap(response.data.loginWithEmail.errors))
                } else if (response.data?.loginWithEmail.user) {
                  // it works, you login a user, now redirect
                  router.push("/")
                }
              }}
            >
              {({isSubmitting}) => (
                <Form>
                  <Box mt={2}>
                    <InputField name="email" placeholder="email" label="Email" color="black" />
                  </Box>
                  <Box mt={4}>
                    <InputField name="passwordEmail" placeholder="password" label="Password" type="password" color="black" />
                  </Box>
                  <Flex mt={2}>
                    <NextLink href="/forgot-password">
                      <Link ml="auto">Forgot password?</Link>
                    </NextLink>
                  </Flex>
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
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(Login)