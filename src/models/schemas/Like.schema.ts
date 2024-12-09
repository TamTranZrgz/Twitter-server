import { ObjectId } from 'mongodb'

interface LikeConstructure {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
}

export default class Like {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
  constructor({ _id, user_id, tweet_id, created_at }: LikeConstructure ) {
    this._id = _id || new ObjectId() // use 'insertOne' will automatically create new ObjectId if it's null
    this.user_id = user_id
    this.tweet_id = tweet_id
    this.created_at = created_at || new Date()
  }
}
