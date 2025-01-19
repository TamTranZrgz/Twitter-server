import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { pick } from 'lodash'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnfolowReqParams,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { envConfig } from '~/constants/config'

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response
): Promise<void> => {
  // This user is retrieved from validation of user in middleware (loginValidator)
  const user = req.user as User
  // console.log(user)
  const user_id = user._id as ObjectId
  // console.log('user_id:', user_id)

  // user_id from request is an object, we need to convert it to string
  const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const oauthController = async (req: Request, res: Response): Promise<void> => {
  // console.log('url: ', req.url)
  const { code } = req.query
  // console.log('code: ', code)
  const result = await usersService.oauth(code as string)
  const urlRedirect = `${envConfig.clientRedirectCallback}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&newUser=${result.newUser}&verify=${result.verify}`

  // redirect to client screen
  res.redirect(urlRedirect)
  // res.json({
  //   message: result.newUser ? USERS_MESSAGES.REGISTER_SUCCESS : USERS_MESSAGES.LOGIN_SUCCESS,
  //   result: {
  //     acces_token: result.access_token,
  //     refresh_token: result.refresh_token
  //   }
  // })
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
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response
): Promise<void> => {
  const { refresh_token } = req.body
  // console.log(refresh_token)
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
): Promise<void> => {
  const { refresh_token } = req.body
  // console.log(req.body)
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload
  const result = await usersService.refreshToken({ user_id, verify, refresh_token, exp })
  res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  // const email_verify_token = req.body.email_verify_token
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })

  // If no user is found
  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  // Email has been verified, email_verify_token is empty
  // will not throw error, but will return status 'ok' with message 'Email has been verified'
  if ((user as User).email_verify_token === '') {
    res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const result = await usersService.verifyEmail(user_id)
  res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }

  if ((user as User).verify === UserVerifyStatus.Verified) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
    return
  }

  const result = await usersService.resendVerifyEmail(user_id, user.email)
  res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // If req.user is undefined, we can not get info from destructuring
  // so we need to define type as User
  const { _id, verify, email } = req.user as User
  const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify, email })
  res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  res.json(result)
}

export const getMeController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await usersService.getMe(user_id)
  res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  // const body = pick(req.body, [
  //   'name',
  //   'date_of_birth',
  //   'bio',
  //   'location',
  //   'website',
  //   'avatar',
  //   'username',
  //   'cover_photo'
  // ])
  const { body } = req
  // console.log(body)
  const user = await usersService.updateMe(user_id, body)
  res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result: user
  })
}

export const getProfileController = async (
  req: Request<GetProfileReqParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // api: /users/:username -> params will include username
  // username is always string, so do not need to validate
  const { username } = req.params
  console.log(req.params)
  const user = await usersService.getProfile(username)
  res.json({
    message: USERS_MESSAGES.GET_USER_PROFILE_SUCCESS,
    result: user
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await usersService.follow(user_id, followed_user_id)
  res.json(result)
}

export const unfollowController = async (
  req: Request<UnfolowReqParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await usersService.unfollow(user_id, followed_user_id)
  res.json(result)
}

// User changes password (after login successfully)
export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)
  res.json(result)
}
