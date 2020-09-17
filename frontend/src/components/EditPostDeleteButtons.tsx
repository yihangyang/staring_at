import { Box, IconButton, Link } from '@chakra-ui/core';
import React from 'react'
import NextLink from 'next/link'
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';


interface EditPosDeleteButtonProps {
  id: number,
  creatorId: number
}

export const EditPostDeleteButton: React.FC<EditPosDeleteButtonProps> = ({
  id,
  creatorId
}) => {
  const [{data: dataMe}] = useMeQuery()
  const [, deletePost] = useDeletePostMutation()

  if (dataMe?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Box>
      <NextLink
        href='/post/edit/[id]'
        as={`/post/edit/${id}`}
      >
        <IconButton
          as={Link}
          mr={2}
          icon="edit"
          aria-label="Edit Post"
          size="xs"
          variantColor="blue"
        />
      </NextLink>
      <IconButton
        icon="delete"
        aria-label="Delete Post"
        size="xs"
        variantColor="red"
        onClick={(e) => {
          e.stopPropagation()
          deletePost({ id })
        }}
      />
    </Box>
  );
}