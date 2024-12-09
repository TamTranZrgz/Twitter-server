import { TweetReqBody } from '~/models/requests/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'

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
}

const tweetsService = new TweetsService()

export default tweetsService
