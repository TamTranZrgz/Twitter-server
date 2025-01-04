import { SearchQuery } from '~/models/requests/Search.request'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { MediaType, MediaTypeQuery, PeopleFollow, TweetType } from '~/constants/enum'

class SearchService {
  async search({
    limit,
    page,
    content,
    user_id,
    media_type,
    people_follow
  }: {
    limit: number
    page: number
    content: string
    user_id: string
    media_type?: MediaTypeQuery
    people_follow?: PeopleFollow
  }) {
    // default filter
    const $match: any = {
      $text: {
        $search: content
      }
    }

    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        $match['medias.type'] = MediaType.Image
      }

      if (media_type === MediaTypeQuery.Video) {
        $match['medias.type'] = {
          $in: [MediaType.Video, MediaType.HLS]
        }
      }
    }

    if (people_follow && people_follow === PeopleFollow.Following) {
      // convert user_id from string to an object
      const user_id_obj = new ObjectId(user_id)

      // get id of users we have been following
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
      $match['user_id'] = {
        $in: ids
      }
    }
    // console.log($match)

    // These 2 processes can be conducted at the same time to optimize the performance
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match
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
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
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
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      // get total tweets => count with 'total' variables
      databaseService.tweets
        .aggregate([
          {
            $match
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
                        $in: [new ObjectId(user_id)]
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

    // console.log(total)

    return {
      tweets,
      total: total[0]?.total || 0
    }
  }
}

const searchService = new SearchService()

export default searchService
