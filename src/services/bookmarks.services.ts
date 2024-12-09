import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmark.schema'

class BookmarksService {
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      // if bookmark not found, create new one
      { $setOnInsert: new Bookmark({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) }) },
      // return document state after create new successfully
      { upsert: true, returnDocument: 'after' }
    )
    // console.log(result)
    return result as WithId<Bookmark>
  }

  async unbookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    // console.log(result)
    return result
  }
}

const bookmarksService = new BookmarksService()

export default bookmarksService
