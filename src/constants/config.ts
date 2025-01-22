import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

// console.log(process.argv)

// [
//   'C:\\Program Files\\nodejs\\node.exe',
//   'D:\\Workspace\\NodeJs\\Twitter\\src\\index.ts',
//   '--development'
// ] => node intex.ts --development

// const options = argv(process.argv.slice(2)) // get third element in the above array
// console.log(options)

const env = process.env.NODE_ENV

const envFilename = `.env.${env}`

if (!env) {
  console.log('You have not given NODE_ENV variable (ex: development, production)')
  console.log(`Discover NODE_ENV = ${env}`)
  process.exit(1)
}
console.log(`Discover NODE_ENV = ${env}, therefore app will use environemnt file as ${envFilename}`)

if (!fs.existsSync(path.resolve(envFilename))) {
  console.log(`Can not find environment file ${envFilename}`)
  console.log(
    `Note: App  does not use file .env, for example file .env.development will be used if environemnt is development`
  )
  console.log(`Please create file ${envFilename} and get a reference from .env.example file`)
  process.exit(1)
}

console.log('env', env)

config({
  path: envFilename
})

export const isProduction = env === 'production'

// console.log(options)
// console.log(options.development) // check the dev environment is development ?

export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  host: process.env.HOST as string,

  // Database
  dbName: process.env.DB_NAME as string,
  dbUsername: process.env.DB_USERNAME as string,
  dbPassword: process.env.DB_PASSWORD as string,

  // Collections
  dbUsersCollection: process.env.DB_USERS_COLLECTION as string,
  dbRefreshTokensCollection: process.env.DB_REFRESH_TOKENS_COLLECTION as string,
  dbFollowersCollection: process.env.DB_FOLLOWERS_COLLECTION as string,
  dbTweetsCollection: process.env.DB_TWEETS_COLLECTION as string,
  dbHashtagsCollection: process.env.DB_HASHTAGS_COLLECTION as string,
  dbBookmarksCollection: process.env.DB_BOOKMARKS_COLLECTION as string,
  dbLikesCollection: process.env.DB_LIKES_COLLECTION as string,
  dbMentionsCollection: process.env.DB_MENTIONS_COLLECTION as string,
  dbConversationsCollection: process.env.DB_CONVERSATIONS_COLLECTION as string,

  // For testing optimizing MongoDb
  dbUsersTestCollection: process.env.DB_USERS_TEST_COLLECTION as string,
  dbExtraUsersTestCollection: process.env.DB_EXTRA_USERS_TEST_COLLECTION as string,
  dbTestName: process.env.DB_TEST_NAME as string,

  // Private key to hash password
  passwordSecret: process.env.PASSWORD_SECRET as string,

  // Private Key for jwt
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,

  // Expired time of token
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  emailVerifyTokenExpiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,

  // Google Oauth
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI as string,
  clientRedirectCallback: process.env.CLIENT_REDIRECT_CALLBACK as string,
  clientUrl: process.env.CLIENT_URL as string,

  // AWS SES & S3 (Simple email service and S3)
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  awsRegion: process.env.AWS_REGION as string,
  sesFromAddress: process.env.SES_FROM_ADDRESS as string
}
