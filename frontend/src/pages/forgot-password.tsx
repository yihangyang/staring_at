import React, { useState } from 'react'
import { Wrapper } from '../components/Wrapper';
import { SimpleGrid, Box, Flex, Badge, Button, Text, Image, Tabs, TabList, Tab, Link, TabPanels, TabPanel } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import register from './register';
import { toErrorMap } from '../utils/toErrorMap';
import { InputField } from '../components/InputField';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useForgotPasswordMutation } from '../generated/graphql';

const ForgotPassword: React.FC<{}> = ({}) => {
  // chakra color tabs modul
  const colors = ["red.100", "blue.200"];
  const [tabIndex, setTabIndex] = React.useState(0);
  const bg = colors[tabIndex];

  const [complete, setComplete] = useState(false)
  const [, forgotPassword] = useForgotPasswordMutation()
  return (
    <Wrapper variant="small">
    <Box>
      <Image rounded="md" src="https://bit.ly/2k1H1t6"/>
      <Flex align="baseline" mt={2}>
        <Badge variantColor="purple">Retrieve</Badge>
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
        Please input your username or email
      </Text>
    </Box>

    <Tabs onChange={index => setTabIndex(index)} color="white" bg={bg} mt={6}>
      <TabList>
        <Tab>Retrieve with Email</Tab>
        <Tab>Retrieve with Username</Tab>
      </TabList>
      <TabPanels p="2rem">
        <TabPanel>
          <Formik
            initialValues={{email: ""}}
            onSubmit={async (values, {setErrors}) => {
              await forgotPassword(values)
              setComplete(true)
            }}
          >
            {({isSubmitting}) => 
            complete ? (
              <Box color="blueviolet">
                if an account with email exists, we will send you an email
              </Box>
            ):(
              <Form>
                <Box mt={2}>
                  <InputField name="email" placeholder="email" label="Email" color="black" />
                </Box>
                <Flex mt={6} align="center">
                  <Button  w="60%" mx="auto" type="submit" isLoading={isSubmitting} variantColor="teal">
                    Retrieve
                  </Button>
                </Flex>
              </Form>
            )}
          </Formik>
        </TabPanel>
        <TabPanel>
          <Formik
            initialValues={{username: ""}}
            onSubmit={async (values, {setErrors}) => {
              // email => username
            }}
          >
            {({isSubmitting}) => 
              complete ? (
                <Box color="blueviolet">
                  if an account with email exists, we will send you an email
                </Box>
              ):(
              <div style={{color:"blueviolet"}}>Sorry, we cannot reset password through username at moment</div>
              // <Form>
              //   <Box mt={2}>
              //     <InputField name="username" placeholder="username" label="Username" color="black" />
              //   </Box>
              //   <Flex mt={6} align="center">
              //     <Button  w="60%" mx="auto" type="submit" isLoading={isSubmitting} variantColor="teal">
              //       Retrieve
              //     </Button>
              //   </Flex>
              // </Form>
            )}
          </Formik>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)