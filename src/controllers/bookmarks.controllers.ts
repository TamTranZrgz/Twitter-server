import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARKS_MESSAGES } from '~/constants/messages'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.request'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarksService from '~/services/bookmarks.services'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await bookmarksService.bookmarkTweet(user_id, tweet_id)
  res.json({
    message: BOOKMARKS_MESSAGES.BOOKMARKS_TWEET_SUCCESSFULLY,
    result
  })
}

// use 'delete' method, will not send 'body', but got info from url
export const unbookmarkTweetController = async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  await bookmarksService.unbookmarkTweet(user_id, tweet_id)
  res.json({
    message: BOOKMARKS_MESSAGES.UNBOOKMARKS_TWEET_SUCCESSFULLY,
  })
}
