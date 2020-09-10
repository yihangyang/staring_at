import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  // if use hasnt login, they cannot post anything
  if(!context.req.session.userId) {
    throw new Error('not authenticated')
  }

  return next()
}