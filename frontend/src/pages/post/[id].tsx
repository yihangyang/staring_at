import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { createUrqlClient } from '../../utils/createUrqlClient';

const Post = ({}) => {
  const router = useRouter()
  return ();
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)