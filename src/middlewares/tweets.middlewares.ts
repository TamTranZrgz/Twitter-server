import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { isEmpty } from 'lodash'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import { LIMIT_MESSAGES, PAGE_MESSAGES, TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'
import databaseService from '~/services/database.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { Request, Response, NextFunction } from 'express'
import Tweet from '~/models/schemas/Tweet.schema'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetTypes = numberEnumToArray(TweetType)
// console.log(tweetTypes) // [0,1,2,3]
const tweetAudiences = numberEnumToArray(TweetAudience)
// console.log(tweetAudiences) // [0,1]
const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema({
    // check type must be among 4 types (tweet, retweet, comment, quote tweet)
    type: {
      isIn: {
        options: [tweetTypes], // array of array : [[0,1,2,3]]
        errorMessage: TWEETS_MESSAGES.INVALID_TWEET_TYPE
      }
    },
    audience: {
      isIn: {
        options: [tweetAudiences], // array of array : [[0,1]]
        errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE_TYPE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          // `parent_id` must be `_id` of `parent tweet` (if tweet type is among retweet, comment or quotetweet), or will be `null` if type is tweet
          if ([TweetType.Comment, TweetType.QuoteTweet, TweetType.Retweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
          }
          // `parent_id` will be `null` if type is tweet
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    // `content` will be empty if is it `retweet`, and must be string if it belongs to other types and not have `mentions` and `hashtags` (mentions & hashtags are empty arrays)
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          if (
            [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_NONE_EMPTY_STRING)
          }

          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // each key in array must be a string
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // each key in array must be user_id
          if (value.some((item: any) => ObjectId.isValid(item))) {
            throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // each key in array must be Media object type
          if (
            value.some((item: any) => {
              return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
            })
          ) {
            throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  })
)

// check tweet_id
export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        // isMongoId: {
        //   errorMessage: TWEETS_MESSAGES.INVALID_TWEET_ID
        // } -> check here will throw an error of 422 which is normally used for submitting form
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEETS_MESSAGES.INVALID_TWEET_ID
              })
            }

            // get tweet using aggreration (get this from Mongo Compass)
            // use destructuring to get the first item
            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value as string)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                  }
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: '$mentions',
                        as: 'mention',
                        in: {
                          _id: '$$mention._id',
                          name: '$$mention.name',
                          username: '$$mention.username',
                          email: '$$mention.email'
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'bookmarks'
                  }
                },
                {
                  $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'likes'
                  }
                },
                {
                  $lookup: {
                    from: 'tweets',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'children_tweets'
                  }
                },
                {
                  $addFields: {
                    bookmart_count: {
                      $size: '$bookmarks'
                    },
                    like_count: {
                      $size: '$likes'
                    },
                    children_tweet_count: {
                      $size: '$children_tweets'
                    },
                    retweets_count: {
                      $size: {
                        $filter: {
                          input: '$children_tweets',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Retweet]
                          }
                        }
                      }
                    },
                    comments_count: {
                      $size: {
                        $filter: {
                          input: '$children_tweets',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Comment]
                          }
                        }
                      }
                    },
                    requote_count: {
                      $size: {
                        $filter: {
                          input: '$children_tweets',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.QuoteTweet]
                          }
                        }
                      }
                    }
                    // views: {
                    //   $add: ['$user_views', '$guest_views']
                    // }
                  }
                },
                {
                  $project: {
                    children_tweets: 0
                  }
                }
              ])
              .toArray()

            //console.log(tweet)

            if (!tweet) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND
              })
            }

            // gan 'tweet' to request, and use it later for 'audienceValidator'
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

// check tweet_type (factor in url query)
export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TWEET_TYPE
        }
      }
    },
    ['query']
  )
)

// check limit, and page (factors in url query)
export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value) // initially, limit is 'string'
            if (num > 100 || num < 1) {
              throw new Error(LIMIT_MESSAGES.LIMIT_MUST_BE_LESS_THAN_100_AND_MORE_THAN_1)
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value) // initially, limit is 'string'
            if (num < 1) {
              throw new Error(PAGE_MESSAGES.PAGE_MUST_BE_MORE_THAN_OR_EQUAL_TO_1)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

// check tweet audience (circle or everyone)
// To use async/await in express handler, must use try/catch, if not will need to wrap this func
export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet

  // if audience is Tweet Circle
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // check if this viewer of this Tweet has been logged in
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
      })
    }

    // check whether tweet author's account has been deleted or blocked
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    })
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }

    // check whether this tweet's viewer is inside Tweet Circle of tweet's author and not tweet's author
    const { user_id } = req.decoded_authorization
    const isInTweeterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))
    if (!author._id.equals(user_id) && !isInTweeterCircle) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
      })
    }
  }
  next() // if tweet is for everyone, not need to check, just go to next func
})
