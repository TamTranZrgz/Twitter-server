import { ParamsDictionary, Query } from 'express-serve-static-core'
import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Others'

export interface TweetReqBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  null when it's the orginal, or tweet_id as string
  hashtags: string[] // client sends hashtag in req as string
  mentions: string[] // string has type of user_id : user_id[]
  medias: Media[]
}

export interface TweetParam extends ParamsDictionary {
  tweet_id: string
}

export interface Pagination {
  limit: string
  page: string
}

export interface TweetQuery extends Query, Pagination {
  tweet_type: string
}
