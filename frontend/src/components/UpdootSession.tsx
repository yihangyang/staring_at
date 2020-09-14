import { Flex, IconButton } from '@chakra-ui/core';
import React, { useState } from 'react'
import { PostSnippetFragment, PostsQuery, useVoteMutation } from '../generated/graphql';

interface UpdootSessionProps {
  // post: PostsQuery['posts']['posts'][0]
  post: PostSnippetFragment
}

export const UpdootSession: React.FC<UpdootSessionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>('not-loading')
  const [, vote] = useVoteMutation()
    return (
      <Flex direction="column" alignItems="flex-end">
        <Flex direction="column" alignItems="center">
          <IconButton
            onClick={async () => {
              if (post.voteStatus === 1) {
                return
              }
              setLoadingState("updoot-loading")
              await vote({
                postId: post.id,
                value:1
              })
              setLoadingState("not-loading")
            }}
            variantColor={post.voteStatus === 1 ? "green" : undefined}
            isLoading={loadingState === "updoot-loading"}
            aria-label="updoot post"
            icon="arrow-up" 
          />
          {post.points}
          <IconButton
            onClick={() => {
              if (post.voteStatus === -1) {
                return
              }
              setLoadingState("downdoot-loading")
              vote({
                postId: post.id,
                value: -1
              })
              setLoadingState("not-loading")
            }}
            variantColor={post.voteStatus === -1 ? "red" : undefined}
            isLoading={loadingState==="downdoot-loading"}
            aria-label="downdoot post"
            icon="arrow-down"
          />
        </Flex>
      </Flex>
    );
}