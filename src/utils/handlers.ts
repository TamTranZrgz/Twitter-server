import { Request, Response, NextFunction, RequestHandler } from 'express'

export const wrapRequestHandler = <P>(func: RequestHandler<P, any, any, any>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    // 1. Use try catch
    // We only need to try catch one time here in handler, dont need to try catch other function called inside this block (ex: register)
    // if there is error in the block 'try', code will jump right into 'catch' block
    // this method can be used for both async and sync func
    try {
      await func(req, res, next)
    } catch (error) {
      next(error) // catch error here will jump into error handler in index.ts
    }

    // 2. Use Promise
    // Promise.resolve(func(req, res, next)).catch(next)
  }
}
