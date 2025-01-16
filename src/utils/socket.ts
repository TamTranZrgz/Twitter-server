import { verifyAccessToken } from '~/utils/commons'
import { UserVerifyStatus } from '~/constants/enum'
import { TokenPayload } from '~/models/requests/User.requests'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { Server } from 'socket.io'
import Conversation from '~/models/schemas/Conversations.schema'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import { Server as ServerHttp } from 'http'

const initSocket = (httpServer: ServerHttp) => {
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

  // middleware socket.io to check if user has permisson to connect to server
  io.use(async (socket, next) => {
    // get Authorizatiom passed from client
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]
    try {
      const decoded_authorization = await verifyAccessToken(access_token)
      const { verify } = decoded_authorization as TokenPayload
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
      }
      //  Pass decoded_authorization to socket to use in other middlewares
      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      // by default, error object will include message and name
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })

  // io and socket here are two different instances, io is the server instance
  io.on('connection', (socket) => {
    // console.log(socket)
    console.log(`user ${socket.id} connected`)

    // display socket.auth (contain _id of user) from client
    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
    users[user_id] = {
      socket_id: socket.id
    }
    console.log(users)
    // {
    //   '677ffff9c6e3086a46c01f3a': { socket_id: '_C2MOTZ_6yFJQIoHAAAB' },
    //   '677ffea492da2f05eaab9f26': { socket_id: 'E3IUheSm6lin95sAAAAD' }
    // }

    // middleware for socket.io
    socket.use(async (packet, next) => {
      // get access_token from socket properties
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
        next()
      } catch {
        next(new Error('Unauthorized'))
      }
    })

    // catch error
    socket.on('error', (err) => {
      // console.log('err', err)
      if (err && err.message === 'Unauthorized') {
        socket.disconnect()
      }
    })

    socket.on('send_message', async (data) => {
      // console.log(data)
      // data.to => 'to' get from client side => _id
      const { receiver_id, sender_id, content } = data.payload
      const receiver_socket_id = users[receiver_id]?.socket_id

      // console.log(content)
      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id as string),
        receiver_id: new ObjectId(receiver_id as string),
        content: content
      })

      const result = await databaseService.conversations.insertOne(conversation)
      // console.log(result)
      conversation._id = result.insertedId // insertedId is de default _id which will create automatically when a new document is created

      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit('receive_message', {
          payload: conversation
        })
      }
    })

    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`user ${socket.id} disconnected`)
      // console.log(users)
    })
  })
}

export default initSocket
