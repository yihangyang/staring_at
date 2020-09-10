import { UsernameEmailPasswordInput } from "../resolvers/usernameEmailPasswordInput"

export const validateRegister = (options: UsernameEmailPasswordInput) => {
  // username must be greater than 3
  if(options.username.length <= 3) {
    return [{
      field: 'username',
      message: 'length of username must be greater than 3'
    }]
  }

  if(options.username.includes("%" || "$" || "§" || "&")) {
    return [{
      field: 'username',
      message: 'cannot include special chars'
    }]
  }

  // email must be greater than 3
  if(!options.email.includes("@")) {
    return [{
      field: 'email',
      message: 'invalid email'
    }]
  }

  // password must be greater than 3
  if(options.password.length <= 3) {
    return [{
      field: 'password',
      message: 'length of password must be greater than 3'
    }]
  }

  return null
}