import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '~/models/Others'

interface TweetConstructure {
  _id?: ObjectId  // _is will be created by db
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  only null if it's the parent tweet
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at?: Date
  updated_at?: Date
}

export default class Tweet {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  only null if it's the parent tweet
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date

  constructor({
    _id,
    audience,
    content,
    guest_views,
    hashtags,
    medias,
    mentions,
    parent_id,
    type,
    user_id,
    user_views,
    created_at,
    updated_at
  }: TweetConstructure) {
    const date = new Date()
    this._id = _id
    this.user_id = user_id
    this.type = type
    this.audience = audience
    this.content = content
    this.parent_id = parent_id
    this.medias = medias
    this.guest_views = guest_views
    this.hashtags = hashtags
    this.mentions = mentions
    this.user_views = user_views
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
