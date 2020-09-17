import DataLoader from 'dataloader'
import { User } from '../entities/User'

// input: userid, output: user
// in order to in the progress of rendering the indexpage, only load the user who has posts, not render the all user 
export const createUserLoader = () =>
  new DataLoader<number, User>(async userIds => {
    const users = await User.findByIds(userIds as number[])
    const userIdToUser: Record<number, User> = {}
    users.forEach(u => {
      userIdToUser[u.id] = u
    });

    return userIds.map(userId => userIdToUser[userId])
})
