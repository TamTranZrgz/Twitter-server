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
import bookmarksRouter from './routes/bookmarks.routes'
import likesRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import cors from 'cors'
import path from 'path'
import './utils/s3'
import { createServer } from 'http'
import { Server } from 'socket.io'
// import '~/utils/fake'

// console.log(path.resolve)
config()

// connect to MongoDb Atlas by mongodb driver
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})

const app = express()

const httpServer = createServer(app)

// Allow requests from http://localhost:3000
app.use(cors())

const port = process.env.PORT || 4000
// console.log(port)

// check and create temp directory to save uploaded files
initFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/search', searchRouter)

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

// socket io
const io = new Server(httpServer, {
  /* options */
  cors: {
    origin: 'http://localhost:3000'
  }
})

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

// io and socket are two different instances
io.on('connection', (socket) => {
  // console.log(socket)
  console.log(`user ${socket.id} connected`)

  // display socket.auth (contain _id of user) from client
  const user_id = socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id
  }
  console.log(users)
  // {
  //   '677ffff9c6e3086a46c01f3a': { socket_id: '_C2MOTZ_6yFJQIoHAAAB' },
  //   '677ffea492da2f05eaab9f26': { socket_id: 'E3IUheSm6lin95sAAAAD' }
  // }

  socket.on('private message', (data) => {
    // data.to => 'to' get from client side => _id
    const receiver_socket_id = users[data.to].socket_id
    socket.to(receiver_socket_id).emit('receive private message', {
      content: data.content,
      from: user_id
    })
  })

  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
    console.log(users)
  })
})

httpServer.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})
