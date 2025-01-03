import { Router } from 'express'
import {
  createTweetController,
  getnewFeedsController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInvalidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 * Description: Create tweet
 * Path: /
 * Method: POST
 * Body: TweetReqBody
 * Header: { Authorization: Bearer <access_token> }
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 * Description: Get Tweet details
 * Path: /:tweet_id
 * Method: GET
 * Body: method GET not send any data in body req
 * Header: { Authorization?: Bearer <access_token> }
 */
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator, // get tweet here and use for next func below
  isUserLoggedInvalidator(accessTokenValidator), // only run 'accessTokenValidator' when there is 'Authorization' header
  isUserLoggedInvalidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

/**
 * Description: Get Tweet Children (comment, retweet, quotetweet)
 * Path: /:tweet_id/children
 * Method: GET
 * Body: method GET not send any data in body req
 * Header: { Authorization?: Bearer <access_token> }
 * Query: { limit: number, page: number, tweet_type: TweetType }
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator, // get tweet here and use for next func below
  paginationValidator, // check limit & page on url query
  getTweetChildrenValidator, // check tweet_type on url query
  isUserLoggedInvalidator(accessTokenValidator), // only run 'accessTokenValidator' when there is 'Authorization' header
  isUserLoggedInvalidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)

/**
 * Description: Get new feeds
 * Path: /new-feeds
 * Method: GET
 * Body: method GET not send any data in body req
 * Header: { Authorization?: Bearer <access_token> }
 * Query: { limit: number, page: number }
 */
tweetsRouter.get(
  '/', // add 'new-feeds' will be concident with '/tweets/:tweet_id' route
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getnewFeedsController)
)

export default tweetsRouter
