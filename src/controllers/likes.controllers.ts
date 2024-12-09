import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LIKES_MESSAGES } from '~/constants/messages'
import { LikeTweetReqBody } from '~/models/requests/Like.request'
import { TokenPayload } from '~/models/requests/User.requests'
import likesService from '~/services/likes.services'

export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LikeTweetReqBody>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await likesService.likeTweet(user_id, tweet_id)
  res.json({
    message: LIKES_MESSAGES.LIKE_TWEET_SUCCESSFULLY,
    result
  })
}

// use 'delete' method, will not send 'body', but got info from url
export const unlikeTweetController = async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  await likesService.unlikeTweet(user_id, tweet_id)
  res.json({
    message: LIKES_MESSAGES.UNLIKE_TWEET_SUCCESSFULLY,
  })
}
