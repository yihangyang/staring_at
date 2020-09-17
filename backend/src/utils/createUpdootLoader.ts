import DataLoader from 'dataloader'
import { Updoot } from 'src/entities/Updoot'

// input: {postId, userid}, output: Updoot({postId, userid, value})
// in order to in the progress of rendering the indexpage, only load the user who has posts, not render the all user 
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number, userId: number}, Updoot | null>(
    async keys => {
      const updoots = await Updoot.findByIds(keys as any)
      const updootIdToUpdoot: Record<string, Updoot> = {}
      updoots.forEach(updoot => {
        updootIdToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot
      });
      return keys.map(key => updootIdToUpdoot[`${key.userId}|${key.postId}`])
    }
  )
