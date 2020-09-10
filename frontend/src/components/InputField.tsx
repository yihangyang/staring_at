import React, { InputHTMLAttributes } from 'react'
import { useField } from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, Textarea } from '@chakra-ui/core';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string, // required
  name: string // required
  textarea?: boolean
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  textarea,
  size:_,
  ...props
}) => {
  let InputOrTextArea = Input
  if (textarea) {
    InputOrTextArea = Textarea
  }
  const [field, {error}] = useField(props)
    return (
      // string => boolean
      <FormControl isInvalid={!!error}>
        <FormLabel htmlFor={field.name}>{label}</FormLabel>
        <InputOrTextArea {...field} {...props} id={field.name}  /> 
        { error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
      </FormControl>
    );
}