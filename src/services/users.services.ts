import User from '~/models/schemas/User.schema.ts'
import databaseService from './database.services.ts'
import { RegisterReqBody } from '~/models/requests/User.requests.ts'
import { hashPassword } from '~/utils/crypto.ts'
import { signToken } from '~/utils/jwt.ts'
import { TokenType } from '~/constants/enum.ts'

class UsersService {
  // Token services
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  // Register user
  async register(payload: RegisterReqBody) {
    // const { email, password } = payload
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const user_id = result.insertedId.toString()

    // Use asynchonous to optimize performance
    // Will get access_token and refresh_token after run 2 promises
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    return {
      access_token,
      refresh_token
    }
  }

  // Check if email already exist in db
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async login(user_id: ) {

  }
}

const usersService = new UsersService()

export default usersService
