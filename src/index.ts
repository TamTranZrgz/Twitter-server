import express from 'express'
import { config } from 'dotenv'
import { MongoClient, ObjectId } from 'mongodb'
import path from 'path'
import { createServer } from 'http'
import fs from 'fs'

// Swagger API endpoint
import swaggerUI from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import YAML from 'yaml'

// Improve page security
import helmet from 'helmet'
import cors, { CorsOptions } from 'cors'
import { rateLimit } from 'express-rate-limit'

import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likesRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import './utils/s3'
import conversationsRouter from './routes/conversations.routes'
import initSocket from './utils/socket'
import { envConfig, isProduction } from './constants/config'

// import '~/utils/fake'

// console.log(path.resolve)

// const file = fs.readFileSync(path.resolve('twitter-swagger.yaml'), 'utf8')
// const swaggerDocument = YAML.parse(file)

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'X Clone (Twitter API)',
      version: '1.0.0'
    }
  },
  apis: ['./openapi/*.yaml'] // files containing annotations as above
}

const openapiSpecification = swaggerJsdoc(options)

// const swaggerDocument = YAML.parse(file)

config()

// connect to MongoDb Atlas by mongodb driver
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})

const app = express()

// Express Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)

const httpServer = createServer(app)

// Helmet
app.use(helmet())
const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*'
}

// Cors
app.use(cors(corsOptions))

const port = envConfig.port || 4000
// console.log(port)

// check and create temp directory to save uploaded files
initFolder()

app.use(express.json())
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openapiSpecification))
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/search', searchRouter)
app.use('/conversations', conversationsRouter)

// other solution for static files
// using router we can customize
app.use('/static', staticRouter) // for image
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

// static files (ex: images, js files, css files, etc.) -> recommend use absolute path
// app.use(express.static(UPLOAD_IMAGE_DIR)) // D:\Workspace\NodeJs\Twitter\uploads -> uploads is the dir containning images
// app.use('/static', express.static(UPLOAD_IMAGE_DIR)) // add 'static' before image
// console.log(UPLOAD_IMAGE_DIR)

// Error handler for the whole app
// Everytime an error is thorwn, code will run into this error handler
app.use(defaultErrorHandler)
// console.log(typeof defaultErrorHandler);

// initSocket(httpServer)

httpServer.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})
