import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enum'
import { FEEDS_MESSAGES, TWEETS_MESSAGES } from '~/constants/messages'
import { Pagination, TweetParam, TweetQuery, TweetReqBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetsService from '~/services/tweets.services'

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)
  res.json({
    message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESSFULLY,
    result
  })
}

export const getTweetController = async (req: Request, res: Response): Promise<void> => {
  // we have attached 'tweet' found from database in 'validateTweetId' function to req.tweet
  // here we can get it from req
  const result = await tweetsService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  // console.log(result)

  // then we need to mutate the result to get the correct 'views' of tweet
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }

  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    result: tweet
  })
}

export const getTweetChildrenController = async (
  req: Request<TweetParam, any, any, TweetQuery>,
  res: Response
): Promise<void> => {
  const tweet_type = Number(req.query.tweet_type) as TweetType // query params are string, so needed to be turn into number
  const limit = Number(req.query.limit) // query params are string, so needed to be turn into number
  const page = Number(req.query.page) // query params are string, so needed to be turn into number

  const user_id = req.decoded_authorization?.user_id

  const { tweets, total } = await await tweetsService.getTweetChidren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  })

  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY,
    result: {
      tweets,
      tweet_type,
      limit, // number of item of each page
      page, // page order
      total_page: Math.ceil(total / limit)
    }
  })
}

export const getnewFeedsController = async (
  req: Request<ParamsDictionary, any, any, Pagination>,
  res: Response
): Promise<void> => {
  const user_id = req.decoded_authorization?.user_id as string
  const limit = Number(req.query.limit) // query params are string, so needed to be turn into number
  const page = Number(req.query.page) // query params are string, so needed to be turn into number
  const result = await tweetsService.getNewFeeds({ user_id, limit, page })
  res.json({
    message: FEEDS_MESSAGES.GET_NEW_FEEDS_SUCCESSFULLY,
    result: {
      tweets: result.tweets,
      limit, // number of item of each page
      page, // page order
      total_page: Math.ceil(result.total / limit)
    }
  })
}
