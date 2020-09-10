import React from 'react'
import { Formik, Form } from 'formik'
import { Box, Button, Flex, Badge, Text, Image, SimpleGrid,  } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter()
  const [, register] = useRegisterMutation()

  const toLogin = () => {
    router.push("/login")
  }
  return (
    <Wrapper variant="regular">
      <SimpleGrid columns={2} spacing={10} mt="10">
      <Box>
        <Image rounded="md" src="https://bit.ly/2k1H1t6"/>
        <Flex align="baseline" mt={2}>
          <Badge variantColor="pink">REGISTER</Badge>
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
          Welcome to Join us
        </Text>
      </Box>
      <Formik
        initialValues={{username: "", email: "", password: ""}}
        onSubmit={async (values, {setErrors}) => {
          const response = await register({options: values})
          if (response.data?.register.errors) {
            // it failed
            // data: [{field: 'username', message: 'something wrong'}]
            setErrors(toErrorMap(response.data.register.errors))
          } else if (response.data?.register.user) {
            // it works, you register a user, now redirect
            router.push("/")
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
            <Box>
              <InputField name="username" placeholder="username" label="Username" />
            </Box>
            <Box mt={4}>
              <InputField name="email" placeholder="email" label="Email" />
            </Box>
            <Box mt={4}>
              <InputField name="password" placeholder="password" label="Password" type="password" />
            </Box>
            <Flex mt={6} align="center">
              <Button w="35%" mx="auto" type="submit" isLoading={isSubmitting} variantColor="teal">
                Register
              </Button>
              <Button w="35%" mx="auto" onClick={toLogin} isLoading={isSubmitting} variantColor="pink">
                Have Account
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
      </SimpleGrid>
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(Register)