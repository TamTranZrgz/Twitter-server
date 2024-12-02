import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'

// connect to MongoDb Atlas by mongodb driver
databaseService.connect()

const app = express()

const port = 4000

// check and create temp directory to save uploaded files
initFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)

// Error handler for the whole app
// Everytime an error is thorwn, code will run into this error handler
app.use((defaultErrorHandler))
// console.log(typeof defaultErrorHandler);

app.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})
