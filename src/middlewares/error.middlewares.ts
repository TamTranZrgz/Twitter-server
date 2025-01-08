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
  try {
    if (error instanceof ErrorWithStatus) {
      res.status(error.status).json(omit(error, ['status']))
      return
    }

    const finalError: any = {}
    // get properties from 'error' (object) as an array, and use 'for' loop later
    Object.getOwnPropertyNames(error).forEach((key) => {
      if (
        !Object.getOwnPropertyDescriptor(error, key)?.configurable ||
        !Object.getOwnPropertyDescriptor(error, key)?.writable
      ) {
        return
      }

      finalError[key] = error[key]
      // Object.defineProperty(error, key, {
      //   enumerable: true
      // })

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: finalError.message,
        errorInfo: omit(finalError, ['stack'])
      })
    })
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      errorInfo: omit(err as any, ['stack'])
    })
  }
}
