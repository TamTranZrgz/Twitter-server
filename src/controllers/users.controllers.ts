import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests.ts'
import usersService from '~/services/users.services.ts'

export const loginController = (req: Request, res: Response): void => {
  // This user is retrieved from validation of user in middleware (loginValidator)
  const user = { req }
  const { user_id } = user
  usersService.login(user_id)
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // const { name, email, password, date_of_birth } = req.body
  // throw new Error('Loi roi')
  const result = await usersService.register(req.body)

  // console.log(result)
  res.json({
    message: 'Register success',
    result
  })
}
