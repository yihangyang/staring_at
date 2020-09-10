import React, { useState } from 'react'
import { NextPage } from 'next';
import { Wrapper } from '../../components/Wrapper';
import { Box, Flex, Badge, Tabs, TabList, Tab, TabPanels, TabPanel, Button, Image, Text, Link } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { toErrorMap } from '../../utils/toErrorMap';
import { InputField } from '../../components/InputField';
import { useRouter } from 'next/router';
import { useChangePasswordMutation } from '../../generated/graphql';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import NextLink from 'next/link'

const ChangePassword: NextPage = ({}) => {
  const router = useRouter()
  const [,changePassword] = useChangePasswordMutation()
  const [tokenError, setTokenError] = useState('')

  // chakra color tabs modul
  const colors = ["teal.200"];
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
          You can now input your new password
        </Text>
      </Box>

      <Tabs onChange={index => setTabIndex(index)} color="white" bg={bg} mt={6}>
        <TabList>
          <Tab>Change Password</Tab>
        </TabList>
        <TabPanels p="2rem">
          <TabPanel>
            <Formik
              initialValues={{newPassword: ""}}
              onSubmit={async (values, {setErrors}) => {
                const response = await changePassword({
                  newPasword: values.newPassword,
                  token: typeof router.query.token === 'string' ? router.query.token : "",
                })
                if (response.data?.changePassword.errors) {
                  // it failed
                  // data: [{field: 'email', message: 'something wrong'}]
                  const errorMap = toErrorMap(response.data.changePassword.errors)
                  if ('token' in errorMap) {
                    // we need to deal this ,cause initialValue dont have token
                    setTokenError(errorMap.token)
                  }
                  console.log(errorMap)
                  setErrors(errorMap)
                } else if (response.data?.changePassword.user) {
                  // it works, you login a user, now redirect
                  router.push("/")
                }
              }}
            >
              {({isSubmitting}) => (
                <Form>
                  <Box>
                    <InputField name="newPassword" placeholder="new password" label="New Password" type="password" color="black" />
                  </Box>
                  {tokenError ? (
                    <Flex>
                      <Box style={{color: 'red'}} mr={4}>{tokenError}</Box>
                      <NextLink href="/forgot-password">
                        <Link>click to get new token</Link>
                      </NextLink>
                    </Flex>
                  ) : null}
                  <Flex mt={6} align="center" marginTop={10}>
                    <Button w="85%" mx="auto" type="submit" isLoading={isSubmitting} variantColor="teal">
                      Change Passsword
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

export default withUrqlClient(createUrqlClient)(ChangePassword)