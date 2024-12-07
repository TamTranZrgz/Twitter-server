import { NextFunction, Request, Response, ErrorRequestHandler } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

// will handle errors in app (index.ts)
export const defaultErrorHandler: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof ErrorWithStatus) {
    res.status(error.status).json(omit(error, ['status']))
    return
  }

  // get properties from 'error' (object) as an array, and use 'for' loop later
  Object.getOwnPropertyNames(error).forEach((key) => {
    Object.defineProperty(error, key, {
      enumerable: true
    })
  })

  res.status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: error.message,
    errorInfo: omit(error, ['stack'])
  })
  return
}
