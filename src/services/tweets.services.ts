import { TweetReqBody } from '~/models/requests/Tweet.request'
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
          updated_at: true
        }
      },
      {
        returnDocument: 'after',

        // choose which info will be returned in response to client
        projection: {
          guest_views: 1,
          user_views: 1
        }
      }
    )
    // console.log(result)
    return result as WithId<{
      guest_views: number
      user_views: number
    }>
  }

  async getTweetChidren({
    tweet_id,
    tweet_type,
    limit,
    page
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
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

    // get total tweets
    const total = await databaseService.tweets.countDocuments({
      parent_id: new ObjectId(tweet_id),
      type: tweet_type
    })

    return {
      tweets,
      total
    }
  }
}

const tweetsService = new TweetsService()

export default tweetsService
