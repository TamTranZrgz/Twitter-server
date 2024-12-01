import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

// this generic type will create an array, and inside this array will have items taken from keys of T
type FilterKeys<T> = Array<keyof T>

// use currying => 1 function returns another function
// Use to filter wanted keys
// in this function use generic type
export const filterMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }
