import { query, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARKS_MESSAGES, CONVERSATIONS_MESSAGES } from '~/constants/messages'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.request'
import { GetConversationsParams } from '~/models/requests/Conversation.request'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarksService from '~/services/bookmarks.services'
import conversationsService from '~/services/conversations.services'

export const getConversationsController = async (
  req: Request<GetConversationsParams>,
  res: Response
): Promise<void> => {
  // route: conversations/:receiver_id?limit0=3&page=1
  const { receiver_id } = req.params
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const sender_id = req.decoded_authorization?.user_id as string
  const result = await conversationsService.getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  })
  res.json({
    result: {
      limit,
      page,
      total_page: Math.ceil(result.total / limit),
      conversations: result.conversations
    },
    message: CONVERSATIONS_MESSAGES.GET_CONVERSATIONS_SUCCESSFULLY
  })
}
