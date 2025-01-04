import { TweetReqBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { TweetType } from '~/constants/enum'

class TweetsService {
  async checkAndCreateHashtags(hashtags: string[]) {
    // use 'findOneAndUpdate' to find hashtag in database, if not found, will ad new one
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          {
            name: hashtag
          },
          // if hashtag not found, create new one
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          // return document state after create new successfully
          { upsert: true, returnDocument: 'after' }
        )
      })
    )
    return hashtagDocuments.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
  }

  async createTweet(user_id: string, body: TweetReqBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)
    // console.log(hashtags)
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    // console.log(result) // this will not return a tweet, only return an object to indicate the tweet has been created

    // to get a whole tweet with info in return, we must find it again in db
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }

  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        // $inc: inrease
        $inc: inc,
        $currentDate: {
          updated_at: true // $currentDate start to calculate when MongoDb runs
        }
      },
      {
        returnDocument: 'after',

        // choose which info will be returned in response to client
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )
    // console.log(result)
    return result as WithId<{
      guest_views: number
      user_views: number
      updated_at: Date
    }>
  }

  async getTweetChidren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id?: string
  }) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
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
            },
            views: {
              $add: ['$user_views', '$guest_views']
            }
          }
        },
        {
          $project: {
            children_tweets: 0
          }
        },
        {
          // number of first items to skip
          // page start at 1, will skip 0 item
          $skip: limit * (page - 1) // page will start from 1
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    // get id list of tweets
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()

    // update views and get 'total' count of tweets
    const [, total] = await Promise.all([
      // use updateMany can not return updated_at
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids // look for tweets that have isd included indide array 'ids'
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date // time will start when code runs
          }
        }
      ),
      // get total tweets => return 'total'
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])

    // mutate data in tweets to update tweet children views
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })

    return {
      tweets,
      total
    }
  }

  async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    // convert user_id from string to an object
    const user_id_obj = new ObjectId(user_id)

    const followed_user_ids = await databaseService.followers
      .find(
        {
          user_id: user_id_obj
        },
        {
          projection: {
            followed_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()
    // console.log(followed_user_ids)

    // convert an array of object into an array
    const ids = followed_user_ids.map((item) => item.followed_user_id)

    // push id of youself so new feeds will include also my new feeds
    ids.push(user_id_obj)

    // These 2 processes can be conducted at the same time to optimize the performance
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.twitter_circle': {
                        $in: [user_id_obj]
                      }
                    }
                  ]
                }
              ]
            }
          },
          // best position for 'skip' and 'limit'
          // locate them right after the last '$match'
          {
            // number of first items to skip
            // page start at 1, will skip 0 item
            $skip: limit * (page - 1) // page will start from 1
          },
          {
            $limit: limit
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
              // 'views': calculated from client side
              // views: {
              //   $add: ['$user_views', '$guest_views']
              // }
            }
          },
          {
            $project: {
              children_tweets: 0,
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                date_of_birth: 0
              }
            }
          }
        ])
        .toArray(),
      // get total tweets => count with 'total' variables
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.twitter_circle': {
                        $in: [user_id_obj]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])

    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)

    const date = new Date()

    // update views of tweets
    // use updateMany can not return updated_at
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids // look for tweets that have isd included indide array 'ids'
        }
      },
      {
        $inc: { user_views: 1 }, // user must logged in to see new feeds
        $set: {
          updated_at: date // time will start when code runs
        }
      }
    )

    // mutate data in tweets to update tweet children views
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      tweet.user_views += 1
    })

    return {
      tweets,
      total: total[0]?.total || 0
    }
  }
}

const tweetsService = new TweetsService()

export default tweetsService
