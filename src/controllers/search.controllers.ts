import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { PeopleFollow } from '~/constants/enum'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { SearchQuery } from '~/models/requests/Search.request'
import searchService from '~/services/search.services'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  // query : {content, limit, page}
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  // console.log(req.query.content)
  const result = await searchService.search({
    limit,
    page,
    content: req.query.content,
    media_type: req.query.media_type,
    people_follow: req.query.people_follow,
    user_id: req.decoded_authorization?.user_id as string
  })
  res.json({
    message: SEARCH_MESSAGES.SEARCH_SUCCESSFULLY,
    result: {
      tweets: result.tweets,
      limit, // number of item of each page
      page, // page order
      total_page: Math.ceil(result.total / limit)
    }
  })
}
