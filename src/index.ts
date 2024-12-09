import express from 'express'
import { config } from 'dotenv'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import { MongoClient } from 'mongodb'
import tweetsRouter from './routes/tweets.routes'

config()

// connect to MongoDb Atlas by mongodb driver
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
})

const app = express()

const port = process.env.PORT || 4000
// console.log(port)

// check and create temp directory to save uploaded files
initFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)

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

app.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})
